import { inject, Injectable, signal } from '@angular/core'
import {
	homeFeaturedCounts,
	homeNewsTopics,
	homePopularTopics,
} from '@/core/constants/home-news.constants.ts'
import type { NewsHeadline } from '@/core/models/news-headline.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'

type HomeDetailSelections = Partial<Record<NewsTopic, readonly string[]>>

/** Coordinates page data loading and selects the home articles that need full details. */
@Injectable({ providedIn: 'root' })
export class NewsPageDataService {
	private readonly newsStore = inject(NewsStore)
	private readonly homeDetailSelectionsState = signal<HomeDetailSelections>({})
	private pendingHomeLoad?: Promise<void>

	// These UUIDs also drive the view, so it displays the articles requested here.
	readonly homeDetailSelections = this.homeDetailSelectionsState.asReadonly()

	loadHome(): Promise<void> {
		if (this.pendingHomeLoad !== undefined) {
			return this.pendingHomeLoad
		}
		const load = Promise.allSettled(
			homeNewsTopics.map(async (topic) => {
				const headlines = await this.newsStore.loadTopic(topic)
				const selectedIds = this.selectHomeDetails(topic, headlines)
				await Promise.allSettled(
					selectedIds.map((uuid) => this.newsStore.loadDetail(topic, uuid)),
				)
			}),
		)
			.then(() => undefined)
			.finally(() => {
				this.pendingHomeLoad = undefined
			})
		this.pendingHomeLoad = load
		return load
	}

	async loadCategoryPage(topic: NewsTopic): Promise<void> {
		const headlines = await this.newsStore.loadTopic(topic)
		const first = headlines[0]
		if (first !== undefined) {
			await this.newsStore.loadDetail(topic, first.id)
		}
	}

	loadArticlePage(topic: NewsTopic, uuid: string) {
		return this.newsStore.loadDetail(topic, uuid)
	}

	private selectHomeDetails(
		topic: NewsTopic,
		headlines: readonly NewsHeadline[],
	): readonly string[] {
		const previous = this.homeDetailSelectionsState()[topic]
		if (previous?.every((uuid) => headlines.some((item) => item.id === uuid))) {
			return previous
		}
		let selected: readonly NewsHeadline[]
		if (homePopularTopics.some((popularTopic) => popularTopic === topic)) {
			const candidates = headlines.slice(0, 2)
			const article = candidates[Math.floor(Math.random() * candidates.length)]
			selected = article === undefined ? [] : [article]
		} else {
			selected = headlines.slice(0, homeFeaturedCounts[topic] ?? 0)
		}
		const ids = selected.map((article) => article.id)
		this.homeDetailSelectionsState.update((selections) => ({
			...selections,
			[topic]: ids,
		}))
		return ids
	}
}
