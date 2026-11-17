# edge-page-caching Specification

## Purpose

Route-level static rendering and edge caching on Cloudflare for locale-prefixed paths, including the middleware matcher rule and default revalidate.
## Requirements
### Requirement: Locale-Prefixed Routes Are Statically Renderable
The frontend SHALL render locale-prefixed routes statically (with route-level `revalidate`) and SHALL NOT invoke the i18n middleware for paths that already carry a locale segment, including bare locale home roots, so that such routes are eligible for edge caching.

#### Scenario: Middleware is skipped for localized paths
- **WHEN** a request arrives for `/en/servers` (or any other locale-prefixed subpath)
- **THEN** the i18n middleware does not run, and the route is not force-marked dynamic

#### Scenario: Middleware is skipped for bare locale home roots
- **WHEN** a request arrives for `/en` (or any other supported locale without trailing path segments)
- **THEN** the i18n middleware does not run, allowing the page to be statically rendered and cached at the Cloudflare edge

#### Scenario: Locale-less paths still redirect
- **WHEN** a request arrives for `/servers` (no locale)
- **THEN** the middleware runs and redirects to `/en/servers`

#### Scenario: Default revalidate
- **WHEN** a locale-prefixed route does not override `revalidate`
- **THEN** it inherits `revalidate = 3600` (1 hour) from the root layout

#### Scenario: Servers revalidate override
- **WHEN** `/servers` is rendered
- **THEN** its effective revalidate is 60 seconds (the minimum of 3600 and 60)

#### Scenario: Dynamic routes stay dynamic
- **WHEN** a route uses dynamic params without `generateStaticParams`, or calls `cookies()`/`headers()`/`draftMode()`/`connection()`
- **THEN** it remains dynamically rendered and is not cached at the edge, UNLESS the route explicitly sets a `revalidate` value, in which case on-demand ISR applies per the "Detail routes use on-demand ISR" requirement

### Requirement: Detail routes use on-demand ISR
The frontend SHALL render `/schematics/:id` and `/maps/:id` on demand on the first request and cache the result at the edge for 300 seconds (5 minutes), instead of SSR-ing every request, because these routes explicitly set `revalidate = 300`.

#### Scenario: First request renders and caches
- **WHEN** the first request arrives for a given `/schematics/:id` or `/maps/:id`
- **THEN** the route is server-rendered and the result is cached for 300 seconds

#### Scenario: Repeat request within window is served from cache
- **WHEN** a request arrives for the same path within 300 seconds of the cached entry
- **THEN** the cached HTML is served without re-running SSR or backend API calls

#### Scenario: Cache expiry triggers re-render
- **WHEN** 300 seconds have elapsed since the cached entry
- **THEN** the next request triggers a fresh render and refreshes the cache

#### Scenario: Other dynamic routes unaffected
- **WHEN** a dynamic-param route other than `/schematics/:id` or `/maps/:id` is rendered without `revalidate`
- **THEN** it remains fully dynamic and uncached per the "Dynamic routes stay dynamic" scenario

### Requirement: Homepage and list pages deduplicate rebuild fetches
The frontend SHALL avoid duplicate backend fetches within a single render pass of the homepage and the `/schematics` and `/maps` list pages by reusing cached fetch results (React `cache()`) between `generateMetadata` and the page component.

#### Scenario: Single fetch per data source per rebuild
- **WHEN** the homepage or a list page is rebuilt
- **THEN** each distinct backend query (`schematics.findAll`, `maps.findAll`) is executed at most once during that render pass

#### Scenario: Comment section is client-only on detail pages
- **WHEN** a detail page (`/schematics/:id` or `/maps/:id`) is server-rendered
- **THEN** the `CommentSection` (tiptap editor) is NOT included in the server-rendered output; it loads on the client

#### Scenario: Detail page revalidate value
- **WHEN** `/schematics/:id` or `/maps/:id` is rendered
- **THEN** its effective `revalidate` is 300 seconds (5 minutes)

