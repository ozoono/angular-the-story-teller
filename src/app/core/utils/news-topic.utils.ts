import { newsTopics } from '@/core/constants/news-topics.constants.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'

export const toNewsTopic = (value: string | null): NewsTopic | undefined =>
	newsTopics.find((topic) => topic === value?.toUpperCase())
