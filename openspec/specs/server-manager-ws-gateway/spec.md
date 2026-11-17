# server-manager-ws-gateway Specification

## Purpose
TBD - created by archiving change reimplement-server-manager-protocol. Update Purpose after archive.
## Requirements
### Requirement: Manager WebSocket Gateway Endpoint and Authentication
The backend SHALL expose a raw WebSocket server at `/managers/gateway` that authenticates incoming Server Manager connections via `Authorization: Bearer <accessToken>`.

#### Scenario: Successful connection and registration
- **WHEN** a Server Manager client connects to `/managers/gateway` with a valid Bearer access token
- **THEN** the gateway validates the token against the `ServerManager` database records, registers the active connection in the connection registry, and responds with a successful handshake

#### Scenario: Handshake rejection on invalid or missing token
- **WHEN** a client connects without an `Authorization` header or with an unrecognized token
- **THEN** the gateway rejects the handshake with HTTP 401 Unauthorized and closes the socket

---

### Requirement: Bidirectional Text RPC Messaging Envelope
The gateway SHALL exchange text messages using the v2 envelope `{id, kind, type?, event?, payload?, responseOf?}` supporting correlated requests, responses, notifications, and kind-encoded error frames. `kind` is required and one of `request`, `response`, `response-error`, `notification` for RPC traffic; there is no `error` boolean. Outbound RPC calls SHALL pass a per-protocol descriptor object `{ type, request, response }` (defined in `protocol/descriptors.ts` and per-domain `*.descriptors.ts`) rather than a method-name string, with request and response payload types derived via `z.infer` (no separate hand-written types, no `z.any()`, no `z.unknown()` for typed fields). Inbound request payloads SHALL be validated against the descriptor's `request` schema before dispatch; on validation failure the gateway SHALL reply with a `response-error` frame instead of dispatching with unchecked access. Frames with absent/unknown `kind` or the wrong subject field SHALL be dropped with a log and no reply. Payload field names and shapes SHALL match `BackendRpc.java` (`command: string[]`, `message` for chat, full `ServerConfig` for host, `{ serverId, config }` for mismatch).

#### Scenario: Request and response correlation
- **WHEN** the backend sends an RPC request with a unique UUID `id`, `kind:"request"`, `type`, and `payload`
- **THEN** the gateway tracks the pending request and resolves the promise when the manager replies with `kind:"response"`, matching `responseOf`, and the payload

#### Scenario: RPC error response handling
- **WHEN** the manager responds with `kind:"response-error"` and an error detail string payload
- **THEN** the gateway rejects the corresponding pending request promise with an error containing the detail string

#### Scenario: Unsolicited notification dispatch
- **WHEN** the manager sends a `kind:"notification"` message with no `responseOf`
- **THEN** the gateway routes the message according to its `type` (e.g. `event`) without sending a response frame

#### Scenario: Outbound send requires a descriptor
- **WHEN** backend code attempts to send a request without a valid descriptor object
- **THEN** TypeScript compilation fails and no runtime frame is sent

#### Scenario: Invalid inbound payload gets error response
- **WHEN** the manager sends a `kind:"request"` frame with `id` whose payload fails its descriptor's request schema
- **THEN** the gateway replies with a `response-error` frame containing the validation detail and does not invoke the handler with unchecked data

#### Scenario: Invalid inbound notification is dropped without response
- **WHEN** the manager sends a `kind:"notification"` frame with no `id` whose payload fails validation
- **THEN** the gateway logs a warning and drops the frame without sending any response

#### Scenario: Renamed methods fail fast
- **WHEN** backend code sends legacy `find-mismatch`, `remove-kicked-ip`, `content`, or `command: string`
- **THEN** TypeScript compilation fails and no runtime frame is sent until callers use `get-mismatch`, `delete-kicked-ip`, `message`, and `command: string[]`

---

