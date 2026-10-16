import { HttpErrorResponse } from '@angular/common/http'
import { Component, computed, effect, inject, untracked } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import { ArticleContentComponent } from '@/features/detail/components/article-content/article-content.component.ts'
import { NewsArticleNotFoundError } from '@/core/models/news/news-article-not-found-error.model.ts'
import { toNewsTopic } from '@/core/utils/news-topic.utils.ts'
import type { NewsTopic } from '@/core/models/news/news-topic.model.ts'
import { NewsPageDataService } from '@/core/services/news/news-page-data.service.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { toNewsDetailViewModel } from '@/shared/mappers/news-view.mapper.ts'
import { AdsComponent } from '@/shared/components/ads.component.ts'
import type { NewsDetailViewModel } from '@/shared/view-models/news-detail-view.model.ts'

type DetailViewState =
	| { kind: 'not-found' }
	| { kind: 'loading' }
	| { kind: 'error' }
	| { kind: 'ready'; article: NewsDetailViewModel }

@Component({
	selector: 'app-detail',
	imports: [ArticleContentComponent, AdsComponent],
	templateUrl: './detail.component.html',
	styleUrl: './detail.component.css',
})
export class DetailComponent {
	private readonly route = inject(ActivatedRoute)
	private readonly pageData = inject(NewsPageDataService)
	private readonly newsStore = inject(NewsStore)
	private readonly params = toSignal(this.route.paramMap, {
		initialValue: this.route.snapshot.paramMap,
	})
	protected readonly topic = computed(() =>
		toNewsTopic(this.params().get('category')),
	)
	protected readonly uuid = computed(() => this.params().get('id'))
	protected readonly article = computed(() => {
		const topic = this.topic()
		const uuid = this.uuid()
		if (topic === undefined || !uuid) return undefined
		const detail = this.newsStore.articleFor(topic, uuid)()
		return detail === undefined
			? undefined
			: toNewsDetailViewModel(detail, topic)
	})
	protected readonly status = computed(() => {
		const topic = this.topic()
		const uuid = this.uuid()
		return topic === undefined || !uuid
			? 'idle'
			: this.newsStore.detailStatusFor(topic, uuid)()
	})
	protected readonly notFound = computed(() => {
		const topic = this.topic()
		const uuid = this.uuid()
		if (topic === undefined || !uuid) return true
		const error = this.newsStore.detailErrorFor(topic, uuid)()
		return (
			error instanceof NewsArticleNotFoundError ||
			(error instanceof HttpErrorResponse && error.status === 404)
		)
	})
	protected readonly viewState = computed<DetailViewState>(() => {
		if (this.notFound()) return { kind: 'not-found' }
		if (this.status() === 'error') return { kind: 'error' }
		const article = this.article()
		return article === undefined
			? { kind: 'loading' }
			: { kind: 'ready', article }
	})

	constructor() {
		effect(() => {
			const topic = this.topic()
			const uuid = this.uuid()
			if (topic !== undefined && uuid) {
				untracked(() => void this.loadPage(topic, uuid))
			}
		})
	}

	protected async onRetry(): Promise<void> {
		const topic = this.topic()
		const uuid = this.uuid()
		if (topic !== undefined && uuid) {
			await this.loadPage(topic, uuid)
		}
	}

	private async loadPage(topic: NewsTopic, uuid: string): Promise<void> {
		try {
			await this.pageData.loadArticlePage(topic, uuid)
		} catch {
			// The store exposes the error to the template.
		}
	}
}
