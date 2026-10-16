import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { NewsArticleDetail } from '@/core/models/news/news-article-detail.model.ts'
import type { NewsHeadlineFixture } from '@/core/models/news/news-headline-fixture.model.ts'
import type { NewsTopic } from '@/core/models/news/news-topic.model.ts'
import { toNewsHeadlines } from '@/core/services/news/news-data.mapper.ts'

/** Fetches headlines and full article details from fixture files. */
@Injectable({ providedIn: 'root' })
export class NewsContentService {
	private readonly http = inject(HttpClient)

	async getCategory(category: NewsTopic) {
		const response = await firstValueFrom(
			this.http.get<readonly NewsHeadlineFixture[]>(
				`news-fixtures/${category.toLowerCase()}.json`,
			),
		)
		return toNewsHeadlines(response, category)
	}

	async getCategoryDetails(category: NewsTopic) {
		return await firstValueFrom(
			this.http.get<Record<string, NewsArticleDetail>>(
				`news-fixtures/${category.toLowerCase()}_data.json`,
			),
		)
	}
}
