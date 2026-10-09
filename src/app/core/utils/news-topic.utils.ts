import { NEWS_TOPICS } from '@/core/constants/news-topics.constants.ts'
import type { NewsTopic } from '@/core/models/news/news-topic.model.ts'

export const toNewsTopic = (value: string | null): NewsTopic | undefined =>
	NEWS_TOPICS.find((topic) => topic === value?.toUpperCase())
