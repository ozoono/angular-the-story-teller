import type { NewsTopic } from '@/core/models/news-topic.model.ts'

/** Presentation data consumed by news cards and layouts. */
export interface NewsCardViewModel {
	id: string
	title: string
	date?: string
	summary?: string
	photoUrl?: string
	photoAlt?: string
	category?: NewsTopic
	author?: string
	source?: string
}
