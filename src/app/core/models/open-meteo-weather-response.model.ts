// Fields consumed from the Open-Meteo response; additional fields are ignored.
export interface OpenMeteoWeatherResponse {
	current: {
		temperature_2m: number
		weather_code: number
	}
	current_units: {
		temperature_2m: string
	}
}
