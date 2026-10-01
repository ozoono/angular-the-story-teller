import { provideHttpClient } from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { newsDetailUrl, newsListUrl } from '@/core/config/news-api.config.ts'
import { NEWS_DATA_SOURCE } from '@/core/config/news-data.config.ts'
import { provideNewsDataSource } from '@/core/config/news-data.providers.ts'
import type { NewsDataSourceName } from '@/core/models/news-data-source.model.ts'
import { NewsContentService } from '@/core/services/news-content.service.ts'
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

const setup = (source: NewsDataSourceName) => {
	TestBed.configureTestingModule({
		providers: [
			provideHttpClient(),
			provideHttpClientTesting(),
			provideNewsDataSource(source),
		],
	})
	return {
		content: TestBed.inject(NewsContentService),
		http: TestBed.inject(HttpTestingController),
	}
}

afterEach(() => TestBed.inject(HttpTestingController).verify())

describe('Fixture news data source', () => {
	it('loads only headlines and fetches details without keeping an adapter cache', async () => {
		const { content, http } = setup('fixtures')
		const headlines = content.getCategory('BUSINESS')
		http
			.expectOne('/news-fixtures/business.json')
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
		http.expectNone('/news-fixtures/business_data.json')

		const first = content.getArticleDetail('BUSINESS', headline.uuid)
		const other = content.getArticleDetail('BUSINESS', 'article-2')
		const secondDetail = { ...detail, uuid: 'article-2' }
		const requests = http.match('/news-fixtures/business_data.json')
		expect(requests).toHaveLength(2)
		for (const request of requests) {
			request.flush({ [headline.uuid]: detail, 'article-2': secondDetail })
		}
		expect(await first).toEqual(detail)
		expect(await other).toEqual(secondDetail)
		const repeated = content.getArticleDetail('BUSINESS', headline.uuid)
		http
			.expectOne('/news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		expect(await repeated).toEqual(detail)
	})

	it('can open a detail directly without loading headlines', async () => {
		const { content, http } = setup('fixtures')
		const result = content.getArticleDetail('BUSINESS', headline.uuid)
		http
			.expectOne('/news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		expect(await result).toEqual(detail)
		http.expectNone('/news-fixtures/business.json')
	})

	it('reports a missing UUID and can fetch another article afterwards', async () => {
		const { content, http } = setup('fixtures')
		const result = content.getArticleDetail('BUSINESS', 'missing')
		const rejection = expect(result).rejects.toThrow(
			'News article not found: missing',
		)
		http
			.expectOne('/news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		await rejection
		const next = content.getArticleDetail('BUSINESS', headline.uuid)
		http
			.expectOne('/news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		expect(await next).toEqual(detail)
	})

	it('retries a failed download instead of caching the failure', async () => {
		const { content, http } = setup('fixtures')
		const failed = content.getArticleDetail('BUSINESS', headline.uuid)
		const rejection = expect(failed).rejects.toBeDefined()
		http.expectOne('/news-fixtures/business_data.json').flush('Failed', {
			status: 500,
			statusText: 'Server Error',
		})
		await rejection
		const retried = content.getArticleDetail('BUSINESS', headline.uuid)
		http
			.expectOne('/news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		expect(await retried).toEqual(detail)
	})
})

describe('API news data source', () => {
	it('uses the selected category and unwraps the API headlines response', async () => {
		const { content, http } = setup('api')
		const result = content.getCategory('SPORTS')
		const request = http.expectOne((req) => req.url === newsListUrl)
		expect(request.request.params.get('topic')).toBe('sports')
		expect(request.request.params.get('language')).toBe('en')
		request.flush({
			data: [{ ...headline, published_at: detail.published_at }],
		})
		expect(await result).toEqual([
			{
				id: headline.uuid,
				title: headline.title,
				source: headline.publisher,
				authors: [],
				category: 'SPORTS',
				date: detail.published_at,
			},
		])
	})

	it('requests a detail by UUID and preserves every returned field', async () => {
		const { content, http } = setup('api')
		const result = content.getArticleDetail('BUSINESS', headline.uuid)
		const request = http.expectOne((req) => req.url === newsDetailUrl)
		expect(request.request.params.get('uuid')).toBe(headline.uuid)
		request.flush({ data: detail })
		expect(await result).toEqual(detail)
	})

	it('rejects a detail whose UUID differs from the requested article', async () => {
		const { content, http } = setup('api')
		const result = content.getArticleDetail('BUSINESS', headline.uuid)
		const rejection = expect(result).rejects.toThrow('Unexpected news UUID')
		http
			.expectOne((req) => req.url === newsDetailUrl)
			.flush({
				data: { ...detail, uuid: 'another-article' },
			})
		await rejection
	})

	it('propagates API errors without requesting fixtures', async () => {
		const { content, http } = setup('api')
		const result = content.getCategory('BUSINESS')
		const rejection = expect(result).rejects.toBeDefined()
		http
			.expectOne((req) => req.url === newsListUrl)
			.flush('Failed', {
				status: 500,
				statusText: 'Server Error',
			})
		await rejection
		http.expectNone('/news-fixtures/business.json')
	})
})

describe('Default news data source', () => {
	it('selects fixtures from the application configuration', () => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				provideNewsDataSource(),
			],
		})
		expect(TestBed.inject(NEWS_DATA_SOURCE)).toBeDefined()
		TestBed.inject(NEWS_DATA_SOURCE).getCategory('BUSINESS')
		TestBed.inject(HttpTestingController)
			.expectOne('/news-fixtures/business.json')
			.flush([])
	})
})

describe.each(['api', 'fixtures'] as const)('Store cache with %s', (source) => {
	it('shares pending requests and caches headlines and details identically', async () => {
		const { http } = setup(source)
		const store = TestBed.inject(NewsStore)
		const headlines = store.loadTopic('BUSINESS')
		expect(store.loadTopic('BUSINESS')).toBe(headlines)
		const list = [{ ...headline, authors: [] }]
		if (source === 'api') {
			http
				.expectOne((request) => request.url === newsListUrl)
				.flush({ data: list })
		} else {
			http.expectOne('/news-fixtures/business.json').flush(list)
		}
		await headlines
		const article = store.loadDetail('BUSINESS', headline.uuid)
		expect(store.loadDetail('BUSINESS', headline.uuid)).toBe(article)
		if (source === 'api') {
			http
				.expectOne((request) => request.url === newsDetailUrl)
				.flush({ data: detail })
		} else {
			http
				.expectOne('/news-fixtures/business_data.json')
				.flush({ [headline.uuid]: detail })
		}
		expect(await article).toEqual(detail)
		await store.loadTopic('BUSINESS')
		expect(await store.loadDetail('BUSINESS', headline.uuid)).toEqual(detail)
		http.expectNone(() => true)
	})
})
