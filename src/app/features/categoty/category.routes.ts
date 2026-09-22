import type { Routes } from '@angular/router'

export const categoryRoutes: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('@/features/categoty/category.component.ts').then(
				(module) => module.CategoryComponent,
			),
	},
]
