import {
	type ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from '@angular/core'
import { provideHttpClient } from '@angular/common/http'
import { provideRouter, withInMemoryScrolling } from '@angular/router'
import { routes } from '@/app.routes.ts'

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideHttpClient(),
		provideRouter(
			routes,
			withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
		),
	],
}
