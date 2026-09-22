# Newspaper demo

This project is a client-side Angular demo. Its content strategy combines generated static fixtures with a small number of live FreeNewsAPI requests. There is no backend and no persistent browser storage: all state lives in the Angular store for the current application session only.

## Data sources

Raw API responses are kept in `src/_data/`, one JSON file per supported news topic. The images for the first two stories of each topic are kept in `src/_data/imgs_newspaper/`.

Those source files are not requested by the browser directly. Run the fixture generator whenever the raw data or images change:

```bash
npm run generate:fixtures
```

The generator creates the runtime assets below:

```text
public/news-fixtures/<topic>.json
public/news-images/<topic>1.<extension>
public/news-images/<topic>2.<extension>
```

Files in `public/` are served by Angular as static assets, so the application loads fixtures from paths such as `/news-fixtures/movies.json` and images from paths such as `/news-images/movies1.webp`.

The active topics are defined in `src/app/core/models/news-topic.model.ts`. A raw file does not become an available application category unless it is included in that list. In particular, `ENTERTAINMENT` is not a topic: the Entertainment home section is composed from `MOVIES`, `TV`, `MUSIC`, and `GAMING`.

## Fixture format

The generator normalizes the raw API response into the application's `NewsArticle` model.

Every fixture article includes the lightweight data needed by lists:

- `id`, `title`, `date`, `source`, and `category`

The first two articles of every topic also include the complete data needed by featured cards and article pages:

- `author`, `summary`, `body`, `originalUrl`, and `photoUrl`

This reflects the available source material: each topic has local images only for its first two stories. It also means that loading a fixture can immediately place those two complete articles in the detail cache.

## Initial loading

`HomeComponent` starts the process by calling `NewsStore.initTopics(newsTopics)`. The store loads all configured topics, sharing concurrent requests so a topic is never loaded twice at the same time.

| Topic | Initial source | Fallback |
| --- | --- | --- |
| `BUSINESS` | FreeNewsAPI list endpoint | Its static `business` fixture, only if the list request fails |
| Every other topic | Its static fixture | Not applicable |

`BUSINESS` is deliberately the only live listing on the home page. When its list request succeeds, the static Business fixture is not loaded or merged with the live result. When that request fails, including a rate-limit response, the Business fixture is used instead.

## When the API is called

The API key is sent by the client-side HTTP interceptor. It is intentionally not repeated in this document.

### Home page

On a fresh application session, the home page can make these live requests:

1. One `GET /news?language=en&topic=business` request to load the Business list.
2. If that list came from the API, two `GET /details?uuid=...` requests run in parallel for its first two stories. These provide the full text, summary, and image data required by the featured stories.

Therefore, the normal refreshed Business flow is three API calls. If the Business list request fails, it falls back to the fixture instead and its first two complete fixture stories are already available locally.

All remaining category lists are loaded from static files and make no live API list request.

### Article detail pages

Complete articles are cached by UUID in `NewsStore`.

1. If the UUID is already in the cache, the page uses it and makes no request.
2. If it is not cached, `NewsStore.loadDetail(uuid)` requests `GET /details?uuid=...` and stores the returned complete article.
3. Simultaneous requests for the same UUID share one in-flight request.

Fixture articles that include `body` (the first two from each topic) are added to this cache when their fixture is loaded. Other fixture list entries remain previews; opening one for the first time requires its detail API request.

`articleFor(uuid)` is read-only: it returns only a cached complete article. It does not scan a list preview and it never starts a network request itself.

## Cache lifetime

The store uses Angular signals and in-memory maps. Its cached topic lists, complete article details, and in-flight request tracking survive internal Angular navigation. They are cleared by a browser reload, which is intentional for this demo.

## Development

```bash
npm install
npm run generate:fixtures
npm start
```

To create a production build:

```bash
npm run build
```
