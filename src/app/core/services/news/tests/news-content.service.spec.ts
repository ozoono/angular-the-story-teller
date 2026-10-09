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
	it('loads only headlines and fetches details without keeping a service cache', async () => {
		const { content, http } = setup()
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
		const { content, http } = setup()
		const result = content.getArticleDetail('BUSINESS', headline.uuid)
		http
			.expectOne('/news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		expect(await result).toEqual(detail)
		http.expectNone('/news-fixtures/business.json')
	})

	it('reports a missing UUID and can fetch another article afterwards', async () => {
		const { content, http } = setup()
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
		const { content, http } = setup()
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

describe('Store cache with fixtures', () => {
	it('shares pending requests and caches headlines and details', async () => {
		const { http } = setup()
		const store = TestBed.inject(NewsStore)
		const headlines = store.loadTopic('BUSINESS')
		expect(store.loadTopic('BUSINESS')).toBe(headlines)
		const list = [{ ...headline, authors: [] }]
		http.expectOne('/news-fixtures/business.json').flush(list)
		await headlines
		const article = store.loadDetail('BUSINESS', headline.uuid)
		expect(store.loadDetail('BUSINESS', headline.uuid)).toBe(article)
		http
			.expectOne('/news-fixtures/business_data.json')
			.flush({ [headline.uuid]: detail })
		expect(await article).toEqual(detail)
		await store.loadTopic('BUSINESS')
		expect(await store.loadDetail('BUSINESS', headline.uuid)).toEqual(detail)
		http.expectNone(() => true)
	})
})
