# monorepo-dependencies Specification

## Purpose
Defines standards and governance for workspace dependency declarations, phantom dependency prevention, and version synchronization across apps and packages in the monorepo.
## Requirements
### Requirement: Root Package Manifest Cleanliness
The root `package.json` SHALL NOT define any runtime `dependencies`. All developer tooling, linters, code formatters, and workspace orchestrators SHALL be defined under `devDependencies`.

#### Scenario: Inspect root package dependencies
- **WHEN** the root `package.json` is inspected
- **THEN** it contains no `"dependencies"` object (or an empty one), and development tools such as `prettier` and `typescript` are placed under `"devDependencies"`.

### Requirement: Direct Dependency Declaration
Every workspace project (`packages/*`, `apps/*`) SHALL explicitly declare all third-party libraries that its source code directly imports in its own `package.json`. No workspace package SHALL rely on phantom dependencies hoisted from parent or sibling packages.

#### Scenario: Frontend imports Zod
- **WHEN** `apps/frontend` code imports `zod` or `zod/v4-mini`
- **THEN** `apps/frontend/package.json` contains `"zod"` in its `"dependencies"` matching the monorepo-wide version range `^4.1.13`.

#### Scenario: API package TypeScript dependency categorization
- **WHEN** `packages/api/package.json` is inspected
- **THEN** `typescript` is declared under `"devDependencies"` rather than runtime `"dependencies"`.

### Requirement: Shared Tooling and Utility Version Alignment
Shared development tooling (`typescript`, `eslint`, `typescript-eslint`, `@eslint/eslintrc`, `globals`) and common utilities (`uuid`, `eventsource-parser`) SHALL use synchronized version strings across all workspace manifests where they are consumed.

#### Scenario: Workspace typechecking and linting tools parity
- **WHEN** examining `typescript` and ESLint ecosystem packages across `package.json`, `packages/api`, `apps/backend`, and `apps/discord-bot`
- **THEN** `typescript` is unified to `^5.9.3` across all packages, and ESLint tooling versions are unified across root, backend, and discord-bot.

#### Scenario: Shared utility versions
- **WHEN** checking `uuid` and `eventsource-parser` declarations
- **THEN** `uuid` is specified as `^11.1.1` across frontend, backend, and discord-bot, and `eventsource-parser` is specified as `^3.0.6` in both api and backend packages.

