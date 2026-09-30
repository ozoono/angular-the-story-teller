import { InjectionToken } from '@angular/core'
import type {
	NewsDataSource,
	NewsDataSourceName,
} from '@/core/models/news-data-source.model.ts'

export const newsDataSource: NewsDataSourceName = 'fixtures'

// App providers register the selected adapter under this token.
export const NEWS_DATA_SOURCE = new InjectionToken<NewsDataSource>(
	'NEWS_DATA_SOURCE',
)
