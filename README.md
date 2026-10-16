# Angular - The StoryTeller

[![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Biome](https://img.shields.io/badge/Biome-60A5FA?logo=biome&logoColor=white)](https://biomejs.dev/)
[![Stylelint](https://img.shields.io/badge/Stylelint-263238?logo=stylelint&logoColor=white)](https://stylelint.io/)

A digital newspaper demo built with **Angular** and Signals. It features a **responsive layout**, category pages, article details and live weather.

## Preview

![The StoryTeller homepage](docs/images/screenshot.png)

[View the live demo](https://ozoono.github.io/angular-the-story-teller/)

## Features

- Newspaper-style homepage with news grouped by category.
- Category pages with a featured article and a list of headlines.
- Article pages with images, summaries and full text.
- Responsive layouts for desktop and mobile.
- Current weather with animated SVG icons.
- In-memory news caching when navigating between pages.

## Data sources

### News: local JSON files

This is a demo, so news is read from static JSON fixtures. **No news API is used**, and the articles do not update automatically.

The files are served from `public/news-fixtures/`:

- `<category>.json`: headlines with UUID, title, publisher and authors.
- `<category>_data.json`: full article data, indexed by UUID.

Article images use the URLs stored in the fixtures and may load from external websites.

### Weather: Open-Meteo

Weather data is fetched at runtime from [Open-Meteo](https://open-meteo.com/). The application first uses [ipapi](https://ipapi.co/) to obtain an approximate location from the visitor's public IP address, then requests the current temperature and weather code for those coordinates.

## Run locally

With Node.js and npm installed:

```bash
git clone https://github.com/ozoono/angular-the-story-teller.git
cd angular-the-story-teller
npm install
npm start
```

Open [localhost:4200](http://localhost:4200).

To regenerate the news fixtures after changing the source files in `src/_data/`:

```bash
npm run generate:fixtures
```

## News loading and caching

News is loaded on demand and kept in an in-memory store. When a category detail file is downloaded, all its articles are cached, so opening other articles in that category does not request the file again. Concurrent requests share the same download. Headlines are also cached, and everything is cleared when the browser reloads.

The demo follows the same loading and caching approach an application would use with a news API, using local JSON files as its data source.

## Tech stack

| Technology | Purpose |
| --- | --- |
| Angular 22 | UI, routing and reactive state with Signals |
| TypeScript | Application logic and type checking |
| CSS | Responsive layouts and styling |
| Vitest | Unit and component tests |
| Biome | Formatting and linting |
| Stylelint | CSS linting |
| GitHub Actions & Pages | Automated deployment and static hosting |
