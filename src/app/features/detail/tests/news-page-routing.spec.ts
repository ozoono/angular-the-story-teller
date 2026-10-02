import { provideHttpClient } from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { routes } from '@/app.routes.ts'
import { newsDetailUrl } from '@/core/config/news-api.config.ts'
import { provideNewsDataSource } from '@/core/config/news-data.providers.ts'
import type { NewsDataSourceName } from '@/core/models/news-data-source.model.ts'
import { NewsPageDataService } from '@/core/services/news-page-data.service.ts'
import { NewsStore } from '@/core/stores/news.store.ts'
import { CategoryComponent } from '@/features/category/category.component.ts'
import { DetailComponent } from '@/features/detail/detail.component.ts'

const first = {
	uuid: 'first',
	title: 'First headline',
	publisher: 'Publisher',
	authors: ['Author'],
}
const second = { ...first, uuid: 'second', title: 'Second headline' }
const detail = {
	...first,
	title: 'First full article',
	thumbnail: '/photo.jpg',
	topics: ['sports'],
	published_at: '2026-09-19',
	original_url: 'https://example.com/article',
	incipit: 'Summary',
	body: 'Full body paragraph',
}

const setup = async (source: NewsDataSourceName = 'fixtures') => {
	TestBed.configureTestingModule({
		providers: [
			provideHttpClient(),
			provideHttpClientTesting(),
			provideNewsDataSource(source),
			provideRouter(routes),
		],
	})
	return {
		harness: await RouterTestingHarness.create(),
		http: TestBed.inject(HttpTestingController),
		pages: TestBed.inject(NewsPageDataService),
		store: TestBed.inject(NewsStore),
	}
}

describe('Category and article routes', () => {
	afterEach(() => TestBed.inject(HttpTestingController).verify())

	it('loads category headlines then the first detail, and reuses it on navigation', async () => {
		const { harness, http, pages, store } = await setup()
		await harness.navigateByUrl('/category/sports', CategoryComponent)
		http.expectOne('/news-fixtures/sports.json').flush([first, second])
		await vi.waitFor(() =>
			expect(store.detailStatusFor('SPORTS', 'first')()).toBe('loading'),
		)
		http.expectOne('/news-fixtures/sports_data.json').flush({
			first: detail,
			second: { ...detail, uuid: 'second', title: 'Second full article' },
		})
		await pages.loadCategoryPage('SPORTS')
		harness.detectChanges()
		expect(harness.routeNativeElement?.textContent).toContain(
			'First full article',
		)
		expect(harness.routeNativeElement?.textContent).toContain('Second headline')
		expect(
			harness.routeNativeElement?.querySelector('a')?.getAttribute('href'),
		).toBe('/sports/article/first')
		expect(store.articleFor('SPORTS', 'second')()).toBeUndefined()

		await harness.navigateByUrl('/sports/article/first', DetailComponent)
		await pages.loadArticlePage('SPORTS', 'first')
		harness.detectChanges()
		expect(harness.routeNativeElement?.textContent).toContain(
			'Full body paragraph',
		)
		await harness.navigateByUrl('/sports/article/second', DetailComponent)
		http.expectOne('/news-fixtures/sports_data.json').flush({
			second: { ...detail, uuid: 'second', title: 'Second full article' },
		})
		await pages.loadArticlePage('SPORTS', 'second')
		harness.detectChanges()
		expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
			'Second full article',
		)
		http.expectNone(() => true)
	})

	it('opens an article directly without downloading category headlines', async () => {
		const { harness, http, pages } = await setup()
		await harness.navigateByUrl('/sports/article/first', DetailComponent)
		http.expectOne('/news-fixtures/sports_data.json').flush({ first: detail })
		await pages.loadArticlePage('SPORTS', 'first')
		harness.detectChanges()
		expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
			'First full article',
		)
		expect(
			harness.routeNativeElement?.querySelector('img')?.getAttribute('src'),
		).toBe('/photo.jpg')
		http.expectNone('/news-fixtures/sports.json')
	})

	it('shows an empty category without requesting detail data', async () => {
		const { harness, http, pages } = await setup()
		await harness.navigateByUrl('/category/sports', CategoryComponent)
		http.expectOne('/news-fixtures/sports.json').flush([])
		await pages.loadCategoryPage('SPORTS')
		harness.detectChanges()
		expect(harness.routeNativeElement?.textContent).toContain(
			'No news in this category',
		)
		http.expectNone('/news-fixtures/sports_data.json')
	})

	it('rejects invalid categories without making requests', async () => {
		const { harness, http } = await setup()
		await harness.navigateByUrl('/category/invalid', CategoryComponent)
		expect(harness.routeNativeElement?.textContent).toContain(
			'Category not found',
		)
		await harness.navigateByUrl('/invalid/article/first', DetailComponent)
		expect(harness.routeNativeElement?.textContent).toContain(
			'Article not found',
		)
		http.expectNone(() => true)
	})

	it('shows a missing fixture article and does not automatically retry it', async () => {
		const { harness, http, store } = await setup()
		await harness.navigateByUrl('/sports/article/missing', DetailComponent)
		http.expectOne('/news-fixtures/sports_data.json').flush({ first: detail })
		await vi.waitFor(() =>
			expect(store.detailStatusFor('SPORTS', 'missing')()).toBe('error'),
		)
		harness.detectChanges()
		expect(harness.routeNativeElement?.textContent).toContain(
			'Article not found',
		)
		http.expectNone(() => true)
	})

	it('shows a missing article when the API returns 404', async () => {
		const { harness, http, store } = await setup('api')
		await harness.navigateByUrl('/sports/article/missing', DetailComponent)
		http
			.expectOne((request) => request.url === newsDetailUrl)
			.flush('Missing', { status: 404, statusText: 'Not Found' })
		await vi.waitFor(() =>
			expect(store.detailStatusFor('SPORTS', 'missing')()).toBe('error'),
		)
		harness.detectChanges()
		expect(harness.routeNativeElement?.textContent).toContain(
			'Article not found',
		)
	})

	it('keeps category headlines visible after a detail error and supports retry', async () => {
		const { harness, http, store, pages } = await setup()
		await harness.navigateByUrl('/category/sports', CategoryComponent)
		http.expectOne('/news-fixtures/sports.json').flush([first, second])
		await vi.waitFor(() =>
			expect(store.detailStatusFor('SPORTS', 'first')()).toBe('loading'),
		)
		http
			.expectOne('/news-fixtures/sports_data.json')
			.flush('Failed', { status: 500, statusText: 'Server Error' })
		await vi.waitFor(() =>
			expect(store.detailStatusFor('SPORTS', 'first')()).toBe('error'),
		)
		harness.detectChanges()
		expect(harness.routeNativeElement?.textContent).toContain('Second headline')
		expect(harness.routeNativeElement?.textContent).toContain(
			'Unable to load the featured article details',
		)
		harness.routeNativeElement?.querySelector('button')?.click()
		await vi.waitFor(() =>
			expect(store.detailStatusFor('SPORTS', 'first')()).toBe('loading'),
		)
		http.expectOne('/news-fixtures/sports_data.json').flush({ first: detail })
		await pages.loadCategoryPage('SPORTS')
		harness.detectChanges()
		expect(harness.routeNativeElement?.textContent).toContain(
			'First full article',
		)
		http.expectNone('/news-fixtures/sports.json')
	})
})
