import { Component, computed, inject } from '@angular/core'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { StorySummaryListLayoutComponent } from '@/shared/ui/news-layouts/story-summary-list-layout/story-summary-list-layout.component.ts'

@Component({
	selector: 'app-home-sports-section',
	imports: [StorySummaryListLayoutComponent],
	templateUrl: './home-sports-section.component.html',
	styleUrl: './home-sports-section.component.css',
})
export class HomeSportsSectionComponent {
	private readonly newsStore = inject(NewsStore)
	private readonly articles = this.newsStore.articlesFor('SPORTS')

	protected readonly listArticles = computed(() =>
		this.articles()
			.slice(0, 2)
			.map((article) => this.toListArticle(article)),
	)

	private toListArticle(article: NewsCardViewModel): NewsCardViewModel {
		return {
			id: article.id,
			category: article.category,
			title: article.title,
			summary: article.summary,
			photoUrl: article.photoUrl,
			photoAlt: article.photoAlt,
			author: article.author,
			source: article.source,
		}
	}
}
