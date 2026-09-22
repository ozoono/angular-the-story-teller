import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config.ts'
import { App } from './app/app.component.ts'

bootstrapApplication(App, appConfig).catch((err) => console.error(err))
