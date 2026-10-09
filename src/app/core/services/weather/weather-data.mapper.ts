import type { IpApiLocationResponse } from '@/core/models/weather/ip-api-location-response.model.ts'
import type { OpenMeteoWeatherResponse } from '@/core/models/weather/open-meteo-weather-response.model.ts'
import type { Location, Weather } from '@/core/models/weather/weather.model.ts'

export const locationResponseData = (
	location: IpApiLocationResponse,
): Location => {
	return {
		latitude: location.latitude,
		longitude: location.longitude,
		timezone: location.timezone,
	}
}

export const weatherResponseData = (
	weather: OpenMeteoWeatherResponse,
): Weather => {
	return {
		temperature: weather.current.temperature_2m,
		weather: weather.current.weather_code,
		units: weather.current_units.temperature_2m,
	}
}
