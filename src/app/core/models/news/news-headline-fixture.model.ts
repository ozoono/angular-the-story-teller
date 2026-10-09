// Headline fields stored in the category fixture files.
export interface NewsHeadlineFixture {
	uuid: string
	title: string
	publisher: string
	authors: readonly string[]
	published_at?: string
}
