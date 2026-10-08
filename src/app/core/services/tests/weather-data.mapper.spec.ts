import { describe, expect, it } from 'vitest'
import type { OpenMeteoWeatherResponse } from '@/core/models/open-meteo-weather-response.model.ts'
import {
	locationResponseData,
	weatherResponseData,
} from '@/core/services/weather-data.mapper.ts'

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
		expect(locationResponseData({ ...location, city: 'Madrid' })).toEqual(
			location,
		)
		expect(weatherResponseData({ ...weather, elevation: 650 })).toEqual({
			temperature: 18.5,
			weather: 3,
			units: '°C',
		})
	})

	it.each([null, [], 'invalid', { error: true }])(
		'rejects invalid location responses: %j',
		(response) => {
			expect(() => locationResponseData(response)).toThrow(/ipapi/)
		},
	)

	it.each([
		['latitude', undefined],
		['latitude', '40.4'],
		['latitude', Number.NaN],
		['latitude', 91],
		['longitude', Number.POSITIVE_INFINITY],
		['longitude', -181],
		['timezone', null],
		['timezone', '  '],
	])('identifies an invalid location field: %s = %j', (field, value) => {
		expect(() => locationResponseData({ ...location, [field]: value })).toThrow(
			`ipapi.${field}`,
		)
	})

	it.each([null, [], {}, { current: null }, { current: [] }])(
		'rejects invalid weather structures: %j',
		(response) => {
			expect(() => weatherResponseData(response)).toThrow(/Open-Meteo/)
		},
	)

	it.each([
		['temperature_2m', undefined],
		['temperature_2m', '18.5'],
		['temperature_2m', Number.POSITIVE_INFINITY],
		['weather_code', null],
		['weather_code', -1],
		['weather_code', 1.5],
	])('identifies an invalid current weather field: %s = %j', (field, value) => {
		expect(() =>
			weatherResponseData({
				...weather,
				current: { ...weather.current, [field]: value },
			}),
		).toThrow(`Open-Meteo.current.${field}`)
	})

	it.each([undefined, null, [], {}, { temperature_2m: '' }])(
		'rejects missing or invalid temperature units: %j',
		(currentUnits) => {
			expect(() =>
				weatherResponseData({
					...weather,
					current_units: currentUnits,
				}),
			).toThrow(/Open-Meteo.current_units/)
		},
	)
})
