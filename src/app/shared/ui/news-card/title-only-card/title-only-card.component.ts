import { Component, computed, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import { NewsAuthorComponent } from '@/shared/ui/news-card/news-author.component.ts'
import { NewsDateComponent } from '@/shared/ui/news-card/news-date.component.ts'
import { NewsSourceComponent } from '@/shared/ui/news-card/news-source.component.ts'

@Component({
	selector: 'app-title-only-card',
	imports: [
		NewsAuthorComponent,
		NewsDateComponent,
		NewsSourceComponent,
		RouterLink,
	],
	templateUrl: './title-only-card.component.html',
	styleUrl: './title-only-card.component.css',
})
export class TitleOnlyCardComponent {
	article = input.required<NewsCardViewModel>()

	protected readonly hasBottom = computed(() => {
		const { date, author, source } = this.article()

		return date !== undefined || author !== undefined || source !== undefined
	})
}
