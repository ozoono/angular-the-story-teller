import { Component, input } from '@angular/core'

@Component({
	selector: 'app-news-author',
	template: '<p class="news-author">{{ text() }}</p>',
	styles: `
		:host {
			display: block;
		}

		.news-author {
			margin: 0;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			font-family: var(--font-sans);
			font-size: 0.75rem;
		}
	`,
})
export class NewsAuthorComponent {
	text = input.required<string>()
}
