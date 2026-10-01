import { Component, input } from '@angular/core'

@Component({
	selector: 'app-news-label',
	template: '<p class="news-label">{{ text() }}</p>',
	styles: `
		:host {
			display: inline-block;
		}

		.news-label {
			margin: 0;
			padding: 5px;
			border-radius: 5px;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			font-family: var(--font-sans);
			font-size: 0.75rem;
			font-weight: 700;
			color: var(--color-white);
			background-color: var(--color-gray-light);
			display: inline-block;
		}
	`,
})
export class NewsLabelComponent {
	text = input.required<string>()
}
