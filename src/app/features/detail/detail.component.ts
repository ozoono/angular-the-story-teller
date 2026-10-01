import { HttpErrorResponse } from '@angular/common/http'
import { Component, computed, effect, inject, untracked } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { NewsAuthorComponent } from '@/shared/ui/news-card/news-author.component.ts'
import { NewsSourceComponent } from '@/shared/ui/news-card/news-source.component.ts'
import { NewsArticleNotFoundError } from '@/core/models/news-article-not-found-error.model.ts'
import { toNewsTopic } from '@/core/utils/news-topic.utils.ts'
import { NewsPageDataService } from '@/core/services/news-page-data.service.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { toNewsDetailViewModel } from '@/shared/mappers/news-view.mapper.ts'

@Component({
	selector: 'app-detail',
	imports: [RouterLink, NewsAuthorComponent, NewsSourceComponent],
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
	constructor() {
		effect(() => {
			const topic = this.topic()
			const uuid = this.uuid()
			if (topic !== undefined && uuid) {
				untracked(
					() =>
						void this.pageData
							.loadArticlePage(topic, uuid)
							.catch(() => undefined),
				)
			}
		})
	}

	protected retry(): void {
		const topic = this.topic()
		const uuid = this.uuid()
		if (topic !== undefined && uuid) {
			void this.pageData.loadArticlePage(topic, uuid).catch(() => undefined)
		}
	}
}
