import { Component, input } from '@angular/core'

@Component({
	selector: 'app-news-category',
	template: '<p class="news-category">{{ text() }}</p>',
	styles: `
		:host {
			display: block;
		}

		.news-category {
			margin: 0;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			font-family: var(--font-sans);
			font-size: 0.75rem;
			font-weight: 700;
		}
	`,
})
export class NewsCategoryComponent {
	text = input.required<string>()
}
