# in-app-notifications Specification

## Purpose

Defines requirements for the in-app notification subsystem, including Prisma data persistence, automatic retention pruning, UI entity grouping vs backend aggregation keys, atomic transactional aggregation, admin broadcast storage, Server-Sent Events (SSE) real-time streaming, typed notification schema unions, domain event triggers (verification, likes, share rewards, comments, replies, system broadcasts), user preference controls, and frontend localized display with deep linking.

## Requirements

### Requirement: Notification Data Persistence and Read Tracking
The system SHALL persist user notifications in PostgreSQL using Prisma with fields for identifier, target user ID, category type (`VERIFICATION`, `LIKE`, `SHARE_REWARD`, `COMMENT`, `SYSTEM`), notification code (string), parameters (JSON object), UI group key (`groupKey`), backend aggregation key (`aggregationKey`), navigation link, read timestamp (`readAt: DateTime?`), and creation/update timestamps.

#### Scenario: Storing an unread notification
- **WHEN** a service triggers a notification for a user
- **THEN** a new `Notification` record is saved with `readAt = null`, `createdAt = now()`, and `updatedAt = now()`

#### Scenario: Marking notification as read
- **WHEN** a user marks a notification as read
- **THEN** the system updates `readAt = now()`

#### Scenario: Cascading cleanup on user deletion
- **WHEN** a user account is removed from the system
- **THEN** all associated notification records and preferences are deleted via foreign key cascade

---

### Requirement: Automatic 3-Month Data Retention
The system SHALL automatically delete notification records and broadcast notifications older than 3 months (90 days) via a scheduled daily background job.

#### Scenario: Daily cleanup of old notifications
- **WHEN** the scheduled daily retention cleanup job executes
- **THEN** the system deletes all `Notification` records where `createdAt` is older than 90 days

#### Scenario: Daily cleanup of old broadcast announcements
- **WHEN** the scheduled daily retention cleanup job executes
- **THEN** the system deletes all `BroadcastNotification` records older than 90 days, automatically cascading the deletion of associated `BroadcastNotificationRead` receipts

---

### Requirement: Distinction Between groupKey and aggregationKey
The system SHALL maintain a clear functional distinction between `groupKey` and `aggregationKey`:
- `groupKey`: Identifies the target entity or subject for UI presentation and grouping (e.g. `schematic:{schematicId}`, `map:{mapId}`, `post:{postId}`).
- `aggregationKey`: Identifies the exact deduplication candidate for backend event collapsing (e.g. `like:{recipientId}:{itemType}:{itemId}`, `share_reward:{recipientId}:{shareId}`).

#### Scenario: Correlating notifications under groupKey
- **WHEN** multiple distinct events occur regarding an item (e.g. approval, like, comment)
- **THEN** all generated notifications share the same `groupKey`, allowing the frontend to present them grouped under that entity

#### Scenario: Collapsing events via aggregationKey
- **WHEN** multiple users like the same item belonging to a user
- **THEN** all like events share the same `aggregationKey`, and the system collapses them into a single updateable notification record

---

### Requirement: Transactional Notification Aggregation
The system SHALL perform notification aggregation inside an atomic database transaction (`$transaction`), without depending on external cache state.

#### Scenario: Atomic like aggregation
- **WHEN** an event with an `aggregationKey` arrives for a user
- **THEN** within a database transaction, the system queries for an existing unread record (`userId`, `aggregationKey`, `readAt: null`) within the active 24-hour window:
  - If found: it updates the existing record by incrementing `params.count`, appending the actor name, updating `code = "like.multiple"`, and updating `updatedAt = now()`
  - If not found: it creates a new record with the `aggregationKey`

#### Scenario: Prior notification already read
- **WHEN** a new like arrives on an item whose previous aggregated notification has already been marked as read (`readAt != null`)
- **THEN** the system creates a fresh notification record with `readAt = null`

---

### Requirement: Admin Broadcast Storage Strategy
The system SHALL store global broadcast announcements in a single `BroadcastNotification` record rather than cloning individual rows per user, tracking user read states via `BroadcastNotificationRead`.

#### Scenario: Admin creates a global broadcast
- **WHEN** an administrator sends a broadcast announcement targeting all users
- **THEN** a single `BroadcastNotification` record is created containing `code`, `params`, and optional `link`

#### Scenario: User reads a broadcast announcement
- **WHEN** an authenticated user marks a broadcast announcement as read
- **THEN** a `BroadcastNotificationRead` record is created or upserted linking `(broadcastId, userId, readAt = now())`

