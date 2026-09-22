import { inject, Injectable, Injector, type Signal } from '@angular/core'
import { httpResource } from '@angular/common/http'
import {
	defaultNewsLanguage,
	newsListUrl,
} from '@/core/config/news-api.config.ts'
import { toNewsArticles } from '@/core/services/news-api.mapper.ts'

@Injectable({ providedIn: 'root' })
export class NewsCategoryService {
	private readonly injector = inject(Injector)

	list(category: Signal<string | undefined>) {
		return httpResource(
			() => {
				const categoryValue = category()

				return categoryValue === undefined
					? undefined
					: {
							url: newsListUrl,
							params: {
								language: defaultNewsLanguage,
								topic: categoryValue.toLowerCase(),
							},
						}
			},
			{
				defaultValue: [],
				injector: this.injector,
				parse: toNewsArticles,
			},
		)
	}
}
