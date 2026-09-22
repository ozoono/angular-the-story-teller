import {
	type ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from '@angular/core'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideRouter } from '@angular/router'
import { routes } from '@/app.routes.ts'
import { newsApiKeyInterceptor } from '@/core/interceptors/news-api-key.interceptor.ts'

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(withInterceptors([newsApiKeyInterceptor])),
		provideRouter(routes),
	],
}
