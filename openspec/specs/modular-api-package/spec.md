## ADDED Requirements

### Requirement: Subpath Export Architecture
The `@mindustry-tool/api` package SHALL expose discrete subpath entrypoints for types, constants, schemas, routes, client, and utils, and SHALL NOT allow umbrella root barrel imports that re-export all layers together.

#### Scenario: Subpath import resolution
- **WHEN** a consumer package imports from `@mindustry-tool/api/routes`, `@mindustry-tool/api/client`, `@mindustry-tool/api/schemas`, `@mindustry-tool/api/types`, `@mindustry-tool/api/constants`, or `@mindustry-tool/api/utils`
- **THEN** the TypeScript compiler and module bundler resolve only that subpath's declarations and compiled output.

### Requirement: Domain Route Decomposition
The API route definitions SHALL be partitioned into domain-specific files under `src/routes/v4/` with each domain file encapsulating routes for that specific domain entity, and the combined `api` object SHALL be assembled and exported from `@mindustry-tool/api/routes`.

#### Scenario: Accessing domain routes via composed api
- **WHEN** consumer code accesses `api.v4.users.getById` or `api.v4.posts.getAll` via `@mindustry-tool/api/routes`
- **THEN** the route definition matches the expected route contract, method, query, params, and response types.

### Requirement: Acyclic Package Internals
Internal modules within `@mindustry-tool/api` SHALL strictly adhere to a directed acyclic graph (DAG) where constants and types do not import schemas, schemas do not import routes, and utilities do not import root barrels.

#### Scenario: Running circular dependency validation on api package
- **WHEN** the cycle detection tool scans `packages/api/src`
- **THEN** zero circular dependencies are detected.

### Requirement: Zero Any Typing
All typings and helper generic constraints in `@mindustry-tool/api/types` SHALL avoid explicit `any`, implicit `any`, or `as any`.

#### Scenario: Type checking api package without any
- **WHEN** `packages/api` is typechecked with TypeScript strict mode
- **THEN** no explicit `any` types or unsafe typing casts are present in route or client helper definitions.
