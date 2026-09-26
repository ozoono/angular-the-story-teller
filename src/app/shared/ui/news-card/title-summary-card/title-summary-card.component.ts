import { Component, computed, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsAuthorComponent } from '@/shared/ui/news-card/news-author.component.ts'
import { NewsCategoryComponent } from '@/shared/ui/news-card/news-category.component.ts'
import { NewsDateComponent } from '@/shared/ui/news-card/news-date.component.ts'
import { NewsSourceComponent } from '@/shared/ui/news-card/news-source.component.ts'

@Component({
	selector: 'app-title-summary-card',
	imports: [
		NewsAuthorComponent,
		NewsCategoryComponent,
		NewsDateComponent,
		NewsSourceComponent,
		RouterLink,
	],
	templateUrl: './title-summary-card.component.html',
	styleUrl: './title-summary-card.component.css',
})
export class TitleSummaryCardComponent {
	article = input.required<NewsArticle>()

	protected readonly hasTop = computed(() => {
		const { category } = this.article()

		return category !== undefined
	})

	protected readonly hasBottom = computed(() => {
		const { date, author, source } = this.article()

		return date !== undefined || author !== undefined || source !== undefined
	})
}
