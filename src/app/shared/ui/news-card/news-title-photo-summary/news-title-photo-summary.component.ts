import { Component, computed, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NewsAuthorComponent } from '@/shared/ui/news-card/news-author.component.ts'
import { NewsCategoryComponent } from '@/shared/ui/news-card/news-category.component.ts'
import { NewsDateComponent } from '@/shared/ui/news-card/news-date.component.ts'
import { NewsHeadlineComponent } from '@/shared/ui/news-card/news-headline.component.ts'
import { NewsSourceComponent } from '@/shared/ui/news-card/news-source.component.ts'

@Component({
	selector: 'app-news-title-photo-summary',
	imports: [
		NewsAuthorComponent,
		NewsCategoryComponent,
		NewsDateComponent,
		NewsHeadlineComponent,
		NewsSourceComponent,
		RouterLink,
	],
	templateUrl: './news-title-photo-summary.component.html',
	styleUrl: './news-title-photo-summary.component.css',
})
export class NewsTitlePhotoSummaryComponent {
	article = input.required<NewsArticle>()

	protected readonly hasTop = computed(() => {
		const { headline, category } = this.article()

		return headline !== undefined || category !== undefined
	})

	protected readonly hasBottom = computed(() => {
		const { date, author, source } = this.article()

		return date !== undefined || author !== undefined || source !== undefined
	})
}
