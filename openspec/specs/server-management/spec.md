# server-management Specification

## Purpose

Defines requirements for Mindustry server instance lifecycle management, modular backend service architecture, server context and settings navigation, file browsing and editing, installed map downloads, log buffering and retention, environment variable masking, and player one-time token authentication.
## Requirements
### Requirement: Modular Backend Architecture
The backend SHALL isolate server operations into dedicated domain services orchestrated by a `ServerService` coordinator facade. Server operations requiring node execution MUST be dispatched through the inbound `ManagerGateway` WebSocket RPC channel via a descriptor-based `ManagerRpcClient` rather than outbound HTTP REST or polling loops.

#### Scenario: Server manager node communication
- **WHEN** a server manager node establishes a WebSocket connection or requests port allocation
- **THEN** `ManagerGateway` handles access token authentication, registers the active connection, and coordinates with `ServerManagerService` for free port discovery

#### Scenario: Server authorization and permission evaluation
- **WHEN** an operation requires server access permissions
- **THEN** `ServerAuthorityService` evaluates cached server, manager, and group permissions, granting access only when required authorities are met

#### Scenario: Runtime lifecycle control
- **WHEN** a server is started (`host`), stopped, or paused
- **THEN** `ServerRuntimeService` dispatches execution commands to the manager node through `ManagerRpcClient` over WebSocket RPC, updates status in the database, and streams state changes over SSE

#### Scenario: Service coordinator delegation
- **WHEN** `ServerController` invokes server methods
- **THEN** `ServerService` executes core CRUD or delegates to the responsible domain service (`ServerManagerService`, `ServerAuthorityService`, `ServerRuntimeService`, `ServerFileService`, `ServerLogService`, `ServerPlayerService`, `ServerWebhookService`, `ManagerRpcClient`) communicating over WebSocket RPC

### Requirement: Server Context Navigation and Header Branding
The sidebar navigation SHALL dynamically adapt to the active server context when a user navigates within `/servers/[id]`.

#### Scenario: Server context replaces global app navigation
- **WHEN** a user navigates to `/servers/[id]` or any sub-route
- **THEN** the sidebar displays server-specific navigation links (Dashboard, Console, Map, Mods, Settings) respecting the user's permissions, and the sidebar header displays the server name instead of global app branding

#### Scenario: Return to server list
- **WHEN** a user is in server context and clicks the back/server-list navigation action
- **THEN** the application returns to the server explorer list and restores standard app navigation

---

### Requirement: Server Settings Sub-Navigation and Shared Layout
The server settings section SHALL provide independent sub-pages served by a shared layout that avoids redundant server data queries.

#### Scenario: Collapsible settings navigation
- **WHEN** viewing server navigation with `server:setting` permission
- **THEN** the sidebar displays a Config settings group containing sub-links for General (`/settings/general`), Advanced (`/settings/admin`), and Danger (`/settings/danger`), without any Pro or Plan sub-link

#### Scenario: Sub-route isolation and loading
- **WHEN** a user navigates between settings sub-pages (e.g. `/settings/general`, `/settings/admin`, `/settings/danger`)
- **THEN** server configuration is loaded once by the shared settings layout, and each sub-page manages its own view state and skeleton loading placeholders matching the target layout

#### Scenario: Legacy settings route redirect
- **WHEN** a user navigates to `/servers/[id]/settings` without a sub-route
- **THEN** the application redirects to `/servers/[id]/settings/general`

---

### Requirement: Independent Server CPU and RAM Configuration
The system SHALL allow authorized admins (`server:manage`) to configure server `cpu` and `memory` independently on the Advanced settings page (`/servers/[id]/settings/admin`) without plan presets, while allowing non-admin viewers with settings access to inspect the current values in read-only mode.

#### Scenario: Independent CPU and RAM controls
- **WHEN** an authenticated user with `server:manage` permission opens `/servers/[id]/settings/admin`
- **THEN** the form displays independent CPU (`0.1`–`4.0` vCPU, step `0.1`) and RAM (`128`–`4096` MB, step `128`) controls (each pairing a slider and numeric input) alongside `isOfficial`, `isHub`, and `isAutoTurnOff`, with no plan preset cards

#### Scenario: Updating CPU and RAM independently
- **WHEN** an admin changes only `cpu` or only `memory` within the allowed bounds (`0.1 <= cpu <= 4.0`, integer `128 <= memory <= 4096`) and submits the form
- **THEN** `PUT /servers/:id/admin` validates the payload against `adminUpdateServerSchema`, persists the updated `cpu` and `memory` values, and pushes updated desired config if the server is running

#### Scenario: Out-of-range resource values rejected
- **WHEN** a caller submits `cpu` outside `0.1`–`4.0` or `memory` outside `128`–`4096` (or non-integer `memory`) to `PUT /servers/:id/admin`
- **THEN** schema validation rejects the request and no database update occurs

