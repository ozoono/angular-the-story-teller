// Keep the full source data; presentation models decide which fields to display.
export interface NewsArticleDetail {
	uuid: string
	title: string
	thumbnail: string
	publisher: string
	authors: readonly string[]
	topics: readonly string[]
	countries?: readonly string[]
	languages?: readonly string[]
	published_at: string
	original_url: string
	incipit: string
	body: string
}
