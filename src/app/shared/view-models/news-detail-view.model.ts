import type { NewsCardViewModel } from '@/shared/view-models/news-card-view.model.ts'

/** Presentation data consumed by the article reader page. */
export interface NewsDetailViewModel extends NewsCardViewModel {
	source: string
	body: string
	paragraphs: readonly string[]
	originalUrl: string
}
