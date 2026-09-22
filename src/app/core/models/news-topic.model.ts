export const newsTopics = [
	'BUSINESS',
	'ECONOMY',
	'FINANCE',
	'GAMING',
	'HEALTH',
	'MOVIES',
	'NUTRITION',
	'MUSIC',
	'POLITICS',
	'SCIENCE',
	'SPORTS',
	'TECHNOLOGY',
	'TV',
] as const

export type NewsTopic = (typeof newsTopics)[number]
