import type { Provider } from '@angular/core'
import {
	NEWS_DATA_SOURCE,
	newsDataSource,
} from '@/core/config/news-data.config.ts'
import type { NewsDataSourceName } from '@/core/models/news-data-source.model.ts'
import { NewsApiDataSourceService } from '@/core/services/news-api-data-source.service.ts'
import { NewsFixtureDataSourceService } from '@/core/services/news-fixture-data-source.service.ts'

export const provideNewsDataSource = (
	source: NewsDataSourceName = newsDataSource,
): Provider => ({
	provide: NEWS_DATA_SOURCE,
	useExisting:
		source === 'api' ? NewsApiDataSourceService : NewsFixtureDataSourceService,
})
