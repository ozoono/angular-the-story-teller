# Angular Project Architecture & Coding Standards

This document outlines the conventions, architectural patterns, and code practices for this digital newspaper application built with Angular v22+.

---

## 1. Project Structure

The project follows a **Domain-Driven & Feature-Based Modular Architecture** optimized for Standalone Components and Angular Signals.

```text
src/app/
├── core/                   # Singleton services, global models, and interceptors
│   ├── interceptors/       # HTTP interceptors (e.g., API key, handling headers)
│   ├── models/             # TypeScript interfaces and types
│   └── services/           # Data services (using httpResource / Signals)
│
├── shared/                 # Reusable components, pipes, and directives
│   ├── ui/                 # Reusable newspaper visual blocks
│   │   ├── hero-news/      # Main headline/cover feature
│   │   ├── news-grid/      # Multi-column grid layout
│   │   ├── news-card/      # Individual reusable article card
│   │   └── news-ticker/    # Breaking news banner
│   └── components/         # General layout elements (Navbar, Footer, Layout wrapper)
│
├── features/               # Route-level page components
│   ├── home/               # Front cover page
│   │   ├── home.component.ts
│   │   └── home.routes.ts
│   │
│   └── article-detail/     # Full article reader page
│       ├── article-detail.component.ts
│       └── article-detail.routes.ts
│
├── app.component.ts        # Root application layout
├── app.config.ts           # Application-wide providers (HTTP, Router, etc.)
└── app.routes.ts           # Top-level route definitions (Lazy Loading)
```

---

## 2. Naming Conventions

Always use explicit suffixes in filenames and class names to ensure code readability and maintain consistent developer tooling support.

| Entity Type | Filename Pattern | Class / Function Name Pattern | Example |
| :--- | :--- | :--- | :--- |
| **Component** | `*.component.ts` | `[Name]Component` | `NewsCardComponent` |
| **Service** | `*.service.ts` | `[Name]Service` | `NewsApiService` |
| **Model / Interface** | `*.model.ts` | `[Name]` / `[Name]Response` | `Article`, `NewsResponse` |
| **Interceptor** | `*.interceptor.ts` | `[name]Interceptor` | `apiKeyInterceptor` |
| **Route File** | `*.routes.ts` | `[name]Routes` | `homeRoutes` |
| **Guard** | `*.guard.ts` | `[name]Guard` | `authGuard` |

---

## 3. Core Coding Practices

### Standalone Components
* **No `NgModule`:** All components, directives, and pipes must be standalone (`standalone: true` is default in modern Angular).
* Explicitly import dependencies within the `@Component({ imports: [...] })` array.

### State & Reactivity with Signals
* **Signal Inputs/Outputs:** Use functional signal inputs (`input()`, `input.required()`) and outputs (`output()`).
* **State Management:** Use `signal()`, `computed()`, and `effect()` for reactive state instead of manual RxJS subscriptions when handling UI state.
* **HTTP Requests:** Use modern Angular resource APIs (`httpResource` or `rxResource`) inside services for declarative data fetching.

### Control Flow
* Use built-in control flow syntax instead of legacy structural directives:
  * `@if (condition) { ... } @else { ... }` (instead of `*ngIf`)
  * `@for (item of items; track item.id) { ... }` (instead of `*ngFor`)
  * `@switch (value) { ... }` (instead of `*ngSwitch`)

### Data Flow & Component Roles
* **`core/`**: Holds API integration and global state management logic.
* **`shared/ui/`**: Pure presentational/dumb components that receive data via `input()` and communicate actions via `output()`.
* **`features/`**: Smart components/pages that inject services, read route params, and compose presentational components from `shared/ui/`.

## Tooling & Code Quality

### Biome (Linter & Formatter)
- **Engine**: Use **Biome** instead of ESLint/Prettier for TypeScript and HTML formatting/linting.
- **Formatting**:
  - Tab width: 2 spaces.
  - Line width: 100 characters.
  - Single quotes for TS files, double quotes for HTML templates.
- **Linting Rules**: Enforce strict type checking, unused import removal, and clean syntax formatting on save.
- **Import Path Alias**: Imports for application source files MUST use the `@` path alias (e.g., `import { Article } from '@/core/models/article.model.js';`). Do not use relative paths for application imports.
- **Explicit File Extensions in Imports**: All TypeScript import paths MUST include explicit file extensions (e.g., `import { Article } from '@/core/models/article.model.js';` or `.ts` as configured in the project settings).

### StyleLint & CSS
- **Stylesheets**: Use CSS; SCSS is not used in this project.
- **CSS Class Naming**: Use BEM naming conventions for CSS classes (`.block`, `.block__element`, `.block--modifier`).
- **Colors**: Define color values only in `src/app/styles/variables.css` and reference them with CSS custom properties. Do not use color literals elsewhere.
- **Property Ordering (`stylelint-order`)**: All CSS rules must strictly follow the defined property order configured in `stylelint.config.js`.
