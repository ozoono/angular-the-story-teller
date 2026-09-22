import type { Routes } from '@angular/router'

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadChildren: () =>
			import('@/features/home/home.routes.ts').then(
				(module) => module.homeRoutes,
			),
	},
	{
		path: 'category/:category',
		loadChildren: () =>
			import('@/features/categoty/category.routes.ts').then(
				(module) => module.categoryRoutes,
			),
	},
	{
		path: 'article/:id',
		loadChildren: () =>
			import('@/features/detail/detail.routes.ts').then(
				(module) => module.detailRoutes,
			),
	},
]
