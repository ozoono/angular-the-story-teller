import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
	defaultNewsLanguage,
	newsDetailUrl,
	newsListUrl,
} from '@/core/config/news-api.config.ts'
import type { NewsArticle } from '@/core/models/news-article.model.ts'
import { NEWS_DATA_SOURCE } from '@/core/config/news-data.config.ts'
import type { NewsDataSource } from '@/core/models/news-data-source.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import {
	toNewsArticles,
	toNewsDetail,
} from '@/core/services/news-api.mapper.ts'

@Injectable({ providedIn: 'root' })
export class NewsContentService implements NewsDataSource {
	private readonly http = inject(HttpClient)
	private readonly dataSource = inject(NEWS_DATA_SOURCE)

	getCategory(category: NewsTopic) {
		return this.dataSource.getCategory(category)
	}

	getArticleDetail(category: NewsTopic, uuid: string) {
		return this.dataSource.getArticleDetail(category, uuid)
	}

	loadBusinessList(): Promise<NewsArticle[]> {
		return firstValueFrom(
			this.http.get<unknown>(newsListUrl, {
				params: {
					language: defaultNewsLanguage,
					topic: 'business',
				},
			}),
		).then(toNewsArticles)
	}

	loadFixture(topic: NewsTopic): Promise<NewsArticle[]> {
		return firstValueFrom(
			this.http.get<NewsArticle[]>(
				`/news-fixtures/${topic.toLowerCase()}.json`,
			),
		)
	}

	loadDetail(id: string): Promise<NewsArticle> {
		return firstValueFrom(
			this.http.get<unknown>(newsDetailUrl, { params: { uuid: id } }),
		).then(toNewsDetail)
	}
}
