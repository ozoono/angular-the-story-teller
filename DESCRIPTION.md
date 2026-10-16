# Newspaper

Periódico digital en Angular. Las noticias de HOME, CATEGORÍA y DETALLE se obtienen siempre de fixtures. Las páginas deciden qué necesitan, el store gestiona la caché y NewsContentService lee los archivos.

## Desarrollo y comprobaciones

```bash
npm install
npm run generate:fixtures
npm start
```

```bash
npm test -- --watch=false
npm run lint:all
npm run build
```

## Responsabilidades y modelos

```text
Componente de página
  → NewsPageDataService: decide los titulares y detalles necesarios
    → NewsStore: datos, estados, caché y peticiones compartidas
      → NewsContentService: lectura y conversión de fixtures
```

El contrato tiene dos operaciones:

```ts
getCategory(category: NewsTopic): Promise<readonly NewsHeadline[]>
getArticleDetail(category: NewsTopic, uuid: string): Promise<NewsArticleDetail>
```

Los titulares usan `NewsHeadline`: `id`, `title`, `source`, `authors`, `category` y una fecha opcional. `toNewsHeadlines()` convierte `uuid → id` y `publisher → source`.

Los detalles usan `NewsArticleDetail` y conservan los campos originales: `uuid`, `title`, `thumbnail`, `publisher`, `authors`, `topics`, `countries`, `languages`, `published_at`, `original_url`, `incipit` y `body`. `countries` y `languages` pueden faltar. `newsFixtureDetail()` busca el UUID y devuelve el detalle completo, incluidos los campos adicionales. Si el UUID no existe, lanza `NewsArticleNotFoundError`. Los fixtures se tipan con interfaces, sin validar cada campo en ejecución.

Los modelos de noticias están en `core/models/news/`: `NewsHeadline` y `NewsArticleDetail`. El servicio de datos y la caché utilizan estos modelos.

Los modelos de presentación están en `shared/view-models/`: `NewsCardViewModel` para tarjetas y listados, y `NewsDetailViewModel` para el lector de noticias. Los componentes visuales utilizan estos modelos.

Las conversiones están en `shared/mappers/news-view.mapper.ts`. `NewsStore.articlesFor()` utiliza `toNewsCardViewModel()` para combinar titulares con detalles disponibles. `DetailComponent` utiliza `toNewsDetailViewModel()` para preparar autores, imagen, sumario y párrafos. Las conversiones no modifican ni reducen el detalle completo guardado en caché.

## HOME: /

### Secuencia de funciones

```text
HomeComponent.ngOnInit()
  → NewsPageDataService.loadHome()
    → para cada categoría de HOME_NEWS_TOPICS, en paralelo:
      → NewsStore.loadTopic(category)
        → caché de titulares o petición ya en curso
        → si hace falta: NewsContentService.getCategory(category)
          → GET /news-fixtures/<category>.json → toNewsHeadlines()
      → selectHomeDetails(category, headlines)
        → guarda los UUID en homeDetailSelections
      → para cada UUID seleccionado, en paralelo:
        → NewsStore.loadDetail(category, uuid)
          → caché de detalle o petición ya en curso
          → si hace falta: NewsContentService.getArticleDetail(category, uuid)
            → GET /news-fixtures/<category>_data.json → newsFixtureDetail()

Secciones de HOME
  → NewsStore.articlesFor(category)
    → toNewsCardViewModel(headline, cachedDetail)
    → tarjetas
```

Cada categoría empieza a solicitar sus detalles cuando termina su propio listado. No necesita esperar a que terminen las demás categorías. Los titulares pueden mostrarse mientras llegan los detalles.

La configuración está en `src/app/core/constants/home-news.constants.ts`:

| Sección / categoría | Detalles solicitados |
| --- | --- |
| Principal / BUSINESS | Las dos primeras noticias |
| Lateral / POLITICS | Ninguno; solo titulares |
| Breaking / FINANCE | Ninguno; solo titulares |
| Deportes / SPORTS | Las dos primeras noticias |
| Entretenimiento / MOVIES, TV, MUSIC, GAMING | La primera de cada categoría |
| Popular / TECHNOLOGY, SCIENCE, HEALTH, NUTRITION | Una de las dos primeras de cada categoría |

