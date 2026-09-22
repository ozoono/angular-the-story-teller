import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
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
const sourceImagesDirectory = resolve(sourceDirectory, 'imgs_newspaper')
const fixturesDirectory = resolve('public/news-fixtures')
const imagesDirectory = resolve('public/news-images')
const imageFiles = await readdir(sourceImagesDirectory)

const imageUrlFor = (topic, index) => {
	const imageName = imageFiles.find((file) =>
		file.startsWith(`${topic}${index + 1}.`),
	)

	if (imageName === undefined) {
		throw new Error(`Missing image for ${topic} article ${index + 1}`)
	}

	return `/news-images/${imageName}`
}

const toArticle = (article, topic, index) => {
	const isFeatured = index < 2

	return {
		id: article.uuid,
		title: article.title,
		date: article.published_at,
		source: article.publisher,
		category: topic.toUpperCase(),
		...(isFeatured
			? {
					author: article.authors?.join(', ') || undefined,
					body: article.body,
					originalUrl: article.original_url,
					summary: article.incipit,
					photoUrl: imageUrlFor(topic, index),
				}
			: {}),
	}
}

await rm(fixturesDirectory, { force: true, recursive: true })
await mkdir(fixturesDirectory, { recursive: true })
await cp(sourceImagesDirectory, imagesDirectory, {
	force: true,
	recursive: true,
})
await rm(resolve(imagesDirectory, '.DS_Store'), { force: true })

for (const topic of topics) {
	const source = await readFile(
		resolve(sourceDirectory, `${topic}.json`),
		'utf8',
	)
	const response = JSON.parse(source)
	const articles = response.data.map((article, index) =>
		toArticle(article, topic, index),
	)

	await writeFile(
		resolve(fixturesDirectory, `${topic}.json`),
		`${JSON.stringify(articles, null, 2)}\n`,
	)
}
