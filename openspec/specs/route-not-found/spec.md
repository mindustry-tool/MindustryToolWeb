# route-not-found Specification

## Purpose

Defines requirements for route-level 404 handling on detail pages, including rendering the nearest not-found UI for missing primary entities, keeping non-404 and secondary-fetch failures on graceful inline handling, and keeping metadata generation throw-free.
## Requirements
### Requirement: Primary entity 404 renders not-found UI
Detail route pages SHALL render the nearest `not-found.tsx` UI when the primary entity fetch fails with an HTTP 404, instead of rendering raw error text.

#### Scenario: Missing schematic renders not-found card
- **WHEN** a user visits a schematic detail URL whose id does not exist and the API responds 404
- **THEN** the system renders the nearest `not-found.tsx` (`NotFoundCard` with back/home actions) rather than `ApiError` text

#### Scenario: Missing map, post, user, or wiki entry renders not-found card
- **WHEN** a user visits a map, post, user, or wiki detail URL whose id does not exist and the API responds 404
- **THEN** the system renders the nearest `not-found.tsx`, falling back to the closest parent `not-found.tsx` where no route-specific one exists

---

### Requirement: Non-404 errors keep inline error rendering
Detail route pages SHALL NOT trigger the not-found UI for non-404 failures; those MUST continue to render the existing inline error UI.

#### Scenario: Forbidden entity shows authorization error
- **WHEN** the primary entity fetch fails with HTTP 403
- **THEN** the system renders the existing authorization error message and does not render `not-found.tsx`

#### Scenario: Connection failure shows connectivity error
- **WHEN** the primary entity fetch fails with a timeout or connection error
- **THEN** the system renders the existing connectivity error message and does not render `not-found.tsx`

---

### Requirement: Metadata generation never throws
`generateMetadata` functions on detail routes SHALL handle fetch errors gracefully with an `if`-check returning fallback metadata and SHALL NEVER throw or invoke not-found behavior.

#### Scenario: Missing entity still produces metadata
- **WHEN** metadata generation runs for a detail URL whose entity does not exist
- **THEN** the system returns fallback metadata via the `if (error)` branch without throwing

---

### Requirement: Secondary fetch failures do not trigger not-found UI
Failures in secondary data fetches on detail pages (author lookup, previous/next navigation, comments) SHALL degrade gracefully in place and SHALL NOT render the route not-found UI.

#### Scenario: Missing author degrades gracefully
- **WHEN** the schematic exists but the author lookup fails
- **THEN** the detail page still renders and the author section degrades gracefully without rendering `not-found.tsx`

### Requirement: Unmatched localized URL paths render not-found UI with 404 status
The system SHALL intercept unmatched localized URL paths (single-segment or multi-segment) under `/[locale]/...` and render the localized `not-found.tsx` UI with an HTTP 404 status code instead of throwing server errors or returning HTTP 200.

#### Scenario: Multi-segment unmatched path returns 404
- **WHEN** a client sends a GET request to an unmatched multi-segment path such as `/en/.github/workflows/ci.yml` or `/en/foo/bar`
- **THEN** the system catches the route via the catch-all route, invokes `notFound()`, and returns an HTTP 404 response with the localized not-found UI

#### Scenario: Non-@me path on single-segment route returns 404
- **WHEN** a client sends a GET request to `/en/unknown-segment` that is not `@me`
- **THEN** the system invokes `notFound()` and returns an HTTP 404 response with the localized not-found UI rather than HTTP 200 OK

---

### Requirement: Root layout tolerates missing or invalid route parameters
The localized root layout SHALL safely resolve missing or invalid `locale` parameters to the default fallback language without throwing unhandled exceptions.

#### Scenario: Route miss fallback renders root layout without locale
- **WHEN** the framework renders a route-miss 404 fallback and supplies empty route parameters `{}`
- **THEN** `app/[locale]/layout.tsx` defaults `locale` to `fallbackLng` and renders the fallback boundary cleanly without calling i18next with `undefined`

---

### Requirement: Resource loader rejects invalid language keys
The i18n configuration `resourceLoader` SHALL reject undefined or non-string language values without attempting filesystem or dynamic import operations.

#### Scenario: Undefined language requested
- **WHEN** `resourceLoader` is invoked with an undefined or non-string language identifier
- **THEN** the loader returns an empty object and avoids throwing a module resolution error

