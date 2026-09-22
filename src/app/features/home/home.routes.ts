import type { Routes } from '@angular/router'

export const homeRoutes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('@/features/home/home.component.ts').then(
				(module) => module.HomeComponent,
			),
	},
]
