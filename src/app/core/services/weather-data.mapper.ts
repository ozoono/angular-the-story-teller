import type { IpApiLocationResponse } from '@/core/models/ip-api-location-response.model.ts'
import type { OpenMeteoWeatherResponse } from '@/core/models/open-meteo-weather-response.model.ts'
import type { Location, Weather } from '@/core/models/weather.model.ts'

const responseRecord = (
	value: unknown,
	path: string,
): Record<string, unknown> => {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error(`Invalid ${path}: expected an object`)
	}
	return value as Record<string, unknown>
}

const responseNumber = (value: unknown, path: string): number => {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new Error(`Invalid ${path}: expected a finite number`)
	}
	return value
}

const responseString = (value: unknown, path: string): string => {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new Error(`Invalid ${path}: expected a non-empty string`)
	}
	return value
}

const locationRecord = (value: unknown): IpApiLocationResponse => {
	const {
		latitude: latitudeValue,
		longitude: longitudeValue,
		timezone,
	} = responseRecord(value, 'ipapi response')
	const latitude = responseNumber(latitudeValue, 'ipapi.latitude')
	const longitude = responseNumber(longitudeValue, 'ipapi.longitude')
	if (latitude < -90 || latitude > 90) {
		throw new Error(
			'Invalid ipapi.latitude: expected a value between -90 and 90',
		)
	}
	if (longitude < -180 || longitude > 180) {
		throw new Error(
			'Invalid ipapi.longitude: expected a value between -180 and 180',
		)
	}
	return {
		latitude,
		longitude,
		timezone: responseString(timezone, 'ipapi.timezone'),
	}
}

const weatherRecord = (value: unknown): OpenMeteoWeatherResponse => {
	const { current, current_units: units } = responseRecord(
		value,
		'Open-Meteo response',
	)
	const { temperature_2m: temperature, weather_code: code } = responseRecord(
		current,
		'Open-Meteo.current',
	)
	const { temperature_2m: temperatureUnits } = responseRecord(
		units,
		'Open-Meteo.current_units',
	)
	const weatherCode = responseNumber(code, 'Open-Meteo.current.weather_code')
	if (!Number.isInteger(weatherCode) || weatherCode < 0) {
		throw new Error(
			'Invalid Open-Meteo.current.weather_code: expected a non-negative integer',
		)
	}
	return {
		current: {
			temperature_2m: responseNumber(
				temperature,
				'Open-Meteo.current.temperature_2m',
			),
			weather_code: weatherCode,
		},
		current_units: {
			temperature_2m: responseString(
				temperatureUnits,
				'Open-Meteo.current_units.temperature_2m',
			),
		},
	}
}

export const locationResponseData = (response: unknown): Location => {
	const location = locationRecord(response)
	return {
		latitude: location.latitude,
		longitude: location.longitude,
		timezone: location.timezone,
	}
}

export const weatherResponseData = (response: unknown): Weather => {
	const weather = weatherRecord(response)
	return {
		temperature: weather.current.temperature_2m,
		weather: weather.current.weather_code,
		units: weather.current_units.temperature_2m,
	}
}
