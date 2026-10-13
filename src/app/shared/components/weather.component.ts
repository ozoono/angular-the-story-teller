import { Component, computed, inject, resource } from '@angular/core'
import {
	WEATHER_CODES,
	WEATHER_CODE_ICONS,
} from '@/core/constants/weather.constants.ts'
import { WeatherApiDataService } from '@/core/services/weather/weather-api-data.service.ts'

@Component({
	selector: 'app-weather',
	template: `
    @if (view(); as data) {
      <div class="weather">
        <div class="weather__row">
          @if (data.icon) {
            <img class="weather__icon" [src]="data.icon" alt="" width="36" height="48" />
          }
          <span>{{ data.temperature }}{{ data.units }}</span>
        </div>
      </div>
    }
  `,
	styles: `
    :host {
      display: block;
    }

    .weather {
			border-radius: .25rem;	
			padding: 0 .3rem;
      font-family: var(--font-sans);
      font-size: 0.85rem;
    }

    .weather__row {
      display: flex;
      align-items: center;

			span {
				line-height: 1;
				font-family: var(--font-sans);
				font-size: .9rem;
			}
    }
  `,
})
export class WeatherComponent {
	private readonly weatherData = inject(WeatherApiDataService)

	protected readonly weather = resource({
		loader: () => this.weatherData.getWeather(),
	})

	protected readonly view = computed(() => {
		if (!this.weather.hasValue()) return undefined
		const data = this.weather.value()

		return {
			...data,
			icon: WEATHER_CODE_ICONS[data.weather],
			description:
				WEATHER_CODES[String(data.weather) as keyof typeof WEATHER_CODES] ?? '',
		}
	})
}
