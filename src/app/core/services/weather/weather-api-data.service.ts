import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { locationUrl, weatherUrl } from '@/core/config/weather-api.config.ts'
import type { IpApiLocationResponse } from '@/core/models/weather/ip-api-location-response.model.ts'
import type { OpenMeteoWeatherResponse } from '@/core/models/weather/open-meteo-weather-response.model.ts'
import {
	locationResponseData,
	weatherResponseData,
} from '@/core/services/weather/weather-data.mapper.ts'

/** Fetches the IP-based location and its current weather conditions. */
@Injectable({ providedIn: 'root' })
export class WeatherApiDataService {
	private readonly http = inject(HttpClient)

	async getLocation() {
		const response = await firstValueFrom(
			this.http.get<IpApiLocationResponse>(locationUrl),
		)
		return locationResponseData(response)
	}

	async getWeather() {
		const location = await this.getLocation()
		const params = {
			latitude: location.latitude,
			longitude: location.longitude,
			current: 'temperature_2m,weather_code',
			timezone: location.timezone,
		}
		const response = await firstValueFrom(
			this.http.get<OpenMeteoWeatherResponse>(weatherUrl, { params }),
		)
		return weatherResponseData(response)
	}
}
