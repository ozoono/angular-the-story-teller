import { inject, Injectable, Injector, type Signal } from '@angular/core'
import { httpResource } from '@angular/common/http'
import { newsDetailUrl } from '@/core/config/news-api.config.ts'
import { toNewsDetail } from '@/core/services/news-api.mapper.ts'

@Injectable({ providedIn: 'root' })
export class NewsDetailService {
	private readonly injector = inject(Injector)

	detail(id: Signal<string | undefined>) {
		return httpResource(
			() => {
				const articleId = id()

				return articleId === undefined
					? undefined
					: { url: newsDetailUrl, params: { uuid: articleId } }
			},
			{
				injector: this.injector,
				parse: toNewsDetail,
			},
		)
	}
}
