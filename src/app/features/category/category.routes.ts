import type { Routes } from '@angular/router'

export const categoryRoutes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('@/features/category/category.component.ts').then(
				(module) => module.CategoryComponent,
			),
	},
]
