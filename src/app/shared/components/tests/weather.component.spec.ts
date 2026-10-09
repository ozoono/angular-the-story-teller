import { TestBed } from '@angular/core/testing'
import type { Weather } from '@/core/models/weather/weather.model.ts'
import { WeatherApiDataService } from '@/core/services/weather/weather-api-data.service.ts'
import { WeatherComponent } from '@/shared/components/weather.component.ts'

describe('WeatherComponent', () => {
	it('loads once and displays the temperature, SVG and specific description', async () => {
		let resolve!: (weather: Weather) => void
		const getWeather = vi.fn(
			() =>
				new Promise<Weather>((done) => {
					resolve = done
				}),
		)
		TestBed.configureTestingModule({
			providers: [{ provide: WeatherApiDataService, useValue: { getWeather } }],
		})
		const fixture = TestBed.createComponent(WeatherComponent)
		fixture.detectChanges()
		expect(fixture.nativeElement.querySelector('.weather')).toBeNull()
		await vi.waitFor(() => expect(getWeather).toHaveBeenCalledTimes(1))
		resolve({ temperature: 13.8, weather: 61, units: '°C' })
		await fixture.whenStable()
		fixture.detectChanges()
		expect(fixture.nativeElement.textContent).toContain('13.8°C')
		expect(fixture.nativeElement.textContent).toContain('Slight rain')
		expect(
			fixture.nativeElement.querySelector('img')?.getAttribute('src'),
		).toBe('/images/weather/rain.svg')
		expect(getWeather).toHaveBeenCalledTimes(1)
	})

	it('renders nothing when the request fails', async () => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: WeatherApiDataService,
					useValue: {
						getWeather: vi.fn().mockRejectedValue(new Error('Failed')),
					},
				},
			],
		})
		const fixture = TestBed.createComponent(WeatherComponent)
		fixture.detectChanges()
		await fixture.whenStable()
		fixture.detectChanges()
		expect(fixture.nativeElement.textContent.trim()).toBe('')
		expect(fixture.nativeElement.querySelector('.weather')).toBeNull()
		expect(fixture.nativeElement.querySelector('img')).toBeNull()
	})
})
