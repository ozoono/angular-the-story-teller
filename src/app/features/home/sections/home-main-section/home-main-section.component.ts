import { Component, computed, inject } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { LeadStoryCardComponent } from '@/shared/ui/news-card/lead-story-card/lead-story-card.component.ts'
import { FeaturedStoryWithTitleListLayoutComponent } from '@/shared/ui/news-layouts/featured-story-with-title-list-layout/featured-story-with-title-list-layout.component.ts'
import { StackedTitleListLayoutComponent } from '@/shared/ui/news-layouts/stacked-title-list-layout/stacked-title-list-layout.component.ts'

@Component({
	selector: 'app-home-main-section',
	imports: [
		LeadStoryCardComponent,
		FeaturedStoryWithTitleListLayoutComponent,
		StackedTitleListLayoutComponent,
	],
	templateUrl: './home-main-section.component.html',
	styleUrl: './home-main-section.component.css',
})
export class HomeMainSectionComponent {
	private readonly newsStore = inject(NewsStore)
	private readonly articles = this.newsStore.articlesFor('BUSINESS')
	private readonly politicalArticles = this.newsStore.articlesFor('POLITICS')

	protected readonly leadArticle = computed(() => {
		const article = this.articleWithDetail(this.articles()[0])

		return article === undefined ? undefined : this.toFeaturedArticle(article)
	})
	protected readonly secondaryArticle = computed(() => {
		const article = this.articleWithDetail(this.articles()[1])

		return article === undefined ? undefined : this.toFeaturedArticle(article)
	})
	protected readonly secondaryTitleArticles = computed(() =>
		this.articles()
			.slice(2, 6)
			.map((article) => this.toReducedArticle(article)),
	)
	protected readonly sidebarTitleArticles = computed(() =>
		this.politicalArticles()
			.slice(0, 4)
			.map((article) => this.toReducedArticle(article)),
	)

	private articleWithDetail(article: NewsArticle | undefined) {
		return article === undefined
			? undefined
			: this.newsStore.articleDetails()[article.id]
	}

	private toFeaturedArticle(article: NewsArticle): NewsArticle {
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

	private toReducedArticle(article: NewsArticle): NewsArticle {
		return {
			id: article.id,
			title: article.title,
			source: article.source,
		}
	}
}
