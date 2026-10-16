import type { Routes } from '@angular/router'

export const detailRoutes: Routes = [
	{
		path: '',
		loadComponent: async () =>
			(await import('@/features/detail/detail.component.ts')).DetailComponent,
	},
]
