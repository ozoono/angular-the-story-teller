import { Component, computed, inject } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { HorizontalStoryListLayoutComponent } from '@/shared/ui/news-layouts/horizontal-story-list/horizontal-story-list-layout.component.ts'

@Component({
	selector: 'app-home-sports-section',
	imports: [HorizontalStoryListLayoutComponent],
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

	private toListArticle(article: NewsArticle): NewsArticle {
		return {
			id: article.id,
			title: article.title,
			summary: article.summary,
			photoUrl: article.photoUrl,
			photoAlt: article.photoAlt,
			author: article.author,
			source: article.source,
		}
	}
}
