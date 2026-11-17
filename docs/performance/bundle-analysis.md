# `/servers` Bundle Analysis Report

**Date:** 2026-11-07
**Scope:** `apps/frontend` production bundle (vinext build), focused on the `/servers` route.
**Tooling:** `@next/bundle-analyzer` (Next.js build, Turbopack-incompatible; `next experimental-analyze` server used for interactive inspection). The vinext build's `vite-reporter` only emits a generic >500 KB chunk warning, so per-chunk attribution below is taken from the audit measurements in `docs/performance/servers-page-audit.md` and the known import graph.

## Measurements

| Signal | Value |
|---|---|
| Chunks | 155 |
| Decompressed JS | ~1.88 MB |
| CSS | 224 KB |
| HTML (cached route) | 221,607 bytes |

### Largest chunks

| Chunk | Size | Suspected contents |
|---|---|---|
| `index` | 407 KB | App bootstrap, shared providers, router |
| `client` | 255 KB | React client runtime wiring |
| `framework` | 186 KB | React / scheduler / ReactDOM |
| `vinext` | 160 KB | vinext runtime shims |
| `proxy` | 118 KB | i18n middleware bundle (locale detection) |
| `state` | 87 KB | ProseMirror (`@tiptap/pm/state`) — **leak** (fixed by P6) |
| `schemas` | 60 KB | Zod schemas |
| `form` | 38 KB | Form primitives |

~130 additional shared chunks (navbar/sidebar, Radix UI, motion, providers) account for the remainder. P6 (lazy `CreateServerDialog` + extracted `handleImageUpload`) removes the 87 KB ProseMirror leak from the initial bundle.

## Findings

1. **ProseMirror leak (P6)** — `tiptap-utils.ts` imported `@tiptap/pm/state` at runtime, dragging 87 KB into `/servers` even though the editor is only used in the create-server dialog and comment/post editors. Fixed by extracting `handleImageUpload`/`MAX_FILE_SIZE` into `lib/image-upload.ts` and lazy-loading `CreateServerDialog`.
2. **Shared mega-chunks** — `index` (407 KB) and `client` (255 KB) are dominated by providers (QueryProvider, SessionProvider, I18nProvider, ThemeProvider, NuqsAdapter, CookieProvider, MessageProvider) that run on every route. These cannot be removed from `/servers` without route-level code splitting.
3. **Radix + motion** — the sidebar/navbar pulls Radix primitives and `motion` into the shared chunk. Lazy-loading motion and deferring non-critical Radix components would shrink `index`.
4. **Zod schemas (60 KB)** — `schemas` chunk holds the full API Zod schemas. With `skipResponseValidation: true` on the client, runtime validation is skipped, but the types are still bundled. Tree-shaking opportunities exist.
5. **`proxy` chunk (118 KB)** — the i18n middleware bundle is shipped to the client. With P1 narrowing the matcher, this chunk still loads for locale-less hits; further reduction requires moving locale detection server-side (out of scope).

## Proposed split plan (follow-up change)

- **5B — Route-level code splitting for shared providers**: move `SessionProvider`, `MessageProvider`, and `CookieProvider` behind `next/dynamic` with `ssr: false` where they are not needed for first paint; defer `NuqsAdapter` hydration.
- **5C — Fix blind modulepreloads**: the 153 `modulepreload` links in the initial HTML preload every shared chunk. Replace with a curated preload list (entry + framework + vinext + index only) and let the rest load on demand.
- **Lazy motion**: replace `motion/react` `AnimatePresence` in `CreateServerDialog` (already code-split) and other non-critical sites with CSS transitions or dynamic import.
- **Zod tree-shaking**: import only the schemas actually used on `/servers` instead of the barrel `@mindustry-tool/api`.

## Interactions

- **P6** already removes the 87 KB ProseMirror leak; re-run this report after P6 to measure the delta.
- **P1** (static shell caching) makes the cached HTML useful; the split plan above reduces the JS that runs after hydration, improving TTI on top of P1's TTFB win.
- **P12** (lazy avatars) is independent and already applied.

## Reproducibility

Re-run with `ANALYZE=true pnpm --filter frontend build` (Next.js) or `pnpm --filter frontend build:vinext` (vinext). Note: `@next/bundle-analyzer` is not compatible with Turbopack builds, so the Next.js build emits only the "no report will be generated" notice; use `next experimental-analyze` for interactive inspection. The vinext build emits a generic >500 KB chunk warning only. Per-chunk attribution therefore relies on the audit measurements above until a Turbopack-compatible analyzer is adopted.