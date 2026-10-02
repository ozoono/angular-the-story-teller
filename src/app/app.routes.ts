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
			import('@/features/category/category.routes.ts').then(
				(module) => module.categoryRoutes,
			),
	},
	{
		path: ':category/article/:id',
		loadChildren: () =>
			import('@/features/detail/detail.routes.ts').then(
				(module) => module.detailRoutes,
			),
	},
]
