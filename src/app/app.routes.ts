import type { Routes } from '@angular/router'

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadChildren: async () =>
			(await import('@/features/home/home.routes.ts')).homeRoutes,
	},
	{
		path: 'category/:category',
		loadChildren: async () =>
			(await import('@/features/category/category.routes.ts')).categoryRoutes,
	},
	{
		path: ':category/article/:id',
		loadChildren: async () =>
			(await import('@/features/detail/detail.routes.ts')).detailRoutes,
	},
]