#### Scenario: Non-admin read-only view
- **WHEN** a user without `server:manage` permission (who has `server:setting` access) opens `/servers/[id]/settings/admin`
- **THEN** the current `cpu`, `memory`, and flag values are displayed in read-only disabled state and cannot be edited or submitted

---

### Requirement: Remote File Management and Installed Map Downloads
The system SHALL support browsing, inline editing, and binary map downloads for files hosted on the server manager via the WebSocket file transfer protocol. Host default-plugin seeding SHALL use the same binary chunk transfer flow (generic `sendStream` with the `fileUpload` descriptor) for `mods/<filename>` before `host-server`.

#### Scenario: Inline file editing
- **WHEN** an authorized user opens a supported text or code file in the server file explorer and saves modifications
- **THEN** the system uploads the updated file content to the manager node using the WebSocket binary chunk transfer flow and refreshes the cached view

#### Scenario: Installed map download via API client
- **WHEN** an authorized user clicks the download button for an installed map file
- **THEN** the client requests the map content through `apiInstance` with `responseType: 'raw'`, which the backend fulfills by streaming binary chunks from the manager node over WebSocket, converting the payload to a Blob, and triggering a client download with the filename derived from the path basename

#### Scenario: Host seeds default plugins via chunked upload
- **WHEN** hosting a server with default plugins (both plain `host()` and SSE `host()` paths)
- **THEN** the system uploads each plugin buffer via `uploadFile` to `mods/<filename>` with SHA-256 verification before issuing `host-server`, and host fails fast with the manager error detail if any upload fails

### Requirement: Server Log Buffering and Retention
The system SHALL buffer real-time logs for SSE delivery and enforce a strict 10,000-row retention cap per server.

#### Scenario: Real-time buffering and flushing
- **WHEN** new log entries are generated by a running server
- **THEN** `ServerLogService` buffers entries, broadcasts them to active SSE subscribers, and flushes them to persistent storage in 1-second intervals

#### Scenario: Periodic dirty-server log pruning
- **WHEN** the 10-minute pruning background job executes
- **THEN** `ServerLogService` prunes stored logs for dirty servers that exceeded 10,000 rows, deleting the oldest rows so only the most recent 10,000 entries remain, and clears the dirty flag upon success

---

### Requirement: Environment Variable Masking
The system SHALL mask environment variable values by default with per-row disclosure controls in server and group settings.

#### Scenario: Masked display by default
- **WHEN** environment variables are rendered in server settings or group management lists
- **THEN** values are masked (e.g. `*****`) until explicitly revealed

#### Scenario: Per-row reveal toggle
- **WHEN** a user clicks the reveal toggle (eye icon) on an env row
- **THEN** that specific value is displayed in plaintext while other rows remain masked; toggling again re-masks the value

#### Scenario: Input masking during entry
- **WHEN** a user types into an environment variable value field in create or edit forms
- **THEN** input characters are masked with a toggle available to preview typed text

---

### Requirement: In-Game Token Authentication Route
The frontend SHALL provide a dedicated authentication entry point for players joining via in-game links.

#### Scenario: Player authenticates with in-game token
- **WHEN** a Mindustry server player opens the login verification link generated by the server
- **THEN** the browser opens `/[locale]/login/[token]` and completes authentication against the server instance

### Requirement: Manager State Synchronization via Server-State Events
Batch server runtime state SHALL be processed exclusively via `event(server-state)` (`handleSyncState(event.state)`); per-server freshness via `get-state` RPC with DISCONNECT fallback. There is no `sync-state` batch notification.

#### Scenario: Manager pushes server-state event
- **WHEN** a Server Manager WebSocket connection receives an `event` notification named `server-state` with an array of `ServerState` items
- **THEN** `ServerRuntimeService` parses each server state, updates database and cache status, reports active player count to Prometheus, and notifies active SSE listeners

#### Scenario: Malformed state handling
- **WHEN** a `server-state` event payload contains items that do not conform to `serverStateSchema`
- **THEN** the service logs a descriptive warning without throwing an unhandled exception or crashing the gateway

---

### Requirement: Settings and env edits sync desired config when running
Server settings (`updateServer`, `adminUpdateServer`) and group/server env write paths SHALL trigger a background desired-config push via `update-config` when the target server is running (ONLINE / PAUSED / STOP), using the shared full-`ServerConfig` builder (database fields plus `resolveGroupEnvs`). OFFLINE servers SHALL skip the push. The database edit SHALL succeed regardless of push outcome, with no credit check and no blocking wait.

