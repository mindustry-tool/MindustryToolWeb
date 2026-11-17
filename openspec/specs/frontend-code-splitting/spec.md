# frontend-code-splitting Specification

## Purpose
TBD - created by archiving change frontend-bundle-optimization. Update Purpose after archive.
## Requirements
### Requirement: Global Navigation Chunk Independence from Heavy Animation Libraries
The global navigation components within `apps/frontend/app/[locale]/(with-navbar)` SHALL NOT import or bundle heavy animation libraries (`framer-motion`) for static layout badges or standard link indicators.

#### Scenario: Inspect navbar badge rendering
- **WHEN** inspecting `apps/frontend/app/[locale]/components/navbar-badge.tsx`
- **THEN** it renders counts using standard semantic HTML elements (e.g. `<p>`) and does not import `motion` from `framer-motion`.

#### Scenario: Inspect nav link indicator styling
- **WHEN** inspecting `apps/frontend/components/common/nav-link.tsx`
- **THEN** active and hovered tab indicator states are styled and animated via CSS transitions without importing `framer-motion`.

### Requirement: Decoupling of Tree Utilities from Rich Text Rendering Engines
Pure data-structure utilities for tree hierarchy construction SHALL NOT be co-located in the same module as heavy rich-text rendering engines (TipTap / ProseMirror).

#### Scenario: Wiki navigation imports tree builder
- **WHEN** wiki actions or pages require `buildTree`
- **THEN** they import `buildTree` from `apps/frontend/lib/wiki-tree.ts`, which has zero dependencies on `@tiptap/*`.

### Requirement: Direct Subpath Imports for Generator Tool Components
Generator tool pages SHALL import shared dialogs and action components directly from their dedicated files instead of importing from an index barrel file that re-exports heavy image processing or cropping libraries.

#### Scenario: Generator tool imports dialog components
- **WHEN** `canvas-generator`, `sorter-generator`, or `logic-display-generator` imports shared tool components
- **THEN** imports target explicit paths (e.g., `@/components/tools/CopyDialog`, `@/components/tools/SchematicActions`) rather than the `@/components/tools` barrel export.

### Requirement: Elimination of Unused UI Libraries and Components
The frontend application SHALL NOT retain unused third-party dependencies in `package.json` nor unreferenced component wrappers in `components/ui/`.

#### Scenario: Dependency manifest inspection
- **WHEN** inspecting `apps/frontend/package.json`
- **THEN** `cmdk`, `embla-carousel-react`, and the `radix-ui` meta-package are not present, and `components/ui/command.tsx` and `components/ui/carousel.tsx` do not exist.

