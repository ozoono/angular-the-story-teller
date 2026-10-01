import { TestBed } from '@angular/core/testing'
import { homeNewsTopics } from '@/core/constants/home-news.constants.ts'
import { NEWS_DATA_SOURCE } from '@/core/config/news-data.config.ts'
import type { NewsArticleDetail } from '@/core/models/news-article-detail.model.ts'
import type { NewsHeadline } from '@/core/models/news-headline.model.ts'
import type { NewsTopic } from '@/core/models/news-topic.model.ts'
import { NewsPageDataService } from '@/core/services/news-page-data.service.ts'
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

const setup = () => {
	const source = {
		getCategory: vi
			.fn<(topic: NewsTopic) => Promise<readonly NewsHeadline[]>>()
			.mockImplementation(async (topic) => headlinesFor(topic)),
		getArticleDetail: vi
			.fn<(topic: NewsTopic, uuid: string) => Promise<NewsArticleDetail>>()
			.mockImplementation(async (topic, uuid) => detailFor(topic, uuid)),
	}
	TestBed.configureTestingModule({
		providers: [{ provide: NEWS_DATA_SOURCE, useValue: source }],
	})
	return {
		pages: TestBed.inject(NewsPageDataService),
		store: TestBed.inject(NewsStore),
		source,
	}
}

afterEach(() => vi.restoreAllMocks())

describe('NewsPageDataService', () => {
	it('loads only home categories and the selected featured details', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.9)
		const { pages, source } = setup()
		await pages.loadHome()
		expect(source.getCategory.mock.calls.map(([topic]) => topic)).toEqual(
			homeNewsTopics,
		)
		expect(source.getArticleDetail.mock.calls).toEqual(
			expect.arrayContaining([
				['BUSINESS', 'BUSINESS-1'],
				['BUSINESS', 'BUSINESS-2'],
				['SPORTS', 'SPORTS-1'],
				['SPORTS', 'SPORTS-2'],
				['MOVIES', 'MOVIES-1'],
				['TV', 'TV-1'],
				['MUSIC', 'MUSIC-1'],
				['GAMING', 'GAMING-1'],
				['TECHNOLOGY', 'TECHNOLOGY-2'],
				['SCIENCE', 'SCIENCE-2'],
				['HEALTH', 'HEALTH-2'],
				['NUTRITION', 'NUTRITION-2'],
			]),
		)
		expect(source.getArticleDetail).toHaveBeenCalledTimes(12)
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
		expect(source.getArticleDetail).toHaveBeenCalledTimes(12)
		expect(random).toHaveBeenCalledTimes(4)
	})

	it('preserves successful sections and retries failed details without changing selection', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0)
		const { pages, store, source } = setup()
		const error = new Error('Detail failed')
		source.getArticleDetail.mockImplementation(async (topic, uuid) => {
			if (topic === 'TECHNOLOGY') throw error
			return detailFor(topic, uuid)
		})
		await pages.loadHome()
		expect(store.detailErrorFor('TECHNOLOGY', 'TECHNOLOGY-1')()).toBe(error)
		expect(store.articleFor('SPORTS', 'SPORTS-1')()).toBeDefined()
		source.getArticleDetail.mockImplementation(async (topic, uuid) =>
			detailFor(topic, uuid),
		)
		await pages.loadHome()
		expect(source.getArticleDetail).toHaveBeenCalledTimes(13)
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
			source.getArticleDetail.mock.calls.some(
				([topic]) => topic === 'BUSINESS' || topic === 'SPORTS',
			),
		).toBe(false)
		expect(pages.homeDetailSelections().TECHNOLOGY).toEqual(['TECHNOLOGY-1'])
		expect(store.articleFor('MOVIES', 'MOVIES-1')()).toBeDefined()
	})

	it('waits for category headlines before requesting only the first detail', async () => {
		const { pages, store, source } = setup()
		let resolve!: (value: readonly NewsHeadline[]) => void
		source.getCategory.mockReturnValue(
			new Promise((done) => {
				resolve = done
			}),
		)
		const load = pages.loadCategoryPage('SPORTS')
		expect(source.getArticleDetail).not.toHaveBeenCalled()
		resolve(headlinesFor('SPORTS'))
		await load
		expect(source.getArticleDetail).toHaveBeenCalledExactlyOnceWith(
			'SPORTS',
			'SPORTS-1',
		)
		expect(store.headlinesFor('SPORTS')()).toHaveLength(4)
		await pages.loadCategoryPage('SPORTS')
		expect(source.getArticleDetail).toHaveBeenCalledTimes(1)
	})

	it('does not request a detail for an empty category', async () => {
		const { pages, source } = setup()
		source.getCategory.mockResolvedValue([])
		await pages.loadCategoryPage('SPORTS')
		expect(source.getArticleDetail).not.toHaveBeenCalled()
	})

	it('exposes category detail failures without discarding headlines', async () => {
		const { pages, store, source } = setup()
		const error = new Error('Detail failed')
		source.getArticleDetail.mockRejectedValue(error)
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
		expect(source.getArticleDetail).toHaveBeenCalledExactlyOnceWith(
			'SPORTS',
			'SPORTS-3',
		)
	})
})
