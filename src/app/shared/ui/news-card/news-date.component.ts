import { Component, input } from '@angular/core'

@Component({
	selector: 'app-news-date',
	template: '<time class="news-date">{{ date() }}</time>',
	styles: `
		:host {
			display: block;
		}

		.news-date {
			margin: 0;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			font-family: var(--font-serif-text);
			font-size: 0.75rem;
		}
	`,
})
export class NewsDateComponent {
	date = input.required<string>()
}
