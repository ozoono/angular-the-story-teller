import { TestBed } from '@angular/core/testing'
import { NewsContentService } from '@/core/services/news/news-content.service.ts'
import type { NewsArticleDetail } from '@/core/models/news/news-article-detail.model.ts'
import type { NewsHeadline } from '@/core/models/news/news-headline.model.ts'
import { NewsStore } from '@/core/stores/news.store.ts'

const headline: NewsHeadline = {
	id: 'article-1',
	title: 'Headline',
	source: 'Publisher',
	authors: [],
	category: 'BUSINESS',
}
const detail = {
	uuid: headline.id,
	title: 'Full title',
	publisher: 'Publisher',
	authors: ['Author'],
	thumbnail: '/photo.jpg',
	topics: ['business', 'technology'],
	countries: ['GB'],
	languages: ['en'],
	published_at: '2026-09-19',
	original_url: 'https://example.com/article',
	incipit: 'Summary',
	body: '',
	extra_metadata: { retained: true },
}

const deferred = <T>() => {
	let resolve!: (value: T) => void
	let reject!: (reason: unknown) => void
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise
		reject = rejectPromise
	})
	return { promise, resolve, reject }
}

const setup = () => {
	const source = {
		getCategory: vi.fn<() => Promise<readonly NewsHeadline[]>>(),
		getArticleDetail: vi.fn<() => Promise<NewsArticleDetail>>(),
	}
	TestBed.configureTestingModule({
		providers: [{ provide: NewsContentService, useValue: source }],
	})
	return { store: TestBed.inject(NewsStore), source }
}

describe('NewsStore', () => {
	it('shares category requests and caches headlines without loading details', async () => {
		const { store, source } = setup()
		const request = deferred<readonly NewsHeadline[]>()
		source.getCategory.mockReturnValue(request.promise)
		const status = store.statusFor('BUSINESS')
		expect(status()).toBe('idle')
		const first = store.loadTopic('BUSINESS')
		expect(status()).toBe('loading')
		expect(store.loadTopic('BUSINESS')).toBe(first)
		request.resolve([headline])
		expect(await first).toEqual([headline])
		expect(status()).toBe('loaded')
		expect(await store.loadTopic('BUSINESS')).toEqual([headline])
		expect(source.getCategory).toHaveBeenCalledExactlyOnceWith('BUSINESS')
		expect(source.getArticleDetail).not.toHaveBeenCalled()
		expect(store.detailStates()).toEqual({})
	})

	it('treats an empty category as successfully loaded', async () => {
		const { store, source } = setup()
		source.getCategory.mockResolvedValue([])
		await store.loadTopic('SPORTS')
		await store.loadTopic('SPORTS')
		expect(store.statusFor('SPORTS')()).toBe('loaded')
		expect(source.getCategory).toHaveBeenCalledTimes(1)
	})

	it('exposes category errors and clears them on a successful retry', async () => {
		const { store, source } = setup()
		const error = new Error('Category failed')
		source.getCategory
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce([headline])
		await expect(store.loadTopic('BUSINESS')).rejects.toBe(error)
		expect(store.statusFor('BUSINESS')()).toBe('error')
		expect(store.errorFor('BUSINESS')()).toBe(error)
		await store.loadTopic('BUSINESS')
		expect(store.statusFor('BUSINESS')()).toBe('loaded')
		expect(store.errorFor('BUSINESS')()).toBeUndefined()
	})

	it('shares detail requests and preserves full data, even with an empty body', async () => {
		const { store, source } = setup()
		const request = deferred<NewsArticleDetail>()
		source.getArticleDetail.mockReturnValue(request.promise)
		const status = store.detailStatusFor('BUSINESS', headline.id)
		expect(status()).toBe('idle')
		const first = store.loadDetail('BUSINESS', headline.id)
		expect(status()).toBe('loading')
		expect(store.loadDetail('BUSINESS', headline.id)).toBe(first)
		request.resolve(detail)
		expect(await first).toBe(detail)
		expect(store.articleFor('BUSINESS', headline.id)()).toBe(detail)
		expect(status()).toBe('loaded')
		expect(await store.loadDetail('BUSINESS', headline.id)).toBe(detail)
		expect(source.getArticleDetail).toHaveBeenCalledExactlyOnceWith(
			'BUSINESS',
			headline.id,
		)
		expect(source.getCategory).not.toHaveBeenCalled()
	})

	it('keeps headlines after a detail failure and enriches presentation after retry', async () => {
		const { store, source } = setup()
		source.getCategory.mockResolvedValue([headline])
		await store.loadTopic('BUSINESS')
		const articles = store.articlesFor('BUSINESS')
		expect(articles()[0].summary).toBeUndefined()
		const error = new Error('Detail failed')
		source.getArticleDetail
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce(detail)
		await expect(store.loadDetail('BUSINESS', headline.id)).rejects.toBe(error)
		expect(store.detailStatusFor('BUSINESS', headline.id)()).toBe('error')
		expect(store.detailErrorFor('BUSINESS', headline.id)()).toBe(error)
		expect(store.headlinesFor('BUSINESS')()).toEqual([headline])
		expect(store.statusFor('BUSINESS')()).toBe('loaded')
		await store.loadDetail('BUSINESS', headline.id)
		expect(store.detailErrorFor('BUSINESS', headline.id)()).toBeUndefined()
		expect(articles()[0]).toMatchObject({
			summary: 'Summary',
			photoUrl: '/photo.jpg',
			author: 'Author',
		})
		expect(store.headlinesFor('BUSINESS')()[0]).toBe(headline)
		expect(store.articleFor('BUSINESS', headline.id)()).toBe(detail)
	})

	it('keeps detail caches independent across categories', async () => {
		const { store, source } = setup()
		source.getArticleDetail
			.mockResolvedValueOnce(detail)
			.mockResolvedValueOnce({ ...detail, topics: ['sports'] })
		await store.loadDetail('BUSINESS', headline.id)
		await store.loadDetail('SPORTS', headline.id)
		expect(source.getArticleDetail).toHaveBeenCalledTimes(2)
		expect(store.articleFor('BUSINESS', headline.id)()?.topics).toEqual([
			'business',
			'technology',
		])
		expect(store.articleFor('SPORTS', headline.id)()?.topics).toEqual([
			'sports',
		])
	})

	it('loads topics independently and does not request implicit featured details', async () => {
		const { store, source } = setup()
		source.getCategory
			.mockRejectedValueOnce(new Error('Business failed'))
			.mockResolvedValueOnce([])
		await Promise.allSettled([
			store.loadTopic('BUSINESS'),
			store.loadTopic('SPORTS'),
		])
		expect(store.statusFor('BUSINESS')()).toBe('error')
		expect(store.statusFor('SPORTS')()).toBe('loaded')
		expect(source.getArticleDetail).not.toHaveBeenCalled()
	})
})
