import type { NewsArticleDetail } from '@/core/models/news/news-article-detail.model.ts'
import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'
import type { NewsHeadline } from '@/core/models/news/news-headline.model.ts'
import type { NewsTopic } from '@/core/models/news/news-topic.model.ts'
import type { NewsDetailViewModel } from '@/shared/view-models/news-detail-view.model.ts'

export const toNewsCardViewModel = (
	headline: NewsHeadline,
	detail?: NewsArticleDetail,
): NewsCardViewModel => ({
	id: headline.id,
	title: detail?.title ?? headline.title,
	category: headline.category,
	date: detail?.published_at ?? headline.date,
	source: detail?.publisher ?? headline.source,
	author: (detail?.authors ?? headline.authors).join(', ') || undefined,
	summary: detail?.incipit,
	photoUrl: detail?.thumbnail,
})

export const toNewsDetailViewModel = (
	detail: NewsArticleDetail,
	category: NewsTopic,
): NewsDetailViewModel => ({
	id: detail.uuid,
	title: detail.title,
	category,
	date: detail.published_at,
	source: detail.publisher,
	author: detail.authors.join(', ') || undefined,
	summary: detail.incipit,
	photoUrl: detail.thumbnail,
	photoAlt: detail.title,
	body: detail.body,
	paragraphs: detail.body
		.split(/\n\s*\n/)
		.filter((paragraph) => paragraph.trim()),
	originalUrl: detail.original_url,
	topics: detail.topics,
})