### Requirement: Binary Chunk File Transfer Framing
The gateway SHALL stream and receive file transfers via first-class `WsRpcChannel.sendStream` / `registerStreamHandler` using 20-byte framed binary chunks with SHA-256 integrity verification and exactly-once typed ack. The `stream-start` and `stream-done` control payloads SHALL be `zod/v4-mini` schemas in `ws-protocol.ts` with types derived via `z.infer`, and the gateway SHALL validate them at runtime instead of accessing `streamId` / `sha256` via unchecked access. Control framing follows the peer handshake: `stream-start {kind, type:T, payload:{ streamId, metadata, totalChunks, sha256 }}` as a control frame, binary frames `[streamId | chunkIndex | payload]` up to 64 KiB, `stream-done {kind, type:T, payload:{ streamId, sha256 }}` expecting no reply, and exactly one answer per stream `{kind:"response", type:T, responseOf:startId, payload:R}` (or `kind:"response-error"` with detail) — no `stream-ack` type exists. `done.sha` MUST equal `start.sha` (case-insensitive) or the stream fails with checksum-header-mismatch; `done` for an unknown stream is dropped + logged with no reply. Streams are orchestrated inside the channel with channel-owned IDs, sliding timeout (60 s refresh, 300 s ceiling), 32 MiB cap, max 8 concurrent streams, typed `stream-abort` support, and `SESSION_WAIT_MS` (300 s) for senders with no open session. Empty files keep 1 empty chunk.

#### Scenario: Binary chunk frame structure
- **WHEN** a binary frame is received or transmitted
- **THEN** the first 16 bytes represent the `transferId` UUID (== `streamId`), bytes 16-19 represent the big-endian 32-bit `chunkIndex`, and the remaining bytes represent the chunk payload up to 64 KiB

#### Scenario: File download from manager to backend
- **WHEN** a download request is issued for a server file
- **THEN** the gateway sends `download-file` and the `download-file` promise resolves with the assembled file buffer once the manager answers with a reply-with-stream (`stream-reply-start`/`stream-reply-done` carrying `responseOf` = the request id under a fresh `streamId`) — with no reverse unlinked stream and no blocking get

#### Scenario: File upload from backend to manager
- **WHEN** an upload is initiated for a server file
- **THEN** the gateway calls `sendStream` (channel fires `stream-start` with `type` echo and `metadata`, sequentially transmits 20-byte framed chunks up to 64 KiB, fires `stream-done` with `type` echo, then awaits the start-future), and resolves the typed `Promise` with the single peer reply payload instead of manual trio orchestration in `ServerManagerGateway`

