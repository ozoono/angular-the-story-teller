import type { NewsArticleDetail } from '@/core/models/news-article-detail.model.ts'
import type { NewsHeadline } from '@/core/models/news-headline.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'

export type NewsDataSourceName = 'api' | 'fixtures'

// Both adapters return the same models and preserve all article detail fields.
export interface NewsDataSource {
	getCategory(category: NewsTopic): Promise<readonly NewsHeadline[]>
	getArticleDetail(
		category: NewsTopic,
		uuid: string,
	): Promise<NewsArticleDetail>
}
