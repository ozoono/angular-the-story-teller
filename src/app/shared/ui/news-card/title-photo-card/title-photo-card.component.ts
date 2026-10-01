import { Component, computed, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import { NewsAuthorComponent } from '@/shared/ui/news-card/news-author.component.ts'
import { NewsCategoryComponent } from '@/shared/ui/news-card/news-category.component.ts'
import { NewsDateComponent } from '@/shared/ui/news-card/news-date.component.ts'
import { NewsSourceComponent } from '@/shared/ui/news-card/news-source.component.ts'

@Component({
	selector: 'app-title-photo-card',
	imports: [
		NewsAuthorComponent,
		NewsCategoryComponent,
		NewsDateComponent,
		NewsSourceComponent,
		RouterLink,
	],
	templateUrl: './title-photo-card.component.html',
	styleUrl: './title-photo-card.component.css',
})
export class TitlePhotoCardComponent {
	article = input.required<NewsCardViewModel>()

	protected readonly hasTop = computed(() => {
		const { category } = this.article()

		return category !== undefined
	})

	protected readonly hasBottom = computed(() => {
		const { date, author, source } = this.article()

		return date !== undefined || author !== undefined || source !== undefined
	})
}
