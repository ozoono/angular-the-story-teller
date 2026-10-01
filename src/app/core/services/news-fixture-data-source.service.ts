import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { NewsDataSource } from '@/core/models/news-data-source.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import {
	toFullNewsDetail,
	newsFixtureDetail,
	toNewsHeadlines,
} from '@/core/services/news-data.mapper.ts'

/** Fetches headlines and full article details from fixture files and validates their responses. */
@Injectable({ providedIn: 'root' })
export class NewsFixtureDataSourceService implements NewsDataSource {
	private readonly http = inject(HttpClient)

	async getCategory(category: NewsTopic) {
		const response = await firstValueFrom(
			this.http.get<unknown>(`/news-fixtures/${category.toLowerCase()}.json`),
		)
		return toNewsHeadlines(response, category)
	}

	async getArticleDetail(category: NewsTopic, uuid: string) {
		const response = await firstValueFrom(
			this.http.get<unknown>(
				`/news-fixtures/${category.toLowerCase()}_data.json`,
			),
		)
		return toFullNewsDetail(newsFixtureDetail(response, uuid), uuid)
	}
}
