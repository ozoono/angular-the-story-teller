import type { Routes } from '@angular/router'

export const detailRoutes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('@/features/detail/detail.component.ts').then(
				(module) => module.DetailComponent,
			),
	},
]
