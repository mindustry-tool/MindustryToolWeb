# ws-rpc-streams Specification

## Purpose
TBD - created by archiving change ws-rpc-send-stream. Update Purpose after archive.
## Requirements
### Requirement: First-class sendStream outbound transport
The channel SHALL provide `sendStream(descriptor, metadata, data)` where `descriptor` is a byte-stream descriptor `{ streamType, metadata, response }`, accepting `Buffer | Uint8Array | Readable`, owning `streamId` (UUID v4), `totalChunks`, and `sha256`, chunking to 64 KiB 20-byte frames, emitting `stream-start` text with `kind:"stream-start"`, `type` set from `descriptor.streamType`, and payload `{streamId, metadata, totalChunks, sha256}` (no `streamType` in the payload), N binary frames sequentially, then `stream-done` text with `kind:"stream-done"`, the same `type`, and payload `{streamId, sha256}`, and returning a `Promise<R>` that resolves with the single peer reply `{kind:"response", type, responseOf:startId, payload:R}`. The sender SHALL fire start, then chunks, then done, and only then await the start-future (awaiting before done deadlocks a spec-compliant peer, which replies only after done).

#### Scenario: Buffer send resolves with typed ack
- **WHEN** a caller sends `sendStream(mapsDescriptor, { name: 'x' }, buffer)` and the receiver handler returns `{ ok: true }`
- **THEN** the sender promise resolves with `{ ok: true }` when the peer reply `{kind:"response", type:'maps', responseOf:startId}` arrives after `stream-start`, all chunk frames, and `stream-done`

#### Scenario: Readable sender does not require full preload
- **WHEN** a caller sends a `Readable` stream
- **THEN** the channel hashes incrementally, slices to 64 KiB frames, and sends without requiring the caller to preload the full `Buffer`

#### Scenario: Channel owns IDs and integrity fields
- **WHEN** `sendStream` is called with any data shape
- **THEN** the channel generates `streamId` via `randomUUID`, computes `totalChunks` and `sha256Hex`, and the caller never supplies `transferId` or hashes

#### Scenario: Early peer error stops the send loop
- **WHEN** the peer rejects `stream-start` (unknown type, too many streams) while chunks are still being sent
- **THEN** the sender aborts remaining chunk sends and rejects with the peer detail instead of blasting up to the cap at a dead slot

---

### Requirement: Assembled-bytes stream handlers with typed result
The channel SHALL provide `registerStreamHandler(descriptor, handler)` where `descriptor` is a byte-stream descriptor `{ streamType, metadata, response }` and `metadata` is a per-descriptor zod-mini schema, and the handler receives validated `(metadata, assembled: Buffer)` once per completed stream. The channel SHALL suppress the generic auto-response for `stream-start` and answer exactly once at the terminal point with `{kind:"response", type:T, responseOf:startId, payload:handlerResult}` on success or `{kind:"response-error", type:T, responseOf:startId, payload:detail}` on failure; no `stream-ack` frame exists. Any stream-type string is legal as `descriptor.streamType`, including former control spellings.

#### Scenario: Handler receives full assembly
- **WHEN** `stream-start`, all chunks, and `stream-done` arrive with valid SHA for a registered descriptor
- **THEN** the channel assembles chunks in index order, verifies SHA-256, invokes the handler once with `(meta, bytes)`, and answers `{kind:"response", type:T, responseOf:startId}` with the handler return value

#### Scenario: Handler throw becomes sender rejection
- **WHEN** the stream handler throws or rejects
- **THEN** the channel answers `{kind:"response-error", type:T, responseOf:startId}` with the handler detail and the sender `sendStream` promise rejects with it

### Requirement: Reused 20-byte chunk framing and multiplexing
The channel SHALL reuse `encodeChunk` / `decodeChunk` (`CHUNK_HEADER_SIZE=20`, `MAX_CHUNK_BYTES=64 KiB`) with `streamId` as `transferId` and support concurrent interleaved streams keyed by `streamId`.

#### Scenario: Chunks interleave without cross-talk
- **WHEN** two `sendStream` calls overlap on the same socket
- **THEN** each binary frame routes to its own per-`streamId` buffer via the 20-byte header and both assemble independently

#### Scenario: Unknown stream chunk is dropped loudly
- **WHEN** a binary frame arrives for an unknown `streamId`
- **THEN** the channel logs a warning, drops the frame, and never creates transfer state from unchecked data

