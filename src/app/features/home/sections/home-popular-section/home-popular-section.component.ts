import { Component, computed, inject } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { PhotoTitleCardGridLayoutComponent } from '@/shared/ui/news-layouts/photo-title-card-grid-layout/photo-title-card-grid-layout.component.ts'

const popularTopics = ['TECHNOLOGY', 'SCIENCE', 'HEALTH', 'NUTRITION'] as const

@Component({
	selector: 'app-home-popular-section',
	imports: [PhotoTitleCardGridLayoutComponent],
	templateUrl: './home-popular-section.component.html',
	styleUrl: './home-popular-section.component.css',
})
export class HomePopularSectionComponent {
	private readonly newsStore = inject(NewsStore)
	private readonly topicArticles = popularTopics.map((topic) =>
		this.newsStore.articlesFor(topic),
	)
	private readonly articleIndexes = popularTopics.map(() =>
		Math.floor(Math.random() * 2),
	)

	protected readonly articles = computed(() =>
		this.topicArticles.flatMap((topicArticles, index) => {
			const article = topicArticles()[this.articleIndexes[index]]

			return article === undefined ? [] : [this.toPopularArticle(article)]
		}),
	)

	private toPopularArticle(article: NewsArticle): NewsArticle {
		return {
			id: article.id,
			title: article.title,
			photoUrl: article.photoUrl,
			photoAlt: article.photoAlt,
			category: article.category,
		}
	}
}
