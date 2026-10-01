import { Component, computed, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import { NewsAuthorComponent } from '@/shared/ui/news-card/news-author.component.ts'
import { NewsDateComponent } from '@/shared/ui/news-card/news-date.component.ts'
import { NewsSourceComponent } from '@/shared/ui/news-card/news-source.component.ts'

@Component({
	selector: 'app-story-summary-card',
	imports: [
		NewsAuthorComponent,
		NewsDateComponent,
		NewsSourceComponent,
		RouterLink,
	],
	templateUrl: './story-summary-card.component.html',
	styleUrl: './story-summary-card.component.css',
})
export class StorySummaryCardComponent {
	article = input.required<NewsCardViewModel>()

	protected readonly hasBottom = computed(() => {
		const { date, author, source } = this.article()

		return date !== undefined || author !== undefined || source !== undefined
	})
}
