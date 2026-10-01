import type { NewsTopic } from '@/core/models/news-topic.model.ts'

export const homeNewsTopics = [
	'BUSINESS',
	'POLITICS',
	'FINANCE',
	'SPORTS',
	'MOVIES',
	'TV',
	'MUSIC',
	'GAMING',
	'TECHNOLOGY',
	'SCIENCE',
	'HEALTH',
	'NUTRITION',
] as const satisfies readonly NewsTopic[]

export const homePopularTopics = [
	'TECHNOLOGY',
	'SCIENCE',
	'HEALTH',
	'NUTRITION',
] as const satisfies readonly NewsTopic[]

export const homeFeaturedCounts: Partial<Record<NewsTopic, number>> = {
	BUSINESS: 2,
	SPORTS: 2,
	MOVIES: 1,
	TV: 1,
	MUSIC: 1,
	GAMING: 1,
}
