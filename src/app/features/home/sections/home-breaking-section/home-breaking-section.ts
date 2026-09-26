import { Component, computed, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NewsStore } from '@/core/stores/news.store.ts'

@Component({
	selector: 'app-home-breaking-section',
	imports: [RouterLink],
	templateUrl: './home-breaking-section.html',
	styleUrl: './home-breaking-section.css',
})
export class HomeBreakingSectionComponent {
	private readonly newsStore = inject(NewsStore)
	private readonly financeArticles = this.newsStore.articlesFor('FINANCE')

	protected readonly breakingArticle = computed(() => this.financeArticles()[0])
}
