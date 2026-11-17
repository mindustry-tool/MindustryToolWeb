# ws-rpc-subscriptions Specification

## Purpose

WS-RPC subscription lifecycle between the backend gateway and Java server managers, byte-for-byte compatible with Java `gateway.rpc.WsRpcChannel` subscription slots.
## Requirements
### Requirement: Subscribe request and ack compatible with Java
The channel SHALL exchange `listen` requests (`{kind:"listen", event:E, payload:{data}}`, where the `id` becomes the event-stream ID) and acknowledge with a dedicated frame `{kind:"listening", event:E, responseOf:listenId, payload:null}`, matching Java `DefaultPushHandle` ack semantics. The client SHALL subscribe with a subscription descriptor `{ event, params, eventSchema }` via `subscribe(descriptor, data, handler)`, where `event` supplies the wire `event` name and `params` validates the listen data. Validation failures (missing `event`, invalid `data` per the descriptor `params` schema, unknown event name) SHALL be answered with `{kind:"listen-error", event:E, responseOf:listenId, payload:detail}` and reserve no listener. The client `subscribe()` promise SHALL resolve on the `listening` frame with a subscription handle exposing `unsubscribe(reason?)`, not `void`; the listen id stays encapsulated inside the handle. Failure payloads SHALL be unquoted diagnostic strings.

#### Scenario: Listen round-trip ack
- **WHEN** a client sends `subscribe(usageDescriptor, {serverId:"srv-1"}, handler)` and the server handler accepts
- **THEN** the server replies once with `{kind:"listening", event:"usage", responseOf:listenId, payload:null}` and the client promise resolves with a handle without invoking the event handler

#### Scenario: Unknown event name rejects
- **WHEN** no server handler is registered for the `listen` event name
- **THEN** the server replies `{kind:"listen-error", event:<name>, responseOf:listenId, payload:"unknown event: <name>"}` and reserves no listener

#### Scenario: Invalid params reject before reservation
- **WHEN** `data` fails the registered descriptor's `params` schema
- **THEN** the server replies `{kind:"listen-error", event:E, responseOf:listenId}` with an invalid-params detail and reserves no listener

---

### Requirement: Server slot reservation order matches Java
The channel SHALL register subscription handlers with `registerSubscriptionHandler(descriptor, onSubscribe)` and reserve the `serverSubscriptions[listenId]` slot with `putIfAbsent` semantics before invoking `onSubscribe`. Duplicate IDs SHALL fail immediately with a `listen-error` (`"Duplicate subscription ID"`). Synchronous throws and async rejections from `onSubscribe` SHALL remove the reserved slot and fail with the handler detail via `listen-error`.

#### Scenario: Duplicate listen ID fails fast
- **WHEN** a second `listen` arrives with an already-live `listenId`
- **THEN** the server fails it with a `listen-error` duplicate-ID frame and keeps the original slot untouched

#### Scenario: Handler rejection cleans the slot
- **WHEN** `onSubscribe` throws or rejects
- **THEN** the server removes the reserved slot and replies with a `listen-error` frame carrying the handler detail

### Requirement: Unsubscribe by responseOf cleans the server slot
The channel SHALL treat `unlisten` frames (`{kind:"unlisten", event:E, responseOf:listenId, payload:{reason?} | null}`) as the authoritative teardown signal. The server SHALL remove `serverSubscriptions[listenId]`, mark it closed, fire `onClose` callbacks, stop sending events, and confirm with `{kind:"listen-ended", event:E, responseOf:listenId, payload:null}`. The first party to end the stream (listener via `unlisten`, publisher via `listen-ended`/`listen-error`, or connection loss) wins; late frames are dropped. Only `responseOf` is authoritative for identifying the stream. Backend services SHALL tear down via the subscription handle (`handle.unsubscribe(reason?)`) rather than raw listen ids.

#### Scenario: Unlisten removes server state with confirmation
- **WHEN** a client sends `unlisten` with `responseOf` set to a live `listenId`
- **THEN** the server deletes the slot, fires close callbacks, stops events, and the client observes `listen-ended` for that `listenId`

#### Scenario: Handle unsubscribe tears down with confirmation
- **WHEN** backend code calls `handle.unsubscribe("done")` on a live subscription
- **THEN** the channel sends `{kind:"unlisten", event:E, responseOf:listenId, payload:{reason:"done"}}` and the caller observes `listen-ended` for that `listenId`

#### Scenario: Unlisten for unknown ID is dropped silently
- **WHEN** `unlisten` arrives with a `responseOf` matching no live listener
- **THEN** the channel logs and drops it with no reply and no state change

#### Scenario: Cross-client payload shapes interoperate
- **WHEN** a Java client sends `payload:{}` and a TS client sends `payload:null` (both with `reason` optional)
- **THEN** both unlistens clean the slot identically and receive `listen-ended`

#### Scenario: Publisher-initiated end needs no unlisten
- **WHEN** the publisher sends `listen-ended` or `listen-error` for a live `listenId` without any prior `unlisten`
- **THEN** the listener treats the stream as ended, fires close callbacks, and sends no reply

### Requirement: Push, complete, and fail semantics match Java PushHandle
`push(event)` SHALL send `{kind:"event", event:E, responseOf:listenId, payload:event}` (fresh `id` per event) unless closed. `complete()` SHALL close, send `{kind:"listen-ended", event:E, responseOf:listenId, payload:null}`, then fire close callbacks. `fail(reason)` SHALL close, send `{kind:"listen-error", event:E, responseOf:listenId, payload:reason}`, then fire close callbacks. `isClosed()` and `onClose()` (immediate fire if already closed) SHALL match Java `DefaultPushHandle`.

#### Scenario: Multiple pushes fan out per slot
- **WHEN** the server pushes three events to one listener
- **THEN** the subscribed client handler fires three times in send order and other listeners receive nothing

#### Scenario: Fail closes the client subscription
- **WHEN** the server calls `fail("shutting down")`
- **THEN** the client receives `listen-error`, its subscription is removed, its `onClose` callbacks fire, and further pushes are dropped

#### Scenario: Complete ends with confirmation
- **WHEN** the server calls `complete()`
- **THEN** the client receives `listen-ended` for that `listenId` and the slot is removed locally on both sides

### Requirement: Subscription close cleanup on socket loss
On socket close the channel SHALL mark all client listeners closed, cancel their timers, reject unacked promises with the close cause, fire `onClose` callbacks, and clear both listener maps; server listeners SHALL be ended and their callbacks fired, matching Java `failAll`. There is no protocol-level resumption or replay; listeners re-`listen` on reconnection at the application level.

#### Scenario: Close during active subscription fires cleanup
- **WHEN** the socket closes with a live listener whose handler registered `onClose`
- **THEN** the callback fires exactly once and both listener maps are empty

### Requirement: Subscribe fails fast with no open session
`subscribe` SHALL reject immediately when the socket is not open, without waiting for a session and without retaining a client listener slot. This matches the fail-fast contract applied to the other outbound send paths.

#### Scenario: Subscribe with no open socket rejects
- **WHEN** `subscribe` is called while the socket is not open
- **THEN** the returned promise rejects immediately with a no-session error, no `listen` frame is sent, and no client subscription slot is retained