#### Scenario: General settings save syncs a running server
- **WHEN** `updateServer` commits for a running server
- **THEN** the backend sends `update-config` with the rebuilt full config in the background and returns the edit response without waiting

#### Scenario: Admin settings save syncs a running server
- **WHEN** `adminUpdateServer` commits for a running server
- **THEN** the backend sends `update-config` with the rebuilt full config in the background

#### Scenario: Env change syncs affected running servers
- **WHEN** a group or server env write commits that affects running servers
- **THEN** the backend sends `update-config` per affected running server with the rebuilt full config

#### Scenario: Offline edit performs no push
- **WHEN** any of the above commits for an OFFLINE server
- **THEN** the backend performs no manager RPC for the sync

#### Scenario: Push failure keeps the edit
- **WHEN** the `update-config` ack fails or times out
- **THEN** the edit response still succeeds and the existing mismatch display remains the fallback signal

---

### Requirement: Server Image Allowlist Validation
The system SHALL validate that the server `image` specified when creating or updating a server matches an entry's `image` value in `SERVER_IMAGES`, both in the shared API schema (`createServerSchema` and `updateServerSchema`) and in the backend `ServerService` (`createServer` and `updateServer`). The `gameVersion` field SHALL remain validated as an integer without cross-checking against the matched `SERVER_IMAGES` entry. Frontend server creation and update forms SHALL only present selectable images from `SERVER_IMAGES` without custom image input fields.

#### Scenario: Create server with valid image in SERVER_IMAGES
- **WHEN** a user submits a create server request with an `image` value that exists in `SERVER_IMAGES`
- **THEN** schema validation and `ServerService.createServer` accept the `image` and create the server

#### Scenario: Create server with image not in SERVER_IMAGES
- **WHEN** a caller submits a create server request with an `image` value that does not match any entry in `SERVER_IMAGES`
- **THEN** validation rejects the request with a bad request error and the server is not created

#### Scenario: Update server with valid image in SERVER_IMAGES
- **WHEN** an authorized user submits an update server request with an `image` value that exists in `SERVER_IMAGES`
- **THEN** schema validation and `ServerService.updateServer` accept the `image` and update the server

#### Scenario: Update server with image not in SERVER_IMAGES
- **WHEN** a caller submits an update server request with an `image` value that does not match any entry in `SERVER_IMAGES`
- **THEN** validation rejects the request with a bad request error and the server is not updated

### Requirement: Server List Query Efficiency
The backend SHALL serve the public server list by projecting only the columns required by the server card plus the manager's address, and SHALL back the list sort with a composite database index. The response shape SHALL remain unchanged.

#### Scenario: Projected columns
- **WHEN** `listServers` executes
- **THEN** it does not load `ServerManager.securityKey`, `accessToken`, or other non-card columns, and selects only `manager.address` from the related manager

#### Scenario: Index-backed sort
- **WHEN** the list query runs
- **THEN** the database satisfies the `orderBy` (status, players, isOfficial, updatedAt) with the composite index rather than a sort node

#### Scenario: Unchanged contract
- **WHEN** a client calls `GET /v4/servers`
- **THEN** the response is byte-equivalent to before this change (same fields, same order)

---

### Requirement: Public Server Dashboard Access
The system SHALL permit unauthenticated visitors and regular users to access the server dashboard at `/servers/[id]` without requiring authentication, while keeping administrative operations, terminal consoles, and sensitive player dossiers protected.

#### Scenario: Unauthenticated visitor accesses dashboard
- **WHEN** an unauthenticated visitor navigates to `/servers/[id]`
- **THEN** the application renders the server dashboard without displaying a login blocker, showing the server name, online status, join address, game version, live map preview image, and installed maps and mods

#### Scenario: Unauthenticated visitor accesses protected sub-routes
- **WHEN** an unauthenticated visitor attempts to navigate to a protected server sub-route (e.g. `/servers/[id]/console`, `/servers/[id]/settings`, `/servers/[id]/files`)
- **THEN** the layout blocks access and presents a login prompt or not-found state

#### Scenario: Unauthenticated state polling without SSE
- **WHEN** an unauthenticated visitor loads the server dashboard
- **THEN** the application does not attempt to establish an SSE connection to `/servers/:id/state` and instead maintains status through periodic query refetches

#### Scenario: Public read access for maps, mods, and map thumbnails
- **WHEN** a client requests installed maps via `api.v4.servers.maps.getAll`, installed mods via `api.v4.servers.mods.getAll`, or map thumbnail images via `/servers/:id/files?path=...png`
- **THEN** the backend fulfills the request without demanding authentication or manager authority

#### Scenario: Guest player roster visibility
- **WHEN** an unauthenticated visitor views the server dashboard
- **THEN** the system displays the total player count in the status grid while omitting the detailed player list and moderation action buttons


