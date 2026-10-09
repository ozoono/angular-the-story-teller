import type { NewsTopic } from '@/core/models/news/news-topic.model.ts'

export const HOME_NEWS_TOPICS = [
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

export const HOME_POPULAR_TOPICS = [
	'TECHNOLOGY',
	'SCIENCE',
	'HEALTH',
	'NUTRITION',
] as const satisfies readonly NewsTopic[]

export const HOME_FEATURED_COUNTS: Partial<Record<NewsTopic, number>> = {
	BUSINESS: 2,
	SPORTS: 2,
	MOVIES: 1,
	TV: 1,
	MUSIC: 1,
	GAMING: 1,
}
