import { Component, computed, inject } from '@angular/core'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { FeaturedStoryWithTitleListLayoutComponent } from '@/shared/ui/news-layouts/featured-story-with-title-list-layout/featured-story-with-title-list-layout.component.ts'

@Component({
	selector: 'app-home-entertainment-section',
	imports: [FeaturedStoryWithTitleListLayoutComponent],
	templateUrl: './home-entertainment-section.component.html',
	styleUrl: './home-entertainment-section.component.css',
})
export class HomeEntertainmentSectionComponent {
	private readonly newsStore = inject(NewsStore)

	private readonly moviesArticles = this.newsStore.articlesFor('MOVIES')
	private readonly tvArticles = this.newsStore.articlesFor('TV')
	private readonly musicArticles = this.newsStore.articlesFor('MUSIC')
	private readonly gamingArticles = this.newsStore.articlesFor('GAMING')

	protected readonly featuredMoviesArticle = computed(() => {
		const article = this.moviesArticles()[0]

		return article === undefined ? undefined : this.toFeaturedArticle(article)
	})

	protected readonly listMoviesArticles = computed(() =>
		this.moviesArticles()
			.slice(1, 4)
			.map((article) => this.toSecondaryArticle(article)),
	)

	protected readonly featuredTvArticle = computed(() => {
		const article = this.tvArticles()[0]

		return article === undefined ? undefined : this.toFeaturedArticle(article)
	})

	protected readonly listTvArticles = computed(() =>
		this.tvArticles()
			.slice(1, 4)
			.map((article) => this.toSecondaryArticle(article)),
	)

	protected readonly featuredMusicArticle = computed(() => {
		const article = this.musicArticles()[0]

		return article === undefined ? undefined : this.toFeaturedArticle(article)
	})

	protected readonly listMusicArticles = computed(() =>
		this.musicArticles()
			.slice(1, 4)
			.map((article) => this.toSecondaryArticle(article)),
	)

	protected readonly featuredGamingArticle = computed(() => {
		const article = this.gamingArticles()[0]

		return article === undefined ? undefined : this.toFeaturedArticle(article)
	})

	protected readonly listGamingArticles = computed(() =>
		this.gamingArticles()
			.slice(1, 4)
			.map((article) => this.toSecondaryArticle(article)),
	)

	private toFeaturedArticle(article: NewsArticle): NewsArticle {
		return {
			id: article.id,
			title: article.title,
			photoUrl: article.photoUrl,
			photoAlt: article.photoAlt,
			category: article.category,
			author: article.author,
			source: article.source,
		}
	}

	private toSecondaryArticle(article: NewsArticle): NewsArticle {
		return {
			id: article.id,
			title: article.title,
		}
	}
}
