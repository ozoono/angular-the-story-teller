import { provideHttpClient } from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { NewsContentService } from '@/core/services/news/news-content.service.ts'
import { NewsStore } from '@/core/stores/news.store.ts'

const headline = {
	uuid: 'article-1',
	title: 'Headline',
	publisher: 'Publisher',
}
const detail = {
	...headline,
	authors: ['Author'],
	thumbnail: '/news-images/business1.jpg',
	topics: ['business', 'technology'],
	countries: ['GB'],
	languages: ['en'],
	published_at: '2026-09-19T19:12:00.000Z',
	original_url: 'https://example.com/article',
	incipit: 'Summary',
	body: 'Full article',
	extra_metadata: { retained: true },
}

const setup = () => {
	TestBed.configureTestingModule({
		providers: [provideHttpClient(), provideHttpClientTesting()],
	})
	return {
		content: TestBed.inject(NewsContentService),
		http: TestBed.inject(HttpTestingController),
	}
}

afterEach(() => TestBed.inject(HttpTestingController).verify())

describe('NewsContentService', () => {
	it('loads headlines separately from category details', async () => {
		const { content, http } = setup()
		const headlines = content.getCategory('BUSINESS')
		http
			.expectOne('news-fixtures/business.json')
			.flush([{ ...headline, authors: [] }])
		expect(await headlines).toEqual([
			{
				id: headline.uuid,
				title: headline.title,
				source: headline.publisher,
				authors: [],
				category: 'BUSINESS',
			},
		])
		http.expectNone('news-fixtures/business_data.json')
		const details = content.getCategoryDetails('BUSINESS')
		http
			.expectOne('news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		expect(await details).toEqual({ [headline.uuid]: detail })
	})
})

describe('Store cache with fixtures', () => {
	it('shares a category download across UUIDs and caches every article', async () => {
		const { http } = setup()
		const store = TestBed.inject(NewsStore)
		const first = store.loadDetail('BUSINESS', headline.uuid)
		expect(store.loadDetail('BUSINESS', headline.uuid)).toBe(first)
		const second = store.loadDetail('BUSINESS', 'article-2')
		const secondDetail = { ...detail, uuid: 'article-2' }
		const thirdDetail = { ...detail, uuid: 'article-3' }
		http.expectOne('news-fixtures/business_data.json').flush({
			[headline.uuid]: detail,
			'article-2': secondDetail,
			'article-3': thirdDetail,
		})
		expect(await first).toEqual(detail)
		expect(await second).toEqual(secondDetail)
		expect(store.articleFor('BUSINESS', 'article-3')()).toEqual(thirdDetail)
		expect(store.detailStatusFor('BUSINESS', 'article-3')()).toBe('loaded')
		expect(await store.loadDetail('BUSINESS', 'article-3')).toEqual(thirdDetail)
		http.expectNone(() => true)
	})

	it('keeps the downloaded category when a requested UUID is missing', async () => {
		const { http } = setup()
		const store = TestBed.inject(NewsStore)
		const missing = store.loadDetail('BUSINESS', 'missing')
		const rejection = expect(missing).rejects.toThrow(
			'News article not found: missing',
		)
		http
			.expectOne('news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		await rejection
		expect(await store.loadDetail('BUSINESS', headline.uuid)).toEqual(detail)
		await expect(store.loadDetail('BUSINESS', 'missing')).rejects.toThrow(
			'News article not found: missing',
		)
		http.expectNone(() => true)
	})

	it('caches an empty category without downloading it again', async () => {
		const { http } = setup()
		const store = TestBed.inject(NewsStore)
		const result = store.loadDetail('BUSINESS', 'missing')
		const rejection = expect(result).rejects.toThrow('News article not found')
		http.expectOne('news-fixtures/business_data.json').flush({})
		await rejection
		await expect(store.loadDetail('BUSINESS', 'other')).rejects.toThrow(
			'News article not found',
		)
		http.expectNone(() => true)
	})

	it('retries a failed category download', async () => {
		const { http } = setup()
		const store = TestBed.inject(NewsStore)
		const failed = store.loadDetail('BUSINESS', headline.uuid)
		const rejection = expect(failed).rejects.toBeDefined()
		http.expectOne('news-fixtures/business_data.json').flush('Failed', {
			status: 500,
			statusText: 'Server Error',
		})
		await rejection
		const retry = store.loadDetail('BUSINESS', headline.uuid)
		http
			.expectOne('news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		expect(await retry).toEqual(detail)
	})
})
