# i18n Specification

## Purpose

Defines requirements for the internationalization (i18n) subsystem, including static frontend translation bundling, target language key completeness, translation editor UX, and two-way Git-based synchronization between the monorepo and the public translation repository.

## Requirements

### Requirement: Static Local Translation Bundling
The frontend i18n system SHALL load translation files directly from local static JSON bundles located under `apps/frontend/app/i18n/locales/{{lng}}/{{ns}}.json` without making runtime remote HTTP requests to backend translation endpoints. The server-rendered i18n payload SHALL include only the active locale's bundles; the configured fallback locale SHALL NOT be bundled eagerly.

#### Scenario: Client and server translation resolution
- **WHEN** i18n initializes or a language/namespace is switched
- **THEN** the system resolves translations from local static resources without issuing HTTP requests to backend translation routes

#### Scenario: Fallback resolution without saveMissing requests
- **WHEN** an undefined translation key is evaluated at runtime
- **THEN** the runtime resolves the fallback string locally and does not dispatch remote HTTP `saveMissing` requests

#### Scenario: Complete language coverage
- **WHEN** static locale translation files are verified
- **THEN** all supported languages (`en`, `vi`, `kr`, `cn`, `jp`, `ru`, `ua`, `fr`, `de`, `id`, `be`) contain translated keys matching the English reference keys

#### Scenario: Single-locale server bundle
- **WHEN** a page is server-rendered for a non-default locale
- **THEN** only that locale's translation bundles are included in the server-rendered i18n payload; the fallback locale's bundles are not duplicated

---

### Requirement: Translation Editor User Interface
The translation management editor SHALL provide intuitive input ergonomics including scroll chaining and original-text copying shortcuts.

#### Scenario: Textarea scroll chaining
- **WHEN** a user hovers over a translation textarea and scrolls the mouse wheel
- **THEN** the textarea does not block wheel propagation, and the parent container scrolls naturally

#### Scenario: Copy original reference text shortcut
- **WHEN** a user focuses any translation input in the editor and presses `Ctrl+C`
- **THEN** the editor copies the content from the reference language (first language) input to the clipboard

---

### Requirement: Bidirectional Git Synchronization Workflow
The repository SHALL provide automated commands (`pnpm i18n:*`) for two-way synchronization with the public translation repository (`MindustryToolWebTranslation`) using Git's native 3-way merge engine.

#### Scenario: Directory mapping and private code isolation
- **WHEN** synchronization operations execute
- **THEN** files under `apps/frontend/app/i18n/locales/<lang>/<ns>.json` map directly to `locales/<lang>/<ns>.json` in the public repository, completely excluding any monorepo files outside that folder

#### Scenario: Inspecting sync status (`pnpm i18n:status`)
- **WHEN** a developer runs `pnpm i18n:status`
- **THEN** the system computes diffs between local working tree, monorepo HEAD, and the public repository, reporting uncommitted files or pending incoming/outgoing commits

#### Scenario: Pulling remote translations (`pnpm i18n:pull`)
- **WHEN** a developer runs `pnpm i18n:pull`
- **THEN** the system validates that working tree is clean, merges non-conflicting remote updates into `apps/frontend/app/i18n/locales`, and on conflicts inserts standard 3-way conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) for manual resolution

#### Scenario: Publishing translations (`pnpm i18n:push`)
- **WHEN** a developer runs `pnpm i18n:push`
- **THEN** the system synthesizes a clean commit on the public repository containing only `locales/` without leaking monorepo history

#### Scenario: Zero-config remote initialization
- **WHEN** any `pnpm i18n:*` command runs on a repository where the translation remote is not yet configured
- **THEN** the script automatically registers `i18n-remote` and initializes tracking refs

---

### Requirement: Edge-Safe Local Translation Resource Loader
The translation resource loader SHALL detect environments lacking physical filesystem access (such as Cloudflare Workers and Edge runtimes) and directly import translation JSON modules without attempting `fs.readFile` or throwing filesystem exceptions.

#### Scenario: Translation resolution in Cloudflare Worker runtime
- **WHEN** the i18n subsystem resolves a namespace resource inside a Cloudflare Worker or Edge isolate
- **THEN** it directly dynamically imports the target locale JSON module without calling `fs.readFile` or raising `ENOENT` exceptions

#### Scenario: Translation resolution in Node.js runtime
- **WHEN** the i18n subsystem resolves a namespace resource in a standard Node.js server environment with filesystem access
- **THEN** it reads the locale file from the filesystem path and parses the JSON content

---

### Requirement: Demand-Driven Server Language Preloading
The server-side i18next configuration SHALL NOT preload all supported languages during isolate initialization and SHALL load languages and namespaces on demand.

#### Scenario: Isolate initialization without universal language preloading
- **WHEN** the server i18next instance is initialized on a new isolate
- **THEN** it does not eagerly load all 11 supported languages simultaneously, deferring loading until a specific language/namespace is requested

---

### Requirement: Root Layout Translation Serialization
The root layout component SHALL load and serialize only shared global namespaces (`common`, `notification`, `donate`) into the client HTML hydration payload rather than importing and serializing all registered namespaces.

#### Scenario: Root layout prepares SSR hydration resources
- **WHEN** the root layout renders and prepares the `I18nProvider` resources
- **THEN** it requests and extracts only global shared namespaces (`common`, `notification`, `donate`) for the active locale, keeping SSR CPU execution time within platform limits

---

### Requirement: Static Namespace Consolidation
The frontend i18n subsystem SHALL consolidate shared UI and metadata translations into `common.json`, maintaining discrete namespaces only for major standalone domains.

#### Scenario: Common namespace resolution
- **WHEN** components request layout, search, footer, metadata, or generic interaction strings
- **THEN** translations resolve directly from `common.json` without requiring separate micro-namespace files
