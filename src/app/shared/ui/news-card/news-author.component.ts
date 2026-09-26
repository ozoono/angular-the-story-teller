import { Component, input } from '@angular/core'

@Component({
	selector: 'app-news-author',
	template: '<p class="news-author">by <span>{{ text() }}</span></p>',
	styles: `
		:host {
			display: block;
		}

		.news-author {
			margin: 0;
			letter-spacing: 0.08em;
			font-family: var(--font-serif-text);
			font-size: 0.75rem;

			> span {
				text-transform: uppercase;
			}
		}
	`,
})
export class NewsAuthorComponent {
	text = input.required<string>()
}
