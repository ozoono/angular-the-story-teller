import type { Routes } from '@angular/router'

export const homeRoutes: Routes = [
	{
		path: '',
		loadComponent: async () =>
			(await import('@/features/home/home.component.ts')).HomeComponent,
	},
]
