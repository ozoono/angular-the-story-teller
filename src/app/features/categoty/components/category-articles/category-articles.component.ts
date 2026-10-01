import { Component, input, output } from '@angular/core'
import { LeadStoryCardComponent } from '@/shared/ui/news-card/lead-story-card/lead-story-card.component.ts'
import { StackedTitleListLayoutComponent } from '@/shared/ui/news-layouts/stacked-title-list-layout/stacked-title-list-layout.component.ts'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'

type FeaturedDetailStatus = 'idle' | 'loading' | 'loaded' | 'error'

@Component({
	selector: 'app-category-articles',
	imports: [LeadStoryCardComponent, StackedTitleListLayoutComponent],
	templateUrl: './category-articles.component.html',
	styles: `
		:host {
			display: block;
		}

		h3 {
			margin: 3rem 0 2rem;
			padding: 0.3rem;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			font-weight: normal;
			font-size: 0.9rem;
			font-family: var(--font-sans);
			background-color: var(--color-gray-lightest);
		}
	`,
})
export class CategoryArticlesComponent {
	readonly featured = input.required<NewsCardViewModel>()
	readonly more = input.required<NewsCardViewModel[]>()
	readonly featuredDetailStatus = input.required<FeaturedDetailStatus>()
	readonly retry = output<void>()
}
