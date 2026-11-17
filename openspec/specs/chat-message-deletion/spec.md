# chat-message-deletion Specification

## Purpose

Provides administrative deletion of chat messages via `DELETE /chats/:id`, maintains `ChatChannel.lastMessageId` pointer integrity, broadcasts real-time deletion events over `/chats/stream`, and exposes an in-situ deletion action with confirmation in the live web chat feed.

## Requirements

### Requirement: Administrative chat message deletion endpoint
The system SHALL provide an authenticated HTTP endpoint `DELETE /chats/:id` accessible only to users possessing the `chat:delete` authority or the `god` role.

#### Scenario: Authorized deletion succeeds
- **WHEN** an authenticated user with `chat:delete` or `god` authority sends a DELETE request to `/chats/:id` for an existing chat message
- **THEN** the system permanently removes the message record from Prisma, logs an audit entry to the Action table, and responds with HTTP 200 or 204.

#### Scenario: Unauthorized deletion rejected
- **WHEN** an unauthenticated client or a user without `chat:delete` or `god` authority attempts to delete a chat message
- **THEN** the system rejects the request with HTTP 401 or 403 and preserves the message in the database.

#### Scenario: Non-existent message returns 404
- **WHEN** an authorized user attempts to delete a message with an ID that does not exist in the database
- **THEN** the system responds with HTTP 404.

### Requirement: Channel last message pointer integrity
The system SHALL update `ChatChannel.lastMessageId` when the most recent message of that channel is deleted.

#### Scenario: Deleted message was the channel lastMessageId
- **WHEN** a deleted message matches `ChatChannel.lastMessageId` for its channel
- **THEN** the system finds the newest remaining message in that channel and updates `ChatChannel.lastMessageId` to its ID (or null if no messages remain).

#### Scenario: Deleted message was not the channel lastMessageId
- **WHEN** a deleted message does not match `ChatChannel.lastMessageId`
- **THEN** `ChatChannel.lastMessageId` remains unchanged.

### Requirement: Real-time SSE deletion broadcast
The system SHALL broadcast a deletion event over `/chats/stream` to all active clients connected to the channel of the deleted message.

#### Scenario: Real-time deletion broadcast received
- **WHEN** a chat message is successfully deleted by an administrator
- **THEN** the server sends an SSE event containing `{ type: 'delete', data: { id: string, channelId: string, lastMessageId: string | null } }` to connected subscribers of that channel.

#### Scenario: Active clients evict deleted message
- **WHEN** a client connected to `/chats/stream` receives a deletion event
- **THEN** the client immediately removes the message from its local query feed cache without requiring a page reload.

### Requirement: In-situ chat feed deletion interface
The web chat feed SHALL provide an in-situ delete button inside the message action popover visible only to administrators with `chat:delete` or `god` authority.

#### Scenario: Admin opens action popover on a message
- **WHEN** an admin with `chat:delete` or `god` clicks a message in `/chat`
- **THEN** the action popover displays a delete option alongside the reply option.

#### Scenario: Non-admin opens action popover on a message
- **WHEN** a regular user without `chat:delete` or `god` clicks a message in `/chat`
- **THEN** the delete option is not rendered in the action popover.

#### Scenario: Confirmation dialog before deletion
- **WHEN** an admin clicks the delete option in the action popover
- **THEN** an AlertDialog opens displaying confirmation details and requiring explicit confirmation before calling the API.
