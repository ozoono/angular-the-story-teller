export class NewsArticleNotFoundError extends Error {
	constructor(uuid: string) {
		super(`News article not found: ${uuid}`)
		this.name = 'NewsArticleNotFoundError'
	}
}
