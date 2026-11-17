## Overview

Implement real-time messaging with Socket.IO supporting direct (1‑1), room, and global channels. Keep scope minimal: send/receive text only, no edits, statuses, reactions, typing indicators, announcements, or media uploads. Do not use Prisma or raw SQL; illustrate models with Prisma-like schema examples using camelCase.

## Data Models (Example Only)

```prisma
model Conversation {
  id           String   @id @default(uuid())
  type         ConversationType
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum ConversationType {
  direct
  room
  global
}

model Participant {
  id             String   @id @default(uuid())
  conversationId String
  userId         String
  role           ParticipantRole @default(member)
  joinedAt       DateTime @default(now())
}

enum ParticipantRole {
  admin
  moderator
  member
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  senderId       String
  content        String
  createdAt      DateTime @default(now())
}
```

## Persistence Strategy

* Use Redis as a lightweight store (no SQL/Prisma). Keys:

  * `conversation:{id}:messages` → list of serialized `Message`

  * `conversation:{id}:participants` → set of `userId`

* Provide simple history retrieval by range (e.g., last N messages). Migrate to DB later if needed.

## Socket.IO Server

* Integrate Socket.IO with NestJS gateway, authenticate via existing session/JWT on handshake.

* Namespaces: single default namespace `/`.

* Rooms: use Socket.IO rooms keyed by `conversation:{id}`.

## Events

* `connection`, `disconnect`.

* Direct:

  * `direct:message:send` → payload `{toUserId, content}`; server resolves/creates direct conversation and emits `direct:message:receive` to both users.

* Room:

  * `room:join` / `room:leave` → payload `{conversationId}`; server joins/leaves Socket.IO room.

  * `room:message:send` → payload `{conversationId, content}`; server emits `room:message:receive` to room.

* Global:

  * `global:message:send` → payload `{content}`; server emits `global:message:receive` to all connected clients.

* History:

  * `message:history` → payload `{conversationId, limit, before?}`; server returns last N messages from Redis.

## Access Control

* Users can only send to conversations they belong to.

* Direct conversations are unique per user pair; server enforces membership.

* Global send restricted to authenticated users (optionally admin-only if desired).

## Rate Limiting & Validation

* Simple per-user message throttle (e.g., 20/min) via Redis counters.

* Validate `content` length (1–500 chars) and strip unsafe markup.

## Frontend Integration

* Add `socket.io-client` to frontend; create a minimal client module handling connect/auth.

* Hooks:

  * `useDirectMessaging()` with `sendDirectMessage(toUserId, content)` and subscription to `direct:message:receive`.

  * `useRoomMessaging(conversationId)` with `joinRoom`, `leaveRoom`, `sendRoomMessage` and subscription to `room:message:receive`.

  * `useGlobalMessaging()` with `sendGlobalMessage` and subscription to `global:message:receive`.

* UI Components (Shadcn/Radix/Tailwind): `ConversationList`, `MessageList`, `MessageInput`, `MessageBubble`. No status/reaction/typing.

## Implementation Steps

1. Install Socket.IO server/client packages.
2. Add NestJS Socket.IO gateway with handshake auth and error handling.
3. Implement Redis adapters for conversations, participants, and message storage.
4. Implement direct messaging flow (resolve/create conversation, store, emit).
5. Implement room join/leave and room messaging.
6. Implement global messaging broadcast.
7. Implement history retrieval from Redis.
8. Add frontend client, hooks, and minimal UI.
9. Add rate limiting and input validation.

## Out of Scope (Explicitly Removed)

* Message edit/delete, delivery/read statuses, reactions, typing indicators, announcements, file/media uploads, tests.

## Notes

* Use camelCase names in code and data.

* Keep components small and client-only where Socket.IO APIs are needed; prefer server-rendered pages elsewhere.

