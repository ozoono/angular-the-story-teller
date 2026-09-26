import { computed, inject, Injectable, signal } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import { NewsContentService } from '@/core/services/news-content.service.ts'

type NewsTopicLoadStatus = 'idle' | 'loading' | 'loaded' | 'error'
type NewsTopicSource = 'api' | 'fixture'

interface NewsTopicState {
	articles: readonly NewsArticle[]
	source?: NewsTopicSource
	status: NewsTopicLoadStatus
}

type NewsTopicStates = Partial<Record<NewsTopic, NewsTopicState>>
interface NewsTopicLoadResult {
	articles: NewsArticle[]
	source: NewsTopicSource
}

@Injectable({ providedIn: 'root' })
export class NewsStore {
	private readonly newsContent = inject(NewsContentService)
	// Cached topic articles, keyed by category.
	private readonly topicStatesState = signal<NewsTopicStates>({})
	// Full articles fetched on demand, keyed by UUID.
	private readonly articleDetailsState = signal<Record<string, NewsArticle>>({})
	// In-flight requests are shared by concurrent consumers.
	private readonly pendingTopicLoads = new Map<
		NewsTopic,
		Promise<NewsArticle[]>
	>()
	private readonly pendingDetailLoads = new Map<string, Promise<NewsArticle>>()

	readonly topicStates = this.topicStatesState.asReadonly()
	readonly articleDetails = this.articleDetailsState.asReadonly()

	// Selects the cached articles for a topic.
	articlesFor(topic: NewsTopic) {
		return computed(() => this.topicStatesState()[topic]?.articles ?? [])
	}

	// Selects the current fixture loading state for a topic.
	statusFor(topic: NewsTopic) {
		return computed(() => this.topicStatesState()[topic]?.status ?? 'idle')
	}

	// Selects a cached full article detail by UUID.
	articleFor(id: string) {
		return computed(() => this.articleDetailsState()[id])
	}

	// Loads BUSINESS from the API and all other topics from fixtures.
	async loadTopic(topic: NewsTopic): Promise<NewsArticle[]> {
		const currentState = this.topicStatesState()[topic]

		if (currentState?.status === 'loaded') {
			return [...currentState.articles]
		}

		const pendingLoad = this.pendingTopicLoads.get(topic)

		if (pendingLoad !== undefined) {
			return pendingLoad
		}

		this.setTopicState(topic, {
			articles: currentState?.articles ?? [],
			status: 'loading',
		})

		const load = this.loadTopicArticles(topic)
			.then(({ articles, source }) => {
				this.cacheFixtureDetails(articles)
				this.setTopicState(topic, { articles, source, status: 'loaded' })

				return articles
			})
			.catch((error: unknown) => {
				this.setTopicState(topic, {
					articles: currentState?.articles ?? [],
					status: 'error',
				})

				throw error
			})
			.finally(() => this.pendingTopicLoads.delete(topic))

		this.pendingTopicLoads.set(topic, load)

		return load
	}

	// Loads every home topic and enriches the two featured BUSINESS articles.
	async initTopics(topics: readonly NewsTopic[]): Promise<void> {
		const topicLoads = topics.map((topic) => this.loadTopic(topic))
		const businessTopicIndex = topics.indexOf('BUSINESS')

		if (businessTopicIndex !== -1) {
			try {
				const businessArticles = await topicLoads[businessTopicIndex]

				if (this.topicStatesState().BUSINESS?.source === 'api') {
					await Promise.allSettled(
						businessArticles
							.slice(0, 2)
							.map((article) => this.loadDetail(article.id)),
					)
				}
			} catch {
				// Ignored, loadTopic handles error state
			}
		}

		await Promise.allSettled(topicLoads)
	}

	// Loads and caches a full article detail by UUID.
	async loadDetail(id: string): Promise<NewsArticle> {
		const cachedDetail = this.articleDetailsState()[id]

		if (cachedDetail !== undefined && cachedDetail.body !== undefined) {
			return cachedDetail
		}

		const pendingLoad = this.pendingDetailLoads.get(id)

		if (pendingLoad !== undefined) {
			return pendingLoad
		}

		const load = this.newsContent
			.loadDetail(id)
			.then((detail) => {
				this.articleDetailsState.update((details) => ({
					...details,
					[id]: detail,
				}))

				return detail
			})
			.catch(async (error) => {
				if (cachedDetail !== undefined) {
					return cachedDetail
				}
				throw error
			})
			.finally(() => this.pendingDetailLoads.delete(id))

		this.pendingDetailLoads.set(id, load)
		return load
	}

	private setTopicState(topic: NewsTopic, state: NewsTopicState): void {
		this.topicStatesState.update((states) => ({ ...states, [topic]: state }))
	}

	private cacheFixtureDetails(articles: NewsArticle[]): void {
		const details = articles.filter((article) => article.body !== undefined)

		if (details.length === 0) {
			return
		}

		this.articleDetailsState.update((cachedDetails) => ({
			...cachedDetails,
			...Object.fromEntries(details.map((article) => [article.id, article])),
		}))
	}

	private loadTopicArticles(topic: NewsTopic): Promise<NewsTopicLoadResult> {
		if (topic !== 'BUSINESS') {
			return this.newsContent.loadFixture(topic).then((articles) => ({
				articles,
				source: 'fixture',
			}))
		}

		return this.newsContent
			.loadBusinessList()
			.then((articles) => {
				if (articles.length === 0) {
					throw new Error('No articles returned from API')
				}
				return { articles, source: 'api' as const }
			})
			.catch(() =>
				this.newsContent.loadFixture(topic).then((articles) => ({
					articles,
					source: 'fixture' as const,
				})),
			)
	}
}
