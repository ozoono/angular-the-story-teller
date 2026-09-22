import type { HttpInterceptorFn } from '@angular/common/http'
import { newsApiBaseUrl, newsApiKey } from '@/core/config/news-api.config.ts'

export const newsApiKeyInterceptor: HttpInterceptorFn = (request, next) => {
	if (!request.url.startsWith(newsApiBaseUrl)) {
		return next(request)
	}

	return next(
		request.clone({
			setHeaders: {
				Accept: 'application/json',
				'x-api-key': newsApiKey,
			},
		}),
	)
}
