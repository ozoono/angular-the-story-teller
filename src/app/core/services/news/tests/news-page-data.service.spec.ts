import { TestBed } from '@angular/core/testing'
import { HOME_NEWS_TOPICS } from '@/core/constants/home-news.constants.ts'
import { NewsContentService } from '@/core/services/news/news-content.service.ts'
import type { NewsArticleDetail } from '@/core/models/news/news-article-detail.model.ts'
import type { NewsHeadline } from '@/core/models/news/news-headline.model.ts'
import type { NewsTopic } from '@/core/models/news/news-topic.model.ts'
import { NewsPageDataService } from '@/core/services/news/news-page-data.service.ts'
import { NewsStore } from '@/core/stores/news.store.ts'

const headlinesFor = (topic: NewsTopic): readonly NewsHeadline[] =>
	Array.from({ length: 4 }, (_, index) => ({
		id: `${topic}-${index + 1}`,
		title: 'Headline',
		source: 'Publisher',
		authors: [],
		category: topic,
	}))

const detailFor = (topic: NewsTopic, uuid: string): NewsArticleDetail => ({
	uuid,
	title: 'Headline',
	publisher: 'Publisher',
	authors: ['Author'],
	thumbnail: '/photo.jpg',
	topics: [topic.toLowerCase()],
	published_at: '2026-09-19',
	original_url: 'https://example.com/article',
	incipit: 'Summary',
	body: 'Full article',
})

const detailsFor = (topic: NewsTopic) =>
	Object.fromEntries(
		headlinesFor(topic).map(({ id }) => [id, detailFor(topic, id)]),
	)

const setup = () => {
	const source = {
		getCategory: vi
			.fn<(topic: NewsTopic) => Promise<readonly NewsHeadline[]>>()
			.mockImplementation(async (topic) => headlinesFor(topic)),
		getCategoryDetails: vi
			.fn<(topic: NewsTopic) => Promise<Record<string, NewsArticleDetail>>>()
			.mockImplementation(async (topic) => detailsFor(topic)),
	}
	TestBed.configureTestingModule({
		providers: [{ provide: NewsContentService, useValue: source }],
	})
	return {
		pages: TestBed.inject(NewsPageDataService),
		store: TestBed.inject(NewsStore),
		source,
	}
}

afterEach(() => vi.restoreAllMocks())