HOME carga 12 categorías. ECONOMY está disponible en la página de categoría, pero no se solicita desde HOME.

“Popular” selecciona una noticia después de cargar los titulares. Si solo hay una, utiliza esa. Los UUID elegidos se guardan en `homeDetailSelections`, y `HomePopularSectionComponent` utiliza esos mismos UUID para mostrar las noticias. La selección se conserva al volver a HOME durante la misma sesión.

En una sesión sin caché y con suficientes noticias, HOME realiza 12 solicitudes lógicas de titulares y 12 de detalle. Esto supone 24 peticiones de datos: 12 de titulares y 12 de detalles. En fixtures, distintas noticias de la misma categoría solicitan el mismo archivo, pero cada llamada extrae únicamente el UUID solicitado. Estas cifras excluyen imágenes y otros recursos estáticos.

`loadHome()` comparte las ejecuciones simultáneas y utiliza `Promise.allSettled()`: un fallo de categoría o detalle no bloquea las secciones que sí han cargado. Una nueva llamada reutiliza los datos correctos y reintenta los que fallaron, conservando la selección.

## CATEGORÍA: /category/:category

Ejemplo: `/category/sports`.

### Secuencia de funciones

```text
CategoryComponent
  → ActivatedRoute.paramMap → toSignal()
  → toNewsTopic(category): valida y convierte a NewsTopic
  → effect() al entrar o cambiar la categoría
    → NewsPageDataService.loadCategoryPage(category)
      → NewsStore.loadTopic(category)
        → NewsContentService.getCategory(category), si no está en caché
          → GET /news-fixtures/<category>.json → toNewsHeadlines()
      → seleccionar headlines[0]
      → si existe:
        → NewsStore.loadDetail(category, first.id)
          → NewsContentService.getArticleDetail(category, first.id), si no está en caché
            → GET /news-fixtures/<category>_data.json → detalle de first.id

Vista
  → NewsStore.articlesFor(category)
  → primera noticia: LeadStoryCardComponent
  → restantes: StackedTitleListLayoutComponent
```

La carga de detalle empieza después de recibir los titulares. Solo se solicita la primera noticia. La lista permanece visible si falla ese detalle.

- Categoría inválida: muestra “Category not found” y no solicita datos.
- Lista vacía: muestra “No news in this category” y no solicita detalles.
- Error de listado o detalle: muestra el error y un botón “Try again”.
- El botón vuelve a ejecutar `loadCategoryPage()`; el store reutiliza lo que ya está cargado.

## DETALLE: /:category/article/:id

Ejemplo: `/sports/article/first`.

### Secuencia de funciones

```text
DetailComponent
  → ActivatedRoute.paramMap → toSignal()
  → toNewsTopic(category) y lectura de id
  → effect() al entrar o cambiar categoría / id
    → NewsPageDataService.loadArticlePage(category, uuid)
      → NewsStore.loadDetail(category, uuid)
        → caché de detalle o petición ya en curso
        → si hace falta: NewsContentService.getArticleDetail(category, uuid)
          → GET /news-fixtures/<category>_data.json → newsFixtureDetail()

Vista
  → NewsStore.articleFor(category, uuid)
  → toNewsDetailViewModel(detail, category)
  → modelo de presentación: título, autores, imagen, sumario y párrafos
```

DETALLE no solicita el listado de titulares. La categoría de la URL permite localizar el archivo de fixtures incluso al abrir un enlace directamente o recargar el navegador.

Si el detalle ya se cargó desde HOME o CATEGORÍA, el store lo reutiliza. Pedir otra noticia de la misma categoría requiere una nueva llamada a NewsContentService si ese UUID no está en la caché del store.

- Categoría inválida, UUID ausente en fixtures o respuesta HTTP 404: “Article not found”.
- Otros errores: mensaje de carga fallida y botón “Try again”.
- Cambiar los parámetros de la ruta cambia el artículo mostrado, aunque Angular reutilice el componente.

Los enlaces de las tarjetas y de Breaking incluyen siempre categoría y UUID.

## Lectura de fixtures

`NewsContentService` tiene dos operaciones:

| Operación | Archivo y conversión |
| --- | --- |
| `getCategory(category)` | `GET /news-fixtures/<category>.json` → `toNewsHeadlines()` |
| `getArticleDetail(category, uuid)` | `GET /news-fixtures/<category>_data.json` → `newsFixtureDetail(response, uuid)` |

