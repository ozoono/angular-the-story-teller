import { Component, input } from '@angular/core'

@Component({
	selector: 'app-news-headline',
	template: '<p class="news-headline">{{ text() }}</p>',
	styles: `
		:host {
			display: block;
		}

		.news-headline {
			margin: 0;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			font-family: var(--font-sans);
			font-size: 0.75rem;
			font-weight: 700;
			color: var(--color-breaking);
		}
	`,
})
export class NewsHeadlineComponent {
	text = input.required<string>()
}