describe('NewsPageDataService', () => {
	it('loads home headlines and downloads details once per required category', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.9)
		const { pages, source, store } = setup()
		const loadCategoryDetails = vi.spyOn(store, 'loadCategoryDetails')
		const loadDetail = vi.spyOn(store, 'loadDetail')
		await pages.loadHome()
		expect(source.getCategory.mock.calls.map(([topic]) => topic)).toEqual(
			HOME_NEWS_TOPICS,
		)
		expect(
			source.getCategoryDetails.mock.calls.map(([topic]) => topic),
		).toEqual(
			HOME_NEWS_TOPICS.filter(
				(topic) => topic !== 'POLITICS' && topic !== 'FINANCE',
			),
		)
		expect(source.getCategoryDetails).toHaveBeenCalledTimes(10)
		expect(loadCategoryDetails).toHaveBeenCalledTimes(10)
		expect(loadDetail).not.toHaveBeenCalled()
		expect(pages.homeDetailSelections().TECHNOLOGY).toEqual(['TECHNOLOGY-2'])
		expect(pages.homeDetailSelections().POLITICS).toEqual([])
		expect(pages.homeDetailSelections().FINANCE).toEqual([])
	})

	it('shares concurrent home loads and keeps popular selections stable across visits', async () => {
		const random = vi.spyOn(Math, 'random').mockReturnValue(0.9)
		const { pages, source } = setup()
		const first = pages.loadHome()
		expect(pages.loadHome()).toBe(first)
		await first
		const selections = pages.homeDetailSelections()
		random.mockReturnValue(0)
		await pages.loadHome()
		expect(pages.homeDetailSelections()).toBe(selections)
		expect(source.getCategory).toHaveBeenCalledTimes(12)
		expect(source.getCategoryDetails).toHaveBeenCalledTimes(10)
		expect(random).toHaveBeenCalledTimes(4)
	})

	it('preserves successful sections and retries failed details without changing selection', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0)
		const { pages, store, source } = setup()
		const error = new Error('Detail failed')
		source.getCategoryDetails.mockImplementation(async (topic) => {
			if (topic === 'TECHNOLOGY') throw error
			return detailsFor(topic)
		})
		await pages.loadHome()
		expect(store.detailErrorFor('TECHNOLOGY', 'TECHNOLOGY-1')()).toBe(error)
		expect(store.articleFor('SPORTS', 'SPORTS-1')()).toBeDefined()
		source.getCategoryDetails.mockImplementation(async (topic) =>
			detailsFor(topic),
		)
		await pages.loadHome()
		expect(source.getCategoryDetails).toHaveBeenCalledTimes(11)
		expect(store.detailErrorFor('TECHNOLOGY', 'TECHNOLOGY-1')()).toBeUndefined()
		expect(pages.homeDetailSelections().TECHNOLOGY).toEqual(['TECHNOLOGY-1'])
	})

	it('skips failed or empty categories and selects the only available popular headline', async () => {
		const { pages, store, source } = setup()
		source.getCategory.mockImplementation(async (topic) => {
			if (topic === 'BUSINESS') throw new Error('Category failed')
			if (topic === 'SPORTS') return []
			if (topic === 'TECHNOLOGY') return headlinesFor(topic).slice(0, 1)
			return headlinesFor(topic)
		})
		await pages.loadHome()
		expect(store.statusFor('BUSINESS')()).toBe('error')
		expect(store.statusFor('SPORTS')()).toBe('loaded')
		expect(
			source.getCategoryDetails.mock.calls.some(
				([topic]) => topic === 'BUSINESS' || topic === 'SPORTS',
			),
		).toBe(false)
		expect(pages.homeDetailSelections().TECHNOLOGY).toEqual(['TECHNOLOGY-1'])
		expect(store.articleFor('MOVIES', 'MOVIES-1')()).toBeDefined()
	})

	it('waits for category headlines before downloading the category details', async () => {
		const { pages, store, source } = setup()
		let resolve!: (value: readonly NewsHeadline[]) => void
		source.getCategory.mockReturnValue(
			new Promise((done) => {
				resolve = done
			}),
		)
		const load = pages.loadCategoryPage('SPORTS')
		expect(source.getCategoryDetails).not.toHaveBeenCalled()
		resolve(headlinesFor('SPORTS'))
		await load
		expect(source.getCategoryDetails).toHaveBeenCalledExactlyOnceWith('SPORTS')
		expect(store.headlinesFor('SPORTS')()).toHaveLength(4)
		await pages.loadCategoryPage('SPORTS')
		expect(source.getCategoryDetails).toHaveBeenCalledTimes(1)
	})

	it('does not request a detail for an empty category', async () => {
		const { pages, source } = setup()
		source.getCategory.mockResolvedValue([])
		await pages.loadCategoryPage('SPORTS')
		expect(source.getCategoryDetails).not.toHaveBeenCalled()
	})

	it('exposes category detail failures without discarding headlines', async () => {
		const { pages, store, source } = setup()
		const error = new Error('Detail failed')
		source.getCategoryDetails.mockRejectedValue(error)
		await expect(pages.loadCategoryPage('SPORTS')).rejects.toBe(error)
		expect(store.headlinesFor('SPORTS')()).toHaveLength(4)
		expect(store.detailErrorFor('SPORTS', 'SPORTS-1')()).toBe(error)
	})

	it('loads an article directly and reuses its full detail cache', async () => {
		const { pages, source } = setup()
		expect(await pages.loadArticlePage('SPORTS', 'SPORTS-3')).toEqual(
			detailFor('SPORTS', 'SPORTS-3'),
		)
		await pages.loadArticlePage('SPORTS', 'SPORTS-3')
		expect(source.getCategory).not.toHaveBeenCalled()
		expect(source.getCategoryDetails).toHaveBeenCalledExactlyOnceWith('SPORTS')
	})
})
