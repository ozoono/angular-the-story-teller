import { provideHttpClient } from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import {
	homeNewsTopics,
	homePopularTopics,
} from '@/core/constants/home-news.constants.ts'
import { provideNewsDataSource } from '@/core/config/news-data.providers.ts'
import { NewsPageDataService } from '@/core/services/news-page-data.service.ts'
import { HomeComponent } from '@/features/home/home.component.ts'

describe('HOME data flow', () => {
	afterEach(() => {
		TestBed.inject(HttpTestingController).verify()
		vi.restoreAllMocks()
	})

	it('renders the requested details and reuses the same popular selection on return', async () => {
		const random = vi.spyOn(Math, 'random').mockReturnValue(0.9)
		TestBed.configureTestingModule({
			imports: [HomeComponent],
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				provideRouter([]),
				provideNewsDataSource('fixtures'),
			],
		})
		const http = TestBed.inject(HttpTestingController)
		const pages = TestBed.inject(NewsPageDataService)
		const fixture = TestBed.createComponent(HomeComponent)
		fixture.detectChanges()

		for (const topic of homeNewsTopics) {
			http.expectOne(`/news-fixtures/${topic.toLowerCase()}.json`).flush(
				Array.from({ length: 4 }, (_, index) => ({
					uuid: `${topic}-${index + 1}`,
					title: `${topic} headline ${index + 1}`,
					publisher: 'Publisher',
					authors: [],
				})),
			)
		}
		http.expectNone('/news-fixtures/economy.json')
		await vi.waitFor(() =>
			expect(pages.homeDetailSelections().NUTRITION).toBeDefined(),
		)

		for (const topic of homeNewsTopics) {
			if (topic === 'POLITICS' || topic === 'FINANCE') continue
			const requests = http.match(
				`/news-fixtures/${topic.toLowerCase()}_data.json`,
			)
			expect(requests).toHaveLength(
				pages.homeDetailSelections()[topic]?.length ?? 0,
			)
			for (const request of requests) {
				request.flush(
					Object.fromEntries(
						[1, 2].map((index) => [
							`${topic}-${index}`,
							{
								uuid: `${topic}-${index}`,
								title: `${topic} detail ${index}`,
								publisher: 'Publisher',
								authors: ['Author'],
								topics: [topic.toLowerCase()],
								thumbnail: `/news-images/${topic.toLowerCase()}${index}.jpg`,
								published_at: '2026-09-19',
								original_url: 'https://example.com/article',
								incipit: `${topic} summary ${index}`,
								body: 'Full article',
							},
						]),
					),
				)
			}
		}
		http.expectNone('/news-fixtures/politics_data.json')
		http.expectNone('/news-fixtures/finance_data.json')
		await pages.loadHome()
		await fixture.whenStable()
		fixture.detectChanges()
		const element = fixture.nativeElement as HTMLElement
		expect(
			element.querySelector('.lead-story-card__summary')?.textContent,
		).toContain('BUSINESS summary 1')
		expect(element.querySelectorAll('img')).toHaveLength(12)
		for (const link of element.querySelectorAll('a[href*="/article/"]')) {
			expect(link.getAttribute('href')).toMatch(
				/^\/[a-z]+\/article\/[A-Z]+-\d+$/,
			)
		}
		for (const topic of homePopularTopics) {
			const card = Array.from(
				element.querySelectorAll('.title-photo-card'),
			).find((item) => item.textContent?.includes(`${topic} detail 2`))
			expect(card?.querySelector('img')?.getAttribute('src')).toBe(
				`/news-images/${topic.toLowerCase()}2.jpg`,
			)
		}

		fixture.destroy()
		random.mockReturnValue(0)
		const returned = TestBed.createComponent(HomeComponent)
		returned.detectChanges()
		await returned.whenStable()
		returned.detectChanges()
		expect(
			(returned.nativeElement as HTMLElement).querySelectorAll('img'),
		).toHaveLength(12)
		expect(pages.homeDetailSelections().TECHNOLOGY).toEqual(['TECHNOLOGY-2'])
		expect(random).toHaveBeenCalledTimes(4)
		http.expectNone(() => true)
	})
})
