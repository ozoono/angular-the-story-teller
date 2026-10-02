import { Component } from '@angular/core'

@Component({
	selector: 'app-ads',
	template:
		'<div class="ads"><p class="ads__label">Advertisement</p><div class="ads__content"></div></div>',
	styles: `
		:host {
			display: block;
		}

    .ads {
      padding: 10px;
      display: block;
      max-width: 300px;
      margin: 0 auto;
      background-color: var(--color-gray-light);
    }

		.ads__label {
			margin: 0 0 5px 0;
			letter-spacing: 0.08em;
			font-family: var(--font-sans);
			font-size: 0.75rem;
		}
		.ads__content {
			width: 100%;
			height: 200px;
			border: 1px solid var(--color-gray);
			background-color: var(--color-white);
    }
	`,
})
export class AdsComponent {}
