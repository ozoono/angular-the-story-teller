import { Component, computed, inject } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { NewsTitlePhotoSummaryComponent } from '@/shared/ui/news-card/news-title-photo-summary/news-title-photo-summary.component.ts'
import { PhotoTitleListLayoutComponent } from '@/shared/ui/news-layouts/photo-title-list/photo-title-list-layout.component.ts'
import { TitleListLayoutComponent } from '@/shared/ui/news-layouts/title-list/title-list-layout.component.ts'

@Component({
	selector: 'app-home-main-section',
	imports: [
		NewsTitlePhotoSummaryComponent,
		PhotoTitleListLayoutComponent,
		TitleListLayoutComponent,
	],
	templateUrl: './home-main-section.component.html',
	styleUrl: './home-main-section.component.css',
})
export class HomeMainSectionComponent {
	private readonly newsStore = inject(NewsStore)
	private readonly articles = this.newsStore.articlesFor('BUSINESS')

	protected readonly leadArticle = computed(() =>
		this.articleWithDetail(this.articles()[0]),
	)
	protected readonly secondaryArticle = computed(() =>
		this.articleWithDetail(this.articles()[1]),
	)
	protected readonly secondaryTitleArticles = computed(() =>
		this.articles().slice(2, 5),
	)
	protected readonly sidebarTitleArticles = computed(() =>
		this.articles().slice(5, 8),
	)

	private articleWithDetail(article: NewsArticle | undefined) {
		return article === undefined
			? undefined
			: this.newsStore.articleDetails()[article.id]
	}
}
