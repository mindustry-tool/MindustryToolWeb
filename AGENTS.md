# AGENT.md

## General Rules

These rules apply to all code written or modified in this repository.

- Always remove legacy codes unless asked not to, remove comments that state what the code already does or explain what changed between edit

### TypeScript

- **The use of `any` is strictly forbidden.**
- Do not use explicit `any`, implicit unsafe typing, or `as any`.
- Use proper types, generics, `unknown`, type guards, discriminated unions, or existing project types instead.
- If the correct type is unclear, investigate the existing codebase before introducing a workaround.

### Frontend & Internationalization

- **All user-facing text must be translated.**
- Never hardcode user-visible strings directly in frontend components.
- Always add an appropriate i18n key when introducing new text.
- Reuse existing translation keys when they accurately match the intended meaning.
- Ensure all supported locales are updated when adding new translation keys.

### Bundle Size & Code Splitting

- **Ensure frontend libraries and third-party dependencies are properly structured for code splitting.**
- When introducing or consuming a library in the frontend (or a package that wraps third-party dependencies), ensure it is cleanly modularized and code-split (e.g., using dynamic imports or lazy loading) to prevent bundle size inflation.
- Avoid eagerly importing heavy or non-critical dependencies into initial page bundles; prefer tree-shakable and subpath imports where available.

### API Data Fetching

- Prefer using **`ApiInstance`** and **`ApiItem`** whenever possible when fetching or interacting with API data.
- Do not introduce custom API-fetching implementations when an existing `ApiInstance` or `ApiItem` solution can be used.
- Follow existing API abstractions and patterns in the codebase.

### Backend Routes

- Backend routes must be declared using **`@Route`**.
- Do not introduce alternative route declaration patterns unless explicitly required by the existing architecture.
- Follow the project's established route structure and conventions.

### Real-Time Communication

- **Prefer Server-Sent Events (SSE) over WebSockets.**
- Do not introduce WebSockets unless SSE cannot technically satisfy the requirement.
- Before using WebSockets, verify that the feature genuinely requires bidirectional, low-latency communication that SSE cannot provide.

### Edge Caching & Probing Verification

- **Probing Tooling / Verification:** Whenever verifying edge caching on page routes with curl, include the browser `Accept` header (e.g. `curl -I -H "Accept: text/html" <url>`). Without `Accept: text/html`, `vinext` classifies incoming GET requests for App Router pages as `app-route` rather than `html`, which causes it to reject edge cache admission and emit `Cache-Control: no-store, must-revalidate`.

### Database Safety

- **Do not perform harmful or destructive database actions.**
- Never drop databases, tables, schemas, or collections unless explicitly requested and confirmed.
- Never run destructive migrations or bulk deletions without clear justification.
- Avoid `DELETE`, `TRUNCATE`, `DROP`, or destructive updates unless absolutely necessary.
- Prefer safe, reversible operations.
- Before modifying production-sensitive data, carefully inspect the scope and potential impact.
- Never delete or modify data merely to simplify development, testing, or debugging.
- When database changes are required, preserve existing data whenever possible.

## Before Completing a Task

Before considering a task complete, verify:

- No `any` types were introduced.
- All new frontend user-facing text uses i18n.
- `ApiInstance` and `ApiItem` were used where applicable.
- Backend routes use `@Route`.
- SSE was preferred over WebSockets where real-time communication is needed.
- No harmful or unnecessary database actions were performed.
- Edge caching verification with curl used the browser `Accept: text/html` header where applicable.
- Frontend libraries and dependencies are properly code-split to avoid bundle size bloat.
- The implementation follows existing project conventions.
