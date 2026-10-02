import { Component, computed, effect, inject, untracked } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import { CategoryArticlesComponent } from './components/category-articles/category-articles.component.ts'
import { toNewsTopic } from '@/core/utils/news-topic.utils.ts'
import { NewsPageDataService } from '@/core/services/news-page-data.service.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { AdsComponent } from '@/shared/components/ads.component.ts'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'

type CategoryBodyState =
	| { kind: 'loading' }
	| { kind: 'error' }
	| { kind: 'empty' }
	| {
			kind: 'ready'
			article: NewsCardViewModel
			more: NewsCardViewModel[]
	  }

@Component({
	selector: 'app-category',
	imports: [CategoryArticlesComponent, AdsComponent],
	templateUrl: './category.component.html',
	styleUrl: './category.component.css',
})
export class CategoryComponent {
	private readonly route = inject(ActivatedRoute)
	private readonly pageData = inject(NewsPageDataService)
	private readonly newsStore = inject(NewsStore)
	private readonly params = toSignal(this.route.paramMap, {
		initialValue: this.route.snapshot.paramMap,
	})
	protected readonly topic = computed(() =>
		toNewsTopic(this.params().get('category')),
	)
	protected readonly articles = computed(() => {
		const topic = this.topic()
		return topic === undefined ? [] : this.newsStore.articlesFor(topic)()
	})
	protected readonly status = computed(() => {
		const topic = this.topic()
		return topic === undefined ? 'idle' : this.newsStore.statusFor(topic)()
	})
	protected readonly firstArticle = computed(() => this.articles()[0])
	protected readonly moreArticles = computed(() => this.articles().slice(1))
	protected readonly detailStatus = computed(() => {
		const topic = this.topic()
		const first = this.firstArticle()
		return topic === undefined || first === undefined
			? 'idle'
			: this.newsStore.detailStatusFor(topic, first.id)()
	})
	protected readonly bodyState = computed<CategoryBodyState>(() => {
		const status = this.status()
		if (status === 'idle' || status === 'loading') return { kind: 'loading' }
		if (status === 'error') return { kind: 'error' }
		const article = this.firstArticle()
		return article === undefined
			? { kind: 'empty' }
			: { kind: 'ready', article, more: this.moreArticles() }
	})

	constructor() {
		effect(() => {
			const topic = this.topic()
			if (topic !== undefined) {
				untracked(
					() =>
						void this.pageData.loadCategoryPage(topic).catch(() => undefined),
				)
			}
		})
	}

	protected onRetry(): void {
		const topic = this.topic()
		if (topic !== undefined) {
			void this.pageData.loadCategoryPage(topic).catch(() => undefined)
		}
	}
}
