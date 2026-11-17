# manager-rpc-contract Specification

## Purpose
TBD - created by archiving change refactor-server-gateway. Update Purpose after archive.
## Requirements
### Requirement: Per-protocol handler descriptors
Each WS-RPC sub-protocol SHALL define its own descriptor type: RPC `{ type, request, response }`, byte-stream `{ streamType, metadata, response }`, and subscription `{ event, params, eventSchema }`. Every schema field SHALL be a `zod/v4-mini` schema with its type derived via `z.infer`, and SHALL NOT use `z.any()`. The wire subject carried by a descriptor (`type`, `streamType`, or `event`) SHALL equal the exact string used on the wire today and SHALL NOT be renamed by adopting descriptors.

#### Scenario: Descriptor carries the frozen wire subject
- **WHEN** a descriptor is defined for the `pause` operation
- **THEN** its `type` is `"pause"` and a call through it emits `type:"pause"` on the wire

#### Scenario: Descriptor schemas are typed without any
- **WHEN** a descriptor's `request` and `response` schemas are inspected
- **THEN** both are zod-mini schemas whose types are obtained through `z.infer`, with no `z.any()` or `z.unknown()` in typed fields

---

### Requirement: Descriptor-based handler registration
The channel SHALL register inbound RPC handlers with `registerHandler(descriptor, handler)`, byte-stream handlers with `registerStreamHandler(descriptor, handler)`, and subscription handlers with `registerSubscriptionHandler(descriptor, onSubscribe)`. The channel SHALL build its wire dispatch table from `descriptor.type`, `descriptor.streamType`, and `descriptor.event`, and SHALL validate inbound payloads against the descriptor's schema before invoking the handler. `unregisterHandler(descriptor)`, `unregisterStreamHandler(descriptor)`, and `unregisterSubscriptionHandler(descriptor)` SHALL remove the corresponding dispatch entry. A `request` frame whose `type` has no registered descriptor SHALL still be answered with a `response-error` frame.

#### Scenario: registerHandler builds dispatch by wire type
- **WHEN** backend code calls `registerHandler(eventDescriptor, handler)` and the manager sends `kind:"request", type:"event"`
- **THEN** the channel dispatches to `handler` and no central registry file needed to be edited

#### Scenario: Inbound payload is validated from the descriptor
- **WHEN** a request arrives whose payload fails `descriptor.request.safeParse`
- **THEN** the channel replies `response-error` with the validation detail and does not invoke the handler

#### Scenario: Unknown inbound type is answered
- **WHEN** a `request` frame arrives for a `type` with no registered descriptor
- **THEN** the channel replies `{kind:"response-error", type:<type>, responseOf:incomingId, payload:"unknown RPC type: <type>"}`

---

### Requirement: Descriptor-object outbound calls
Outbound sends SHALL accept a descriptor object instead of a method-name string: `sendRequest(descriptor, payload)`, `sendStream(descriptor, metadata, data)`, and `subscribe(descriptor, data, handler)`. The channel SHALL emit the descriptor's subject (`type`, `streamType`, or `event`) in the outgoing frame. There SHALL be no `RpcMethod` string union and no `rpcSchemas` map; payload and result types SHALL be inferred from the descriptor with no cast to `any`.

#### Scenario: sendRequest emits the descriptor subject
- **WHEN** backend code calls `sendRequest(pauseDescriptor, { serverId })`
- **THEN** the channel sends `{kind:"request", type:"pause", payload:{serverId}}` and resolves with the descriptor's inferred response type

#### Scenario: A call cannot be constructed without a descriptor
- **WHEN** backend code attempts to send an operation without a valid descriptor value
- **THEN** TypeScript compilation fails and no runtime frame is sent

#### Scenario: sendStream uses the stream descriptor subject
- **WHEN** backend code calls `sendStream(uploadDescriptor, metadata, buffer)`
- **THEN** the channel emits `stream-start`/`stream-done` with `type` equal to the descriptor's `streamType`

---

### Requirement: ManagerRpcClient domain surface
A `ManagerRpcClient` SHALL own `serverId → managerId` resolution and expose generic transport only: `sendRequest(managerId, descriptor, payload)`, `sendNotification(managerId, descriptor, payload)`, `sendStream(managerId, descriptor, metadata, data)`, `sendRequestForServer(serverId, descriptor, payload)`, and `subscribeForServer(serverId, descriptor, data, handler)`. The client SHALL NOT import file-domain descriptors and SHALL NOT expose file-specific `uploadFile`/`downloadFile` methods; file transfer SHALL be composed by callers via `sendStream`/`sendRequest` with `fileDescriptors`. The client SHALL resolve the manager through the server record for `*ForServer` calls, and SHALL reject when the server is missing, has no manager, or the manager is offline. The channel and transport SHALL NOT depend on the ORM or on webhook delivery.

#### Scenario: sendRequestForServer resolves the manager
- **WHEN** `sendRequestForServer(serverId, pauseDescriptor, payload)` is called for a server with a connected manager
- **THEN** the client resolves the server's `managerId` and sends the request over that manager's channel

#### Scenario: Generic sendStream passthrough reaches the channel
- **WHEN** backend code calls `sendStream(managerId, fileUploadDescriptor, { serverId, path }, buffer)`
- **THEN** the client sends the stream over that manager's channel with the descriptor's `streamType` and resolves with the typed ack, without any file-domain knowledge in the client

#### Scenario: Missing or offline manager rejects
- **WHEN** the target server has no `managerId` or the manager is not connected
- **THEN** the client rejects with an offline/no-manager error and sends no frame

#### Scenario: Transport has no ORM dependency
- **WHEN** the gateway transport module is inspected
- **THEN** it imports no Prisma service and no webhook configuration

#### Scenario: Client has no file-descriptor import
- **WHEN** the `ManagerRpcClient` module is inspected
- **THEN** it imports no `fileDescriptors` and exposes no `uploadFile` or `downloadFile` method

