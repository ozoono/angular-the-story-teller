import type { Routes } from '@angular/router'

export const categoryRoutes: Routes = [
	{
		path: '',
		loadComponent: async () =>
			(await import('@/features/category/category.component.ts'))
				.CategoryComponent,
	},
]
