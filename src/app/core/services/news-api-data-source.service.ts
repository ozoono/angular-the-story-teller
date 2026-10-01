import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
	defaultNewsLanguage,
	newsDetailUrl,
	newsListUrl,
} from '@/core/config/news-api.config.ts'
import type { NewsDataSource } from '@/core/models/news-data-source.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import {
	newsResponseData,
	toFullNewsDetail,
	toNewsHeadlines,
} from '@/core/services/news-data.mapper.ts'

/** Fetches headlines and full article details from the API and validates its responses. */
@Injectable({ providedIn: 'root' })
export class NewsApiDataSourceService implements NewsDataSource {
	private readonly http = inject(HttpClient)

	async getCategory(category: NewsTopic) {
		const response = await firstValueFrom(
			this.http.get<unknown>(newsListUrl, {
				params: {
					language: defaultNewsLanguage,
					topic: category.toLowerCase(),
				},
			}),
		)
		return toNewsHeadlines(newsResponseData(response), category)
	}

	async getArticleDetail(_category: NewsTopic, uuid: string) {
		const response = await firstValueFrom(
			this.http.get<unknown>(newsDetailUrl, { params: { uuid } }),
		)
		return toFullNewsDetail(newsResponseData(response), uuid)
	}
}
