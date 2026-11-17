# server-explorer Specification

## Purpose

Defines requirements for the public `/servers` explorer page — listing, search, pagination, and server card rendering, including avatar loading behaviour.
## Requirements
### Requirement: Lazy Avatar Loading on Server Cards
The `/servers` explorer SHALL render each server card's avatar with lazy loading and asynchronous decoding so that off-screen avatars do not compete with above-the-fold content for bandwidth and main-thread time.

#### Scenario: Avatar is deferred until needed
- **WHEN** a server card's avatar is below the fold on the `/servers` page
- **THEN** the browser defers fetching and decoding that avatar until it approaches the viewport

#### Scenario: Avatar dimensions prevent layout shift
- **WHEN** an avatar is lazily loaded
- **THEN** its `width` and `height` (36×36) are set so no layout shift occurs when it arrives

### Requirement: On-Demand Create Server Dialog
The `/servers` explorer SHALL load the create-server dialog on demand so that the ProseMirror editor bundle is not included in the initial page payload. Image upload helpers used by the dialog SHALL live in a module that does not import `@tiptap/pm/state`.

#### Scenario: Dialog is code-split
- **WHEN** the `/servers` page is loaded
- **THEN** the create-server dialog code (and its transitive ProseMirror imports) is not in the initial bundle

#### Scenario: Dialog loads on open
- **WHEN** a user opens the create-server dialog
- **THEN** the dialog module is fetched and rendered

#### Scenario: Upload helper is tiptap-free
- **WHEN** a module imports the image upload helper
- **THEN** it does not transitively import `@tiptap/pm/state`

### Requirement: Server List Query Behaviour
The `/servers` explorer SHALL fetch the server list in pages of 24 items and SHALL NOT force-refetch on window focus or component mount. Query data SHALL be considered fresh for 60 seconds.

#### Scenario: First page size
- **WHEN** the `/servers` explorer performs its initial fetch
- **THEN** it requests `size: 24`

#### Scenario: No forced refetch on focus
- **WHEN** the browser window regains focus while the `/servers` data is fresh
- **THEN** no refetch is triggered

#### Scenario: Stale window
- **WHEN** the `/servers` data is older than 60 seconds
- **THEN** the next access triggers a background refetch

### Requirement: Client-Side Server List Fetching with Skeletons
The `/servers` explorer SHALL render the page shell immediately upon navigation and display skeleton card placeholders while fetching the server list on the client.

#### Scenario: Instant navigation and skeleton display
- **WHEN** a user navigates to `/servers`
- **THEN** the page shell and skeleton cards render immediately without waiting for backend API responses

#### Scenario: Background query loading
- **WHEN** `PageClient` mounts on the client
- **THEN** `InfiniteApiItem` initiates a request for the first page of servers and replaces the skeleton cards upon receipt

### Requirement: Non-Blocking Metadata Generation
The `/servers` page metadata SHALL be generated without issuing network requests to the server list API.

#### Scenario: Metadata generated without backend queries
- **WHEN** `/servers` metadata is generated
- **THEN** title, description, and alternates are produced without calling `api.v4.servers.findAll`

