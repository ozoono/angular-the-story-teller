import type { newsTopics } from '@/core/constants/news-topics.constants.ts'

export type NewsTopic = (typeof newsTopics)[number]