### Requirement: Per-stream lifecycle, sliding timeout, concurrency bound, and close cleanup
The channel SHALL track per-stream state (`INIT → OPEN → READY → DONE/FAILED`), apply a sliding per-stream timeout refreshed on every chunk with an absolute ceiling of 300 s from reserve, enforce max 8 concurrent open streams per socket, support the `stream-abort` notification (`{kind:"stream-abort", type:T, payload:{streamId, reason}}`, type supplied by the aborter) from either side for live non-reply streams, and fail all streams on socket close. A duplicate `stream-start` for a live slot SHALL always be answered with a `response-error` reply keeping the old slot.

#### Scenario: Missing done times out
- **WHEN** `stream-start` and some chunks arrive but `stream-done` never arrives within the sliding window or 300 s ceiling
- **THEN** the channel deletes the slot; for a normal slot it answers `{kind:"response-error", type:T, responseOf:startId}` with the timeout detail, and for a request-linked slot it rejects the pending request locally with no answer frame

#### Scenario: Socket close fails loud
- **WHEN** the socket closes with pending streams or pending requests
- **THEN** the channel rejects every pending `sendStream` promise and every in-flight receive with `WebSocket connection closed`

#### Scenario: Too many concurrent streams rejected
- **WHEN** a 9th `stream-start` arrives with 8 streams still open
- **THEN** the channel answers the start with a `response-error` reply fail-loud with `too many streams` and creates no slot

#### Scenario: Empty stream keeps one chunk
- **WHEN** `sendStream` is called with 0-byte data
- **THEN** the channel sends `totalChunks=1` with one 0-byte binary frame, same as manager `sliceIntoChunks`

#### Scenario: Abort discards slot without reply
- **WHEN** a `stream-abort {type, payload:{streamId, reason}}` notification arrives for a live slot
- **THEN** the channel discards the slot and buffered chunks, rejects the waiter with `reason`, and sends no reply; aborts for unknown streams are dropped + logged

#### Scenario: Duplicate start keeps old slot
- **WHEN** a second `stream-start` arrives for a live slot
- **THEN** the channel answers the duplicate with a `response-error` reply and leaves the original slot untouched

### Requirement: Max-bytes receive cap with fail-loud assembly
The channel SHALL enforce `MAX_STREAM_BYTES = 33554432` (32 MiB, peer value; per-call override allowed) incrementally as chunks arrive plus a final assembled-length guard, and reject oversized streams via the single error reply without assembling.

#### Scenario: Oversized stream fails before OOM
- **WHEN** accumulated `receivedBytes` exceeds the cap
- **THEN** the channel discards the slot and answers `{kind:"response-error", type:T, responseOf:startId}` (`cap exceeded`) instead of concatenating unbounded buffers

#### Scenario: SHA mismatch rejects
- **WHEN** `done.sha` differs from `start.sha` (case-insensitive) or assembled bytes fail `verifySha256` against the agreed SHA
- **THEN** the channel discards the slot and answers `{kind:"response-error", type:T, responseOf:startId}` with a checksum-mismatch detail

### Requirement: Reply-with-stream request linkage
The channel SHALL use dedicated reply kinds: a replier answers a request Q with `stream-reply-start {kind, type:T, responseOf:Q, payload:{streamId, metadata, totalChunks, sha256}}`, chunks keyed by the fresh `streamId`, then `stream-reply-done {kind, type:T, responseOf:Q, payload:{streamId, sha256}}`. If `pending[Q]` exists, the channel links a slot to Q (no stream handler needed), ingests chunks by the fresh `streamId`, and on valid `done` resolves Q with the assembled bytes; integrity, cap, and contiguity failures reject Q locally with no answer frame. A `stream-reply-start` naming no pending request is dropped + logged. Settle-once: whichever settles Q first (stream completion or a normal answer) wins; the loser is dropped + logged. Reply streams are not abortable.

#### Scenario: Stream answer resolves request with bytes
- **WHEN** the backend sends `download-file` (id Q) and the manager answers with `stream-reply-start(responseOf:Q)` + chunks + `stream-reply-done(responseOf:Q)` under a fresh `streamId`
- **THEN** the `download-file` promise resolves with the assembled `Buffer` and no further answer frame is sent or expected

#### Scenario: Stream failure rejects request locally
- **WHEN** the linked stream fails integrity, cap, or contiguity checks
- **THEN** the pending request rejects with the failure detail and no answer frame is sent (the envelopes were the answer)

