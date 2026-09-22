import type { NewsArticle } from '@/core/models/news-article.model.ts'

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

const getData = (value: Record<string, unknown>): unknown =>
	Object.getOwnPropertyDescriptor(value, 'data')?.value

const toOptionalString = (
	record: Record<string, unknown>,
	key: string,
): string | undefined => {
	const value = record[key]

	return typeof value === 'string' ? value : undefined
}

const toRequiredString = (
	record: Record<string, unknown>,
	key: string,
): string => {
	const value = toOptionalString(record, key)

	if (value === undefined) {
		throw new Error(`A news article requires ${key}`)
	}

	return value
}

const toStringArray = (
	record: Record<string, unknown>,
	key: string,
): string[] => {
	const value = record[key]

	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === 'string')
		: []
}

const toNewsArticle = (response: Record<string, unknown>): NewsArticle => {
	return {
		id: toRequiredString(response, 'uuid'),
		title: toRequiredString(response, 'title'),
		date: toOptionalString(response, 'published_at'),
		summary: toOptionalString(response, 'incipit'),
		photoUrl: toOptionalString(response, 'thumbnail'),
		category: toStringArray(response, 'topics')[0],
		author: toStringArray(response, 'authors').join(', ') || undefined,
		source: toOptionalString(response, 'publisher'),
		body: toOptionalString(response, 'body'),
		originalUrl: toOptionalString(response, 'original_url'),
	}
}

export const toNewsArticles = (response: unknown): NewsArticle[] => {
	if (!isRecord(response)) {
		throw new Error('Invalid news list response')
	}

	const articles = getData(response)

	if (!Array.isArray(articles)) {
		throw new Error('Invalid news list response')
	}

	return articles.map((article) => {
		if (!isRecord(article)) {
			throw new Error('Invalid news list article')
		}

		return toNewsArticle(article)
	})
}

export const toNewsDetail = (response: unknown): NewsArticle => {
	if (!isRecord(response)) {
		throw new Error('Invalid news detail response')
	}

	const article = getData(response)

	if (!isRecord(article)) {
		throw new Error('Invalid news detail response')
	}

	return toNewsArticle(article)
}
