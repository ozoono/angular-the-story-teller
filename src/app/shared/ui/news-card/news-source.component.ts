import { Component, input } from '@angular/core'

@Component({
	selector: 'app-news-source',
	template: '<p class="news-source"><i>({{ text() }})</i></p>',
	styles: `
		:host {
			display: block;
		}

		.news-source {
			margin: 0;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			font-family: var(--font-serif-text);
			font-size: 0.75rem;
		}
	`,
})
export class NewsSourceComponent {
	text = input.required<string>()
}
