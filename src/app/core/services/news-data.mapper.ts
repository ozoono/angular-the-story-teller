import type { NewsArticleDetail } from '@/core/models/news-article-detail.model.ts'
import { NewsArticleNotFoundError } from '@/core/models/news-article-not-found-error.model.ts'
import type { NewsHeadline } from '@/core/models/news-headline.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'

type NewsRecord = Record<string, unknown> &
	Partial<Record<keyof NewsArticleDetail | 'data', unknown>>

const record = (value: unknown): NewsRecord => {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error('Invalid news data')
	}
	return value as NewsRecord
}

const string = (value: unknown, field: string): string => {
	if (typeof value !== 'string') {
		throw new Error(`Invalid news field: ${field}`)
	}
	return value
}

const strings = (value: unknown, field: string): string[] => {
	if (
		!Array.isArray(value) ||
		!value.every((item) => typeof item === 'string')
	) {
		throw new Error(`Invalid news field: ${field}`)
	}
	return value
}

export const newsResponseData = (response: unknown): unknown =>
	record(response).data

export const toNewsHeadlines = (
	value: unknown,
	category: NewsTopic,
): readonly NewsHeadline[] => {
	if (!Array.isArray(value)) {
		throw new Error('Invalid news headlines')
	}
	return value.map((item) => {
		const article = record(item)
		return {
			id: string(article.uuid, 'uuid'),
			title: string(article.title, 'title'),
			source: string(article.publisher, 'publisher'),
			authors: strings(article.authors ?? [], 'authors'),
			category,
			...(article.published_at === undefined
				? {}
				: { date: string(article.published_at, 'published_at') }),
		}
	})
}

export const toFullNewsDetail = (
	value: unknown,
	uuid: string,
): NewsArticleDetail => {
	const article = record(value)
	const detail: NewsArticleDetail = {
		...article,
		uuid: string(article.uuid, 'uuid'),
		title: string(article.title, 'title'),
		thumbnail: string(article.thumbnail, 'thumbnail'),
		publisher: string(article.publisher, 'publisher'),
		authors: strings(article.authors, 'authors'),
		topics: strings(article.topics, 'topics'),
		published_at: string(article.published_at, 'published_at'),
		original_url: string(article.original_url, 'original_url'),
		incipit: string(article.incipit, 'incipit'),
		body: string(article.body, 'body'),
		countries:
			article.countries === undefined
				? undefined
				: strings(article.countries, 'countries'),
		languages:
			article.languages === undefined
				? undefined
				: strings(article.languages, 'languages'),
	}
	if (detail.uuid !== uuid) {
		throw new Error(`Unexpected news UUID: ${detail.uuid}`)
	}
	return detail
}

export const newsFixtureDetail = (response: unknown, uuid: string): unknown => {
	const details = record(response)
	if (!Object.hasOwn(details, uuid)) {
		throw new NewsArticleNotFoundError(uuid)
	}
	return details[uuid]
}
