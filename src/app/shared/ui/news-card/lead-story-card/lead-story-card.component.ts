import { Component, computed, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import { NewsAuthorComponent } from '@/shared/ui/news-card/news-author.component.ts'
import { NewsSourceComponent } from '@/shared/ui/news-card/news-source.component.ts'

@Component({
	selector: 'app-lead-story-card',
	imports: [NewsAuthorComponent, NewsSourceComponent, RouterLink],
	templateUrl: './lead-story-card.component.html',
	styleUrl: './lead-story-card.component.css',
})
export class LeadStoryCardComponent {
	article = input.required<NewsCardViewModel>()

	protected readonly hasBottom = computed(() => {
		const { date, author, source } = this.article()

		return date !== undefined || author !== undefined || source !== undefined
	})
}
