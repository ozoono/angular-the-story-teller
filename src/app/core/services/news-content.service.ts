import { inject, Injectable } from '@angular/core'
import { NEWS_DATA_SOURCE } from '@/core/config/news-data.config.ts'
import type { NewsDataSource } from '@/core/models/news-data-source.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'

/** Delegates headline and article detail operations to the configured data source. */
@Injectable({ providedIn: 'root' })
export class NewsContentService implements NewsDataSource {
	private readonly dataSource = inject(NEWS_DATA_SOURCE)

	getCategory(category: NewsTopic) {
		return this.dataSource.getCategory(category)
	}

	getArticleDetail(category: NewsTopic, uuid: string) {
		return this.dataSource.getArticleDetail(category, uuid)
	}
}