El servicio no mantiene estado, cachés ni peticiones compartidas. Solo solicita el archivo de detalles al llamar a `getArticleDetail()`; cada llamada devuelve únicamente la noticia solicitada.

Descargar el objeto completo no añade todas sus noticias al store: solo se guarda la noticia solicitada. Toda la caché de la aplicación y la deduplicación de peticiones se gestionan en `NewsStore`.

## Fixtures y generación

Los originales están en `src/_data/<category>.json`. Son respuestas con datos completos de las noticias, incluidas las URLs de sus imágenes en `thumbnail`.

`npm run generate:fixtures` ejecuta `scripts/generate-news-fixtures.mjs` y genera:

```text
public/news-fixtures/<category>.json       # array de titulares, conserva el orden
public/news-fixtures/<category>_data.json  # objeto de detalles, indexado por UUID
```

Titulares:

```json
[
  {
    "uuid": "article-1",
    "title": "Titular",
    "publisher": "Medio",
    "authors": ["Autor"]
  }
]
```

Detalles:

```json
{
  "article-1": {
    "uuid": "article-1",
    "title": "Titular",
    "publisher": "Medio",
    "authors": ["Autor"],
    "thumbnail": "https://example.com/sports.jpg",
    "topics": ["sports"],
    "published_at": "2026-09-19T19:12:00.000Z",
    "original_url": "https://example.com/article",
    "incipit": "Sumario",
    "body": "Texto completo"
  }
}
```

Se conservan los detalles de todas las noticias, no solo las destacadas. Todas utilizan el `thumbnail` original; el generador no copia imágenes ni sustituye sus URLs por rutas locales.

Los temas disponibles están en `core/constants/news-topics.constants.ts`. `NewsTopic` se deriva de ese catálogo en `core/models/news/news-topic.model.ts`; `toNewsTopic()` valida las rutas desde `core/utils/news-topic.utils.ts`. La sección de entretenimiento combina MOVIES, TV, MUSIC y GAMING; no utiliza una categoría ENTERTAINMENT.

## Caché, estados y errores

El store mantiene dos cachés independientes:

- Titulares por categoría: `topicStates`.
- Detalles completos por categoría y UUID: `detailStates`.

Cada entrada tiene estado `idle`, `loading`, `loaded` o `error`. Un error conserva el motivo para consultarlo desde la página. Una carga correcta o un reintento elimina el error anterior. Un listado vacío también es una carga correcta.

Las peticiones simultáneas del mismo recurso comparten una promesa. La existencia de un cuerpo no se utiliza para decidir si un detalle está cargado: se consulta su estado explícito.

Selectores sin peticiones:

| Selector | Resultado |
| --- | --- |
| `headlinesFor(category)` | Titulares originales normalizados |
| `articlesFor(category)` | Artículos de presentación enriquecidos con detalles disponibles |
| `articleFor(category, uuid)` | Detalle completo guardado |
| `statusFor()` / `errorFor()` | Estado y error del listado |
| `detailStatusFor()` / `detailErrorFor()` | Estado y error de un detalle |

La caché y la selección de HOME viven en memoria durante la sesión de Angular. Se conservan al navegar y se pierden al recargar el navegador. No hay almacenamiento persistente ni backend propio.

## Tiempo

`WeatherComponent` inicia un `resource` de Angular al crearse:

```text
WeatherComponent → WeatherApiDataService.getWeather()
  → getLocation() → ipapi → locationResponseData()
  → Open-Meteo → weatherResponseData()
  → temperatura y unidades, WEATHER_CODES y WEATHER_CODE_ICONS
```

El componente solo muestra el resultado cuando hay datos. Mientras carga o si falla la petición, no renderiza contenido. Los SVG animados se leen desde `public/images/weather/`. El recurso se destruye con el componente; no hay store ni caché adicional para el tiempo.

## Organización de tests

Los tests están en carpetas `tests/` dentro de cada área: `src/app/tests/`, `core/services/news/tests/`, `core/services/weather/tests/`, `shared/components/tests/`, `core/stores/tests/`, `features/home/tests/` y `features/detail/tests/`. Se ejecutan todos con `npm test -- --watch=false`.
