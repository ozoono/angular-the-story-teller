export interface FreeNewsApiNewsListResponse {
	data: FreeNewsApiNewsListItem[]
}

export interface FreeNewsApiNewsListItem {
	uuid: string
	title: string
	published_at: string
	publisher: string
}

export interface FreeNewsApiNewsDetailResponse {
	data: FreeNewsApiNewsDetail
}

export interface FreeNewsApiNewsDetail extends FreeNewsApiNewsListItem {
	thumbnail: string
	authors: string[]
	topics: string[]
	countries: string[]
	languages: string[]
	original_url: string
	incipit: string
	body: string
}
