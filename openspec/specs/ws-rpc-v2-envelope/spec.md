# ws-rpc-v2-envelope Specification

## Purpose

Shared WS-RPC version 2 wire contract between the TypeScript backend gateway and the Java server-manager gateway: explicit `kind` discriminator on every control frame, `type`-vs-`event` subject fields, failures encoded in `kind`, kind-only routing, and no reserved application names.

## Requirements

### Requirement: Explicit kind discriminator on every control frame
The system SHALL send every control frame as a JSON object with `id` (UUID string, unique per frame) and `kind` (required string, one of the 16 known kinds: `request`, `response`, `response-error`, `notification`, `stream-start`, `stream-done`, `stream-abort`, `stream-reply-start`, `stream-reply-done`, `listen`, `listening`, `event`, `unlisten`, `listen-ended`, `listen-error`). A receiver SHALL drop with a log and no reply any text frame whose `kind` is absent or unknown, and any unparsable text frame.

#### Scenario: Known kind is dispatched
- **WHEN** a frame arrives with `kind:"request"` and a well-formed envelope
- **THEN** the receiver dispatches it to the RPC handler registry

#### Scenario: Unknown kind is dropped with no reply
- **WHEN** a frame arrives with `kind:"frob"` or with no `kind` field
- **THEN** the receiver logs a warning, sends no frame, and creates no state

#### Scenario: Unparsable text is dropped with no reply
- **WHEN** a text frame arrives that is not valid JSON
- **THEN** the receiver logs a warning and sends no frame

### Requirement: Subject fields type versus event
The system SHALL carry the application subject in `type` for RPC and byte-stream kinds (`request`, `notification`, `response`, `response-error`, `stream-start`, `stream-done`, `stream-abort`, `stream-reply-start`, `stream-reply-done`), and in `event` for event-stream kinds (`listen`, `listening`, `event`, `unlisten`, `listen-ended`, `listen-error`). `type` MUST be absent on event-stream frames and `event` MUST be absent on RPC/byte-stream frames. A frame carrying the wrong subject field SHALL be dropped with a log and no reply.

#### Scenario: RPC frame carries type
- **WHEN** a `request` frame arrives with `type:"get-state"` and no `event` field
- **THEN** the receiver dispatches it normally

#### Scenario: Event-stream frame carries event
- **WHEN** a `listen` frame arrives with `event:"usage"` and no `type` field
- **THEN** the receiver dispatches it to the event handler registry

#### Scenario: Wrong subject field is dropped
- **WHEN** a `request` frame arrives carrying an `event` field, or an `event` frame arrives carrying a `type` field
- **THEN** the receiver logs a warning and sends no reply

### Requirement: Failures encoded in kind, never a boolean
The system SHALL have no `error` boolean field. RPC/stream answers SHALL signal failure with `kind:"response-error"` and event streams with `kind:"listen-error"`, both carrying a diagnostic string payload. Receivers SHALL match on `kind` (plus `responseOf`), never on message text.

#### Scenario: RPC failure arrives as response-error
- **WHEN** a `response-error` frame arrives with `responseOf` matching a pending call and a string payload
- **THEN** the pending call rejects with an error containing the detail string

#### Scenario: Old error boolean is not honored
- **WHEN** a frame arrives with an `error` field (v1 shape) and no recognized `kind`
- **THEN** the receiver drops it with a log and no reply

### Requirement: Kind-only routing to exactly one receiver table
The system SHALL dispatch each frame on `kind` alone per the routing table: `request`/`notification` to the handler registry; `response`/`response-error` to the pending-call table; `stream-start`/`stream-done`/`stream-abort` to the stream registry/slots; `stream-reply-start`/`stream-reply-done` to the pending-call table; `listen` to the event handler registry; `listening`/`event`/`unlisten`/`listen-ended`/`listen-error` to the listener table. No receiver SHALL probe more than one table to route a frame. An answer frame (`responseOf` set) SHALL never trigger a further answer, even when malformed.

#### Scenario: Reply-stream start resolves via pending table only
- **WHEN** a `stream-reply-start` frame arrives with `responseOf` matching a pending request
- **THEN** the receiver links a stream slot to that request without consulting the stream handler registry

#### Scenario: Answer to an answer is never sent
- **WHEN** a malformed `response` frame arrives (e.g. naming no pending call)
- **THEN** the receiver drops it with a log and sends no frame

### Requirement: No reserved application names
The system SHALL accept any string as handler, stream-type, or event name, including `subscribe`, `unsubscribe`, `stream-start`, `stream-done`, `stream-abort`, and `event`. Registration calls SHALL NOT reject control-kind spellings as application names.

#### Scenario: Formerly reserved name registers and routes
- **WHEN** backend code registers an RPC handler named `subscribe` and a peer sends `kind:"request", type:"subscribe"`
- **THEN** the handler runs and answers `kind:"response", type:"subscribe"`
