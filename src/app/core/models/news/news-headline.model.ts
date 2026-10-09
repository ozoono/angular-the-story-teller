import type { NewsTopic } from '@/core/models/news/news-topic.model.ts'

export interface NewsHeadline {
	id: string
	title: string
	source: string
	authors: readonly string[]
	category: NewsTopic
	date?: string
}