#### Scenario: Start without pending request dropped
- **WHEN** a `stream-reply-start` with `responseOf:Q` arrives and no `pending[Q]` exists
- **THEN** the channel drops it + logs, reserving no slot

### Requirement: Reply-stream control validation matches normal streams
The channel SHALL validate `stream-reply-start`/`stream-reply-done` frames carrying `responseOf` with the same rules as unlinked streams: `streamId`, `sha256` present, `totalChunks >= 1`, and `done.sha256` present, plus the `type` echo. Violations SHALL fail the linked pending request locally with no frame sent and reserve no slot. A `stream-reply-start` naming no pending request SHALL be dropped with a log.

#### Scenario: Malformed reply start fails the linked request
- **WHEN** a reply `stream-reply-start` arrives with `totalChunks: 0` or missing `sha256` for a pending request Q
- **THEN** Q rejects with a validation detail, no slot is reserved, and no frame is sent

#### Scenario: Reply start without pending request is dropped
- **WHEN** a `stream-reply-start` with `responseOf: Q` arrives and no `pending[Q]` exists
- **THEN** the channel drops it with a log and reserves no slot

### Requirement: Per-chunk size cap and first-wins duplicate policy
The channel SHALL reject binary chunk payloads exceeding 64 KiB and ignore redelivered chunk indexes (first bytes win), matching Java `FileChunkReceiver`. Oversized frames SHALL fail the slot loudly via a single `response-error` reply (or local linked-request rejection for reply streams) without assembling.

#### Scenario: Oversized chunk fails loud
- **WHEN** a chunk frame arrives with payload larger than 64 KiB for a live slot
- **THEN** the slot is discarded and the waiter fails with a max-chunk detail instead of buffering unbounded data

#### Scenario: Duplicate chunk index is ignored
- **WHEN** the same `chunkIndex` arrives twice with identical bytes
- **THEN** the second copy is ignored and assembly still succeeds with the first bytes

### Requirement: Sender timeout emits stream-abort
The channel SHALL send a fire-and-forget `stream-abort {type, payload:{streamId, reason}}` notification (with the stream name in `type`) when its own sender timer fires for `sendStream` or a linked reply wait, then reject locally. Receivers SHALL keep handling inbound aborts silently as today.

#### Scenario: Slow handler triggers abort
- **WHEN** `sendStream` times out while the peer slot is still open
- **THEN** the sender emits `stream-abort` with the stream `type`, rejects with the timeout detail, and the peer discards its slot with no reply

### Requirement: Symmetric 8-stream concurrency bound
The channel SHALL enforce max 8 concurrent open streams (`outgoing + slots`) on send and on receive. The 9th concurrent `sendStream` SHALL reject locally before sending; the 9th inbound `stream-start` SHALL be answered with a `response-error` reply and create no slot, so Java senders (which do not pre-check) still fail loudly via the error frame.

#### Scenario: 9th concurrent send rejected
- **WHEN** 8 streams are open and a 9th `sendStream` is called
- **THEN** it rejects immediately with `Too many concurrent streams` and sends no `stream-start`

### Requirement: Fail-fast stream send with no open session
`sendStream` SHALL reject immediately when the socket is not open, without queuing the `stream-start` frame or waiting for a session. The removed `SESSION_WAIT_MS` wait SHALL NOT apply to stream sends.

#### Scenario: Stream send with no open socket rejects
- **WHEN** `sendStream` is called while the socket is not open
- **THEN** it rejects immediately with a no-session error and sends no `stream-start`, chunks, or `stream-done`

### Requirement: abortStream refuses reply streams
`abortStream` SHALL refuse to abort a reply stream (a receive slot whose request id is linked to a pending request), returning `false` and emitting no `stream-abort`, consistent with `WS-RPC.md` §8.7 ("Reply streams are not abortable") and the Java manager. A local abort SHALL still discard sender state and any live non-reply receive slot and emit `stream-abort {type, payload:{streamId, reason}}`.

#### Scenario: Aborting a reply stream is refused
- **WHEN** `abortStream` is called for a `streamId` whose slot is linked to a pending request
- **THEN** it returns `false`, sends no `stream-abort`, and leaves the linked slot intact

#### Scenario: Aborting a live normal stream still works
- **WHEN** `abortStream` is called for a live non-reply stream or for a stream still being sent
- **THEN** it discards local state, emits `stream-abort {type, payload:{streamId, reason}}`, and returns `true`

