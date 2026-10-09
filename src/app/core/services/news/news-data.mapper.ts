import type { NewsArticleDetail } from '@/core/models/news/news-article-detail.model.ts'
import { NewsArticleNotFoundError } from '@/core/models/news/news-article-not-found-error.model.ts'
import type { NewsHeadlineFixture } from '@/core/models/news/news-headline-fixture.model.ts'
import type { NewsHeadline } from '@/core/models/news/news-headline.model.ts'
import type { NewsTopic } from '@/core/models/news/news-topic.model.ts'

export const toNewsHeadlines = (
	articles: readonly NewsHeadlineFixture[],
	category: NewsTopic,
): readonly NewsHeadline[] =>
	articles.map((article) => ({
		id: article.uuid,
		title: article.title,
		source: article.publisher,
		authors: article.authors ?? [],
		category,
		...(article.published_at === undefined
			? {}
			: { date: article.published_at }),
	}))

export const newsFixtureDetail = (
	details: Record<string, NewsArticleDetail>,
	uuid: string,
): NewsArticleDetail => {
	if (!Object.hasOwn(details, uuid)) {
		throw new NewsArticleNotFoundError(uuid)
	}
	return details[uuid]
}