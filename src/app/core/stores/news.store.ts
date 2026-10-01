import { computed, inject, Injectable, signal } from '@angular/core'
import type { NewsArticleDetail } from '@/core/models/news-article-detail.model.ts'
import type { NewsHeadline } from '@/core/models/news-headline.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import { NewsContentService } from '@/core/services/news-content.service.ts'
import { toNewsCardViewModel } from '@/shared/mappers/news-view.mapper.ts'

type NewsLoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface NewsTopicState {
	headlines: readonly NewsHeadline[]
	status: NewsLoadStatus
	error?: unknown
}

interface NewsDetailState {
	article?: NewsArticleDetail
	status: NewsLoadStatus
	error?: unknown
}

type NewsTopicStates = Partial<Record<NewsTopic, NewsTopicState>>
type NewsDetailStates = Partial<Record<string, NewsDetailState>>

const detailKey = (topic: NewsTopic, uuid: string) => `${topic}:${uuid}`

@Injectable({ providedIn: 'root' })
export class NewsStore {
	private readonly newsContent = inject(NewsContentService)
	private readonly topicStatesState = signal<NewsTopicStates>({})
	private readonly detailStatesState = signal<NewsDetailStates>({})
	private readonly pendingTopicLoads = new Map<
		NewsTopic,
		Promise<readonly NewsHeadline[]>
	>()
	private readonly pendingDetailLoads = new Map<
		string,
		Promise<NewsArticleDetail>
	>()

	readonly topicStates = this.topicStatesState.asReadonly()
	readonly detailStates = this.detailStatesState.asReadonly()

	headlinesFor(topic: NewsTopic) {
		return computed(() => this.topicStatesState()[topic]?.headlines ?? [])
	}

	// Presentation is derived; cached headlines and full details stay separate.
	articlesFor(topic: NewsTopic) {
		return computed(() =>
			(this.topicStatesState()[topic]?.headlines ?? []).map((headline) =>
				toNewsCardViewModel(
					headline,
					this.detailStatesState()[detailKey(topic, headline.id)]?.article,
				),
			),
		)
	}

	statusFor(topic: NewsTopic) {
		return computed(() => this.topicStatesState()[topic]?.status ?? 'idle')
	}

	errorFor(topic: NewsTopic) {
		return computed(() => this.topicStatesState()[topic]?.error)
	}

	articleFor(topic: NewsTopic, uuid: string) {
		return computed(
			() => this.detailStatesState()[detailKey(topic, uuid)]?.article,
		)
	}

	detailStatusFor(topic: NewsTopic, uuid: string) {
		return computed(
			() => this.detailStatesState()[detailKey(topic, uuid)]?.status ?? 'idle',
		)
	}

	detailErrorFor(topic: NewsTopic, uuid: string) {
		return computed(
			() => this.detailStatesState()[detailKey(topic, uuid)]?.error,
		)
	}

	loadTopic(topic: NewsTopic): Promise<readonly NewsHeadline[]> {
		const currentState = this.topicStatesState()[topic]
		if (currentState?.status === 'loaded') {
			return Promise.resolve(currentState.headlines)
		}
		const pending = this.pendingTopicLoads.get(topic)
		if (pending !== undefined) {
			return pending
		}
		this.setTopicState(topic, {
			headlines: currentState?.headlines ?? [],
			status: 'loading',
		})
		const load = this.newsContent
			.getCategory(topic)
			.then((headlines) => {
				this.setTopicState(topic, { headlines, status: 'loaded' })
				return headlines
			})
			.catch((error: unknown) => {
				this.setTopicState(topic, {
					headlines: currentState?.headlines ?? [],
					status: 'error',
					error,
				})
				throw error
			})
			.finally(() => this.pendingTopicLoads.delete(topic))
		this.pendingTopicLoads.set(topic, load)
		return load
	}

	loadDetail(topic: NewsTopic, uuid: string): Promise<NewsArticleDetail> {
		const key = detailKey(topic, uuid)
		const currentState = this.detailStatesState()[key]
		if (
			currentState?.status === 'loaded' &&
			currentState.article !== undefined
		) {
			return Promise.resolve(currentState.article)
		}
		const pending = this.pendingDetailLoads.get(key)
		if (pending !== undefined) {
			return pending
		}
		this.setDetailState(key, { status: 'loading' })
		const load = this.newsContent
			.getArticleDetail(topic, uuid)
			.then((article) => {
				this.setDetailState(key, { article, status: 'loaded' })
				return article
			})
			.catch((error: unknown) => {
				this.setDetailState(key, { status: 'error', error })
				throw error
			})
			.finally(() => this.pendingDetailLoads.delete(key))
		this.pendingDetailLoads.set(key, load)
		return load
	}

	private setTopicState(topic: NewsTopic, state: NewsTopicState): void {
		this.topicStatesState.update((states) => ({ ...states, [topic]: state }))
	}

	private setDetailState(key: string, state: NewsDetailState): void {
		this.detailStatesState.update((states) => ({ ...states, [key]: state }))
	}
}
