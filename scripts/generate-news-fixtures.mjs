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

const toHeadline = (article) => ({
	uuid: article.uuid,
	title: article.title,
	publisher: article.publisher,
	authors: article.authors ?? [],
})

const toDetail = (article, topic, index) => ({
	...article,
	authors: article.authors ?? [],
	// Keep the local images used by the home page's featured articles.
	...(index < 2 ? { thumbnail: imageUrlFor(topic, index) } : {}),
})

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
	const headlines = response.data.map(toHeadline)
	const details = Object.fromEntries(
		response.data.map((article, index) => [
			article.uuid,
			toDetail(article, topic, index),
		]),
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
