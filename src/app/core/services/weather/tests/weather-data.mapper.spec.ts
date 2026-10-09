import { describe, expect, it } from 'vitest'
import type { OpenMeteoWeatherResponse } from '@/core/models/weather/open-meteo-weather-response.model.ts'
import {
	locationResponseData,
	weatherResponseData,
} from '@/core/services/weather/weather-data.mapper.ts'

const location = { latitude: 40.4, longitude: -3.7, timezone: 'Europe/Madrid' }
const weather: OpenMeteoWeatherResponse = {
	current: { temperature_2m: 18.5, weather_code: 3 },
	current_units: { temperature_2m: '°C' },
}

describe('weather response mapping', () => {
	it('maps the complete Open-Meteo response', () => {
		const response = {
			latitude: 52.512604,
			longitude: 13.419517,
			generationtime_ms: 103.102207183838,
			utc_offset_seconds: 0,
			timezone: 'GMT',
			timezone_abbreviation: 'GMT',
			elevation: 38,
			current_units: {
				time: 'iso8601',
				interval: 'seconds',
				temperature_2m: '°C',
				weather_code: 'wmo code',
			},
			current: {
				time: '2026-10-08T15:00',
				interval: 900,
				temperature_2m: 13.8,
				weather_code: 61,
			},
		}
		expect(weatherResponseData(response)).toEqual({
			temperature: 13.8,
			weather: 61,
			units: '°C',
		})
	})

	it('accepts additional provider fields without exposing them internally', () => {
		const locationResponse = { ...location, city: 'Madrid' }
		const weatherResponse = { ...weather, elevation: 650 }
		expect(locationResponseData(locationResponse)).toEqual(location)
		expect(weatherResponseData(weatherResponse)).toEqual({
			temperature: 18.5,
			weather: 3,
			units: '°C',
		})
	})
})
