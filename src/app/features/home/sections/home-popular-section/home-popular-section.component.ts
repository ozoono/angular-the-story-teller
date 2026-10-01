import { Component, computed, inject } from '@angular/core'
import { homePopularTopics } from '@/core/constants/home-news.constants.ts'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import { NewsPageDataService } from '@/core/services/news-page-data.service.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { PhotoTitleCardGridLayoutComponent } from '@/shared/ui/news-layouts/photo-title-card-grid-layout/photo-title-card-grid-layout.component.ts'

@Component({
	selector: 'app-home-popular-section',
	imports: [PhotoTitleCardGridLayoutComponent],
	templateUrl: './home-popular-section.component.html',
	styleUrl: './home-popular-section.component.css',
})
export class HomePopularSectionComponent {
	private readonly newsStore = inject(NewsStore)
	private readonly pageData = inject(NewsPageDataService)
	private readonly topicArticles = homePopularTopics.map((topic) =>
		this.newsStore.articlesFor(topic),
	)

	protected readonly articles = computed(() =>
		this.topicArticles.flatMap((topicArticles, index) => {
			const selectedId =
				this.pageData.homeDetailSelections()[homePopularTopics[index]]?.[0]
			const article = topicArticles().find((item) => item.id === selectedId)

			return article === undefined ? [] : [this.toPopularArticle(article)]
		}),
	)

	private toPopularArticle(article: NewsCardViewModel): NewsCardViewModel {
		return {
			id: article.id,
			title: article.title,
			photoUrl: article.photoUrl,
			photoAlt: article.photoAlt,
			category: article.category,
			source: article.source,
		}
	}
}
