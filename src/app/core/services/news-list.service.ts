import { inject, Injectable, Injector } from '@angular/core'
import { httpResource } from '@angular/common/http'
import {
	defaultNewsLanguage,
	defaultNewsTopic,
	newsListUrl,
} from '@/core/config/news-api.config.ts'
import { toNewsArticles } from '@/core/services/news-api.mapper.ts'

@Injectable({ providedIn: 'root' })
export class NewsListService {
	private readonly injector = inject(Injector)

	list() {
		return httpResource(
			() => ({
				url: newsListUrl,
				params: {
					language: defaultNewsLanguage,
					topic: defaultNewsTopic,
				},
			}),
			{
				defaultValue: [],
				injector: this.injector,
				parse: toNewsArticles,
			},
		)
	}
}
