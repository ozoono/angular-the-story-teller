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
