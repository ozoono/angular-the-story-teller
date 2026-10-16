import { Component, input, computed } from '@angular/core'
import { ADS } from '@/core/constants/ads.constants.ts'

@Component({
	selector: 'app-ads',
	template: `<div class="ads"><p class="ads__label">Advertisement</p>
		<div class="ads__content">
			<a [href]="url()" target="_blank" rel="noopener">
				<img [src]="img()" alt="Ads">
			</a>
		</div>
	</div>`,
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
			border: 1px solid var(--color-gray);
			background-color: var(--color-white);
  	}
	`,
})
export class AdsComponent {
	readonly bannerType = input.required<'square' | 'skyscraper'>()
	readonly articleId = input<string>()
	readonly category = input<string>()

	private readonly ads = computed(() => {
		this.category()
		this.articleId()

		return ADS.filter((ad) => ad.type === this.bannerType())
	})
	private readonly index = computed(() =>
		Math.floor(Math.random() * this.ads().length),
	)
	protected readonly url = computed(() => this.ads()[this.index()]?.url || '#')
	protected readonly img = computed(
		() => `images/ads/${this.ads()[this.index()]?.img}`,
	)
}
