import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const topics = [
	'business',
	'economy',
	'finance',
	'gaming',
	'health',
	'movies',
	'music',
	'nutrition',
	'politics',
	'science',
	'sports',
	'technology',
	'tv',
]
const sourceDirectory = resolve('src/_data')
const fixturesDirectory = resolve('public/news-fixtures')

const toHeadline = (article) => ({
	uuid: article.uuid,
	title: article.title,
	publisher: article.publisher,
	authors: article.authors ?? [],
})

const toDetail = (article) => ({
	...article,
	authors: article.authors ?? [],
})

await mkdir(fixturesDirectory, { recursive: true })

for (const topic of topics) {
	const source = await readFile(
		resolve(sourceDirectory, `${topic}.json`),
		'utf8',
	)
	const response = JSON.parse(source)
	const headlines = response.data.map(toHeadline)
	const details = Object.fromEntries(
		response.data.map((article) => [article.uuid, toDetail(article)]),
	)

	await writeFile(
		resolve(fixturesDirectory, `${topic}.json`),
		`${JSON.stringify(headlines, null, 2)}\n`,
	)
	await writeFile(
		resolve(fixturesDirectory, `${topic}_data.json`),
		`${JSON.stringify(details, null, 2)}\n`,
	)
}