#### Scenario: Computing user unread count
- **WHEN** computing unread count for a user
- **THEN** the total is calculated as: unread personal notifications (`userId = user.id AND readAt IS NULL`) plus active broadcast notifications created since user registration that lack a matching `BroadcastNotificationRead` record

---

### Requirement: Real-Time Server-Sent Events (SSE) Delivery
The system SHALL push notification events to connected users over an authenticated Server-Sent Events stream (`GET /v4/notifications/sse`).

#### Scenario: Streaming new notification
- **WHEN** a personal notification or broadcast is created
- **THEN** an SSE message with the notification payload is pushed to active client streams for the recipient(s)

#### Scenario: Client handles counter upon event
- **WHEN** the frontend receives a notification event via SSE
- **THEN** the client increments its local unread counter and displays an in-app alert

#### Scenario: SSE keepalive heartbeats
- **WHEN** an SSE connection is idle
- **THEN** the server sends periodic comment pings (`: ping\n\n`) every 30 seconds to maintain connection health

---

### Requirement: Strictly Typed Notification Code and Params Union
The shared API package SHALL define a strict TypeScript discriminated union on `code` pairing each notification code with its required parameter schema.

#### Scenario: Discriminated union type validation
- **WHEN** an event is triggered with a specific notification code (e.g. `verification.approved`, `like.single`, `comment.post`)
- **THEN** TypeScript and runtime validation enforce that `params` contains the exact required schema for that code

---

### Requirement: Domain Event Notification Triggers
The system SHALL trigger notifications with typed codes and parameters from domain services for verification, likes, rewards, comments, and broadcasts.

#### Scenario: Content verification notifications
- **WHEN** a moderator approves or rejects a pending schematic, map, or content patch in `VerifyService`
- **THEN** a notification is created for the creator with type `VERIFICATION`, code `verification.approved` or `verification.rejected`, and params `{ itemType, itemId, itemName, credits?, reason? }`

#### Scenario: Content rejection notification with reason
- **WHEN** a moderator rejects a pending item providing a rejection reason string
- **THEN** the creator's notification contains the provided `reason` and displays it to the creator in the notification item content

#### Scenario: Content like notifications
- **WHEN** a user likes a verified item authored by another user
- **THEN** the system triggers a `LIKE` notification with aggregationKey `like:<recipientId>:<itemType>:<itemId>`

#### Scenario: Self-like produces no notification
- **WHEN** a user likes their own published item
- **THEN** no notification is generated

#### Scenario: Share link reward notifications
- **WHEN** an external visitor visits a valid share link and credits are awarded in `ShareService`
- **THEN** an aggregated `SHARE_REWARD` notification is generated for the share owner

#### Scenario: Post and content comment notifications
- **WHEN** a user submits a top-level comment on content authored by another user
- **THEN** the system creates a notification for the author with code `comment.post`, link `/<itemType>/<itemId>?commentId=<commentId>`, and snippet parameters

#### Scenario: Comment reply notifications
- **WHEN** a user replies to an existing comment authored by another user
- **THEN** the system creates a notification for the parent comment author with code `comment.reply` and link pointing directly to the target comment

#### Scenario: Author self-comment or self-reply exclusion
- **WHEN** a user comments on their own content or replies to their own comment
- **THEN** no notification is generated

#### Scenario: Admin system broadcast vs targeted user message
- **WHEN** an administrator sends a global broadcast, a single `BroadcastNotification` is created; when targeting a specific `userId`, a direct personal `Notification` record is created

---

### Requirement: User Preference Controls for Notifications
The system SHALL provide notification preference settings allowing users to control categories such as comment and reply alerts.

#### Scenario: Default preference initialization
- **WHEN** a user account is created or preferences are initialized
- **THEN** `commentsEnabled` and `inAppEnabled` default to `true`

#### Scenario: Disabled preference suppresses notifications
- **WHEN** a user has set `commentsEnabled: false` or `inAppEnabled: false`
- **THEN** subsequent comment or reply events targeting that user do not generate notifications

---

### Requirement: Frontend Localization and Deep Linking
The frontend SHALL translate notification codes into localized messages and provide deep linking to referenced items.

#### Scenario: Rendering localized notification with snippet
- **WHEN** a user views notifications in the inbox or preview dropdown
- **THEN** the UI renders localized text interpolated with parameters, author details, and content snippets

#### Scenario: Deep linking to target resource
- **WHEN** a user clicks a notification item
- **THEN** the application navigates directly to the target URL (e.g. `/<itemType>/<itemId>?commentId=<commentId>`)
