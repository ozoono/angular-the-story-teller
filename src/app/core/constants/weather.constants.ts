export const WEATHER_CODES = {
	'0': 'Clear sky',
	'1': 'Mainly clear',
	'2': 'Partly cloudy',
	'3': 'Overcast',
	'45': 'Fog',
	'48': 'Depositing rime fog',
	'51': 'Light drizzle',
	'53': 'Moderate drizzle',
	'55': 'Dense drizzle',
	'56': 'Light freezing drizzle',
	'57': 'Dense freezing drizzle',
	'61': 'Slight rain',
	'63': 'Moderate rain',
	'65': 'Heavy rain',
	'66': 'Light freezing rain',
	'67': 'Heavy freezing rain',
	'71': 'Slight snowfall',
	'73': 'Moderate snowfall',
	'75': 'Heavy snowfall',
	'77': 'Snow grains',
	'80': 'Slight rain showers',
	'81': 'Moderate rain showers',
	'82': 'Violent rain showers',
	'85': 'Slight snow showers',
	'86': 'Heavy snow showers',
	'95': 'Thunderstorm',
	'96': 'Thunderstorm with slight hail',
	'97': 'Heavy thunderstorm',
	'99': 'Thunderstorm with heavy hail',
} as const

// Codes in each group share an icon; WEATHER_CODES keeps their individual labels.
export const WEATHER_ICON_GROUPS = {
	clear: [0, 1],
	cloudy: [2, 3],
	fog: [45, 48],
	rain: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
	snow: [71, 73, 75, 77, 85, 86],
	thunderstorm: [95, 96, 97, 99],
} as const

export const WEATHER_ICONS = {
	clear: '/images/weather/clear.svg',
	cloudy: '/images/weather/cloudy.svg',
	fog: '/images/weather/fog.svg',
	rain: '/images/weather/rain.svg',
	snow: '/images/weather/snow.svg',
	thunderstorm: '/images/weather/thunderstorm.svg',
} as const

export const WEATHER_CODE_ICONS: Readonly<Record<number, string | undefined>> =
	Object.fromEntries(
		Object.entries(WEATHER_ICONS).flatMap(([group, icon]) =>
			WEATHER_ICON_GROUPS[group as keyof typeof WEATHER_ICON_GROUPS].map(
				(code) => [code, icon],
			),
		),
	)