#### Scenario: Transfer control payload validated before use
- **WHEN** a `stream-start` / `stream-done` / `stream-abort` frame arrives with missing or malformed `streamId` / `sha256`
- **THEN** the gateway answers a malformed `stream-start` with a `response-error` reply (`responseOf` = that start frame's id), drops malformed `stream-done` / `stream-abort` and unknown-stream frames with a log and no reply, and never creates transfer state from unchecked data

### Requirement: Connection Disconnect and Server State Cleanup
The gateway SHALL detect manager disconnections and immediately update affected server states.

#### Scenario: Manager socket disconnection
- **WHEN** a Server Manager WebSocket connection closes or terminates
- **THEN** the gateway fails all pending RPC promises for that manager, marks all servers hosted by that manager as `DISCONNECT`, evicts server caches, and broadcasts status updates to active SSE clients

---

### Requirement: Text Frame RawData Decoding
The gateway SHALL decode incoming WebSocket text data covering all `ws.RawData` variants without using generic `Object.prototype.toString` formatting.

#### Scenario: All RawData variants decode correctly
- **WHEN** a non-binary message arrives as `string`, `Buffer`, `ArrayBuffer`, or `Buffer[]`
- **THEN** the gateway converts it to UTF-8 text (string as-is, Buffer via utf-8, ArrayBuffer via Buffer copy, Buffer array via concat) and proceeds to JSON parsing

#### Scenario: Undecodable data is dropped safely
- **WHEN** message data is empty or of an unrecognized shape, or JSON parsing fails
- **THEN** the gateway logs a warning and drops the frame without throwing or dispatching

---

### Requirement: Strict RPC Method Registry Covers Known Manager Operations
The per-protocol method descriptor registry in `protocol/descriptors.ts` and per-domain `*.descriptors.ts` SHALL enumerate descriptors for all known manager operations (`host-server`, `remove-server`, `pause`, `send-command`, `get-state`, `get-players`, `update-player`, `get-files`, `delete-file`, `create-folder`, `get-maps`, `get-mods`, `get-manager-maps`, `get-manager-mods`, `get-mismatch`, `get-commands`, `send-chat`, `download-file`, `file-transfer-start`, `file-transfer-complete`, `get-players-info`, `get-kicked-ips`, `get-recent-players`, `delete-kicked-ip`, `get-image`, `event`) with request/response types derived exclusively via `z.infer` and zero `z.any()`. It SHALL NOT describe `stream-start`, `stream-done`, `stream-abort`, `stream-reply-start`, `stream-reply-done`, `subscribe`, `unsubscribe`, `listen`, `listening`, `unlisten`, `listen-ended`, or `listen-error` as RPC methods — those are frame kinds, never RPC methods. Void handlers (`host-server`, `remove-server`, `send-command`, `send-chat`, `update-player`, `event`) SHALL be `z.void()`; `delete-file` / `create-folder` SHALL be `boolean`; `get-files` SHALL be union `ServerFileDto[] | number[]`; `get-image` SHALL be `custom<Buffer>`; `serverId` fields SHALL be `uuidv7`. The registry MUST NOT contain `write-file`.

#### Scenario: Known operation payloads are checked at compile time
- **WHEN** backend code sends `pause` with a malformed payload or expects the wrong response type
- **THEN** TypeScript compilation fails before any runtime call

#### Scenario: Registry extension path
- **WHEN** a new manager operation is introduced
- **THEN** the implementer adds one descriptor export in the owning domain module plus one `registerHandler`/call-site reference, with no changes to channel dispatch logic

#### Scenario: Java-aligned payloads validate
- **WHEN** backend sends `send-command` with `command: string[]`, `send-chat` with `message`, or `host-server` with full `ServerConfig`
- **THEN** the payload passes mini validation and the manager `BackendRpc` handler accepts it

#### Scenario: Legacy write-file rejected at compile time
- **WHEN** backend code calls `sendRequest` with a `write-file` descriptor
- **THEN** no such descriptor exists and TypeScript compilation fails with no runtime frame sent

---

### Requirement: Host default-plugin seeding uses chunked upload
The system SHALL install default plugins during host by calling generic `sendStream` with the `fileUpload` descriptor (which sends `stream-start`, binary chunks, then `stream-done`) for each `mods/<filename>`, never a single-shot `write-file` RPC.

#### Scenario: Host seeds plugins via uploadFile
- **WHEN** hosting a server with default plugins configured
- **THEN** the backend uploads each plugin buffer via chunked transfer through `sendStream` with the `fileUpload` descriptor and the manager persists it under `mods/` before issuing `host-server`

#### Scenario: Unknown write-file surfaces as host error
- **WHEN** a legacy caller sends `write-file` to the manager
- **THEN** the manager replies with a `response-error` frame carrying `unknown RPC type: write-file` and the host flow fails instead of silently skipping plugin install

---

### Requirement: Stream-backed upload and download replace manual trio
The system SHALL implement file upload as generic `sendStream(fileUploadDescriptor, { serverId, path }, data)` (fire start → chunks → done → await start-future) and file download as a plain `sendRequest(downloadFileDescriptor, { serverId, path })` that resolves with bytes via reply-with-stream (`stream-reply-start`/`stream-reply-done` linked to the pending request), with no manual `transferId` tracking and no reverse unlinked `file-download` stream in either direction. No file-specific wrapper SHALL exist on `ManagerRpcClient`.

#### Scenario: Upload goes through sendStream
- **WHEN** backend code uploads a server file with `(managerId, serverId, filePath, data)`
- **THEN** it calls generic `sendStream` with the `fileUpload` descriptor, the channel owns `streamId`, chunks, SHA, timeout, and typed ack, sends `metadata: {serverId, path}` with the stream name in the `type` field, and no caller code constructs `transferId` or sends `file-transfer-start` / `complete` directly

#### Scenario: Download goes through linked stream
- **WHEN** backend code downloads a server file via `sendRequest` with the `downloadFile` descriptor
- **THEN** the channel links the incoming reply stream to the pending `download-file` request, checks cap + SHA on `stream-reply-done`, and resolves the request with the assembled `Buffer` or rejects loudly with no answer frame

---

### Requirement: Unknown-type frames answered with error
The gateway SHALL answer any `kind:"request"` frame whose `type` has no registered handler with a `response-error` frame (`responseOf` = incoming `id`, payload naming the unknown type). A `kind:"notification"` frame whose `type` has no registered handler SHALL be dropped with a log and never answered. Frames without a `kind` and unparsable frames are still dropped + logged with no reply.

#### Scenario: Unknown request type answered
- **WHEN** the manager sends a `kind:"request"` frame with an unregistered `type`
- **THEN** the gateway replies `{kind:"response-error", type:<type>, responseOf:incomingId, payload:'unknown RPC type: <type>'}`

#### Scenario: Unknown notification type never answered
- **WHEN** the manager sends a `kind:"notification"` frame with an unregistered `type`
- **THEN** the gateway logs a warning and sends no frame

### Requirement: Manager connection replacement with kick code 4234
The gateway SHALL support replacement of a live manager connection: when a new socket authenticates for an already-connected `managerId`, the gateway SHALL close the old socket with code `4234` (`Replaced by new connection`), evict only the old entry, and register the new channel. `JdkWsClient` instances receiving `4234` SHALL stop reconnecting (KICKED), while the fresh socket stays OPEN.

#### Scenario: Reconnect replaces the stale socket
- **WHEN** a second socket connects with the same valid Bearer token while the first is still open
- **THEN** the old socket receives close code 4234, the registry holds the new socket, and RPC traffic flows on the new channel

### Requirement: Stale-close guard by socket identity
The gateway SHALL only evict `connections[managerId]` on socket close when the closing socket is the registered one (mirroring Java `sessionsEqual`). Close events from a superseded socket SHALL be ignored.

#### Scenario: Old close does not wipe the new connection
- **WHEN** the old socket's `close` event fires after a replacement has registered the new socket
- **THEN** the registry still holds the new connection and the manager stays online

### Requirement: Typed unsubscribe and unregisterHandler parity
The gateway channel SHALL type `unsubscribe(requestId, reason?)` without `any` (payload `null` or `{reason?}`, `responseOf` as first-class field, wire `kind:"unlisten"` with the `event` name echoed) and SHALL provide `unregisterHandler(descriptor)` alongside `unregisterStreamHandler(descriptor)` and `unregisterSubscriptionHandler(descriptor)`, matching the Java `unregisterHandler` / `unregisterStreamHandler` / `unregisterSubscriptionHandler` surface. No `register*` call SHALL reject control-kind spellings as application names.

#### Scenario: Unsubscribe sends typed frame
- **WHEN** backend code calls `unsubscribe(requestId, "done")`
- **THEN** the wire frame is `{kind: "unlisten", event: <event>, responseOf: requestId, payload: {reason: "done"}}` with no type errors and no `any` casts

#### Scenario: RPC handler can be unregistered
- **WHEN** backend code calls `unregisterHandler(eventDescriptor)`
- **THEN** subsequent `kind:"request"` frames of that type receive the unknown-type `response-error` reply instead of dispatching

#### Scenario: Formerly reserved names register freely
- **WHEN** backend code registers a descriptor whose `type` is `subscribe` with `registerHandler(descriptor, handler)`
- **THEN** the call registers normally and dispatched frames with `kind:"request", type:"subscribe"` reach it

### Requirement: Fail-fast outbound RPC sends with no open session
The channel SHALL NOT wait for a session to open. When the socket is not open, `sendRequest` SHALL reject immediately and `sendNotification` SHALL drop the frame with a log and no exception. The `SESSION_WAIT_MS` wait SHALL be removed from both paths, matching the Java manager's `NoSessionException` fail-fast behavior.

#### Scenario: Request with no open socket rejects immediately
- **WHEN** `sendRequest` is called while the socket is not open
- **THEN** the promise rejects immediately with a no-session error and no frame is queued or sent

#### Scenario: Notification with no open socket is dropped
- **WHEN** `sendNotification` is called while the socket is not open
- **THEN** the frame is dropped with a warning log and the caller receives no exception

#### Scenario: Send still works while the socket is open
- **WHEN** `sendRequest` is called while the socket is open
- **THEN** the frame is sent and the promise resolves or rejects on the peer answer as before

---

### Requirement: update-config RPC wire type
The gateway SHALL support an `update-config` RPC with request `{ serverId: uuidv7, config: ServerConfig }` and `void` response, sent as a descriptor-based request with ack and a short (~10s) timeout, distinct from `host-server` (store + restart) and `get-mismatch` (diff query).

#### Scenario: Descriptor-driven update-config call
- **WHEN** backend code sends `update-config` through its control descriptor with `{ serverId, config }`
- **THEN** the wire carries `kind:"request", type:"update-config"` and resolves on the manager's `void` reply or rejects on `response-error`/timeout

#### Scenario: Unknown type on old managers degrades silently
- **WHEN** the manager does not recognize `update-config`
- **THEN** it replies `response-error` with an unknown-type detail and the backend treats the push as failed while pull-based mismatch keeps working

