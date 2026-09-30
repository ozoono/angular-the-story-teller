import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { NewsDataSource } from '@/core/models/news-data-source.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import {
	toFullNewsDetail,
	toNewsDetailIndex,
	toNewsHeadlines,
} from '@/core/services/news-data.mapper.ts'

@Injectable({ providedIn: 'root' })
export class NewsFixtureDataSourceService implements NewsDataSource {
	private readonly http = inject(HttpClient)
	private readonly detailIndexes = new Map<
		NewsTopic,
		Promise<Record<string, unknown>>
	>()

	async getCategory(category: NewsTopic) {
		const response = await firstValueFrom(
			this.http.get<unknown>(`/news-fixtures/${category.toLowerCase()}.json`),
		)
		return toNewsHeadlines(response, category)
	}

	async getArticleDetail(category: NewsTopic, uuid: string) {
		const details = await this.getDetailIndex(category)
		if (!Object.hasOwn(details, uuid)) {
			throw new Error(`News article not found: ${uuid}`)
		}
		return toFullNewsDetail(details[uuid], uuid)
	}

	private getDetailIndex(
		category: NewsTopic,
	): Promise<Record<string, unknown>> {
		const cached = this.detailIndexes.get(category)
		if (cached !== undefined) {
			return cached
		}
		const load = firstValueFrom(
			this.http.get<unknown>(
				`/news-fixtures/${category.toLowerCase()}_data.json`,
			),
		)
			.then(toNewsDetailIndex)
			.catch((error: unknown) => {
				this.detailIndexes.delete(category)
				throw error
			})
		this.detailIndexes.set(category, load)
		return load
	}
}
