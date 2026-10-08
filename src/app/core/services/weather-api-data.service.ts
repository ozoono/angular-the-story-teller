import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { locationUrl, weatherUrl } from '@/core/config/weather-api.config.ts'
import {
	locationResponseData,
	weatherResponseData,
} from '@/core/services/weather-data.mapper.ts'

@Injectable({ providedIn: 'root' })
export class WeatherApiDataService {
	private readonly http = inject(HttpClient)

	async getLocation() {
		const response = await firstValueFrom(this.http.get<unknown>(locationUrl))
		return locationResponseData(response)
	}

	async getWeather() {
		const location = await this.getLocation()
		const today = new Date().toISOString().split('T')[0]
		const params = {
			latitude: location.latitude,
			longitude: location.longitude,
			current: 'temperature_2m,weather_code',
			start_date: today,
			end_date: today,
			timezone: location.timezone,
		}
		const response = await firstValueFrom(
			this.http.get<unknown>(weatherUrl, { params }),
		)
		return weatherResponseData(response)
	}
}
