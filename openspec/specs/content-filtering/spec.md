# content-filtering Specification

## Purpose

Defines backend content moderation and bad-words filtering for outbound chat messages and inbound player-connect room updates, encapsulated within a dedicated `ProfanityService` backed by `leo-profanity` with in-memory caching.

## Requirements

### Requirement: Outbound Chat Content Moderation
The backend SHALL sanitize chat message content before storing it or broadcasting it to downstream consumers.

#### Scenario: User sends profane chat message
- **WHEN** an authenticated user sends chat content containing banned words
- **THEN** the backend stores a sanitized version of the message and prevents broadcasting raw profanity via chat APIs, SSE streams, or Discord forwarding

#### Scenario: Shared moderation service usage
- **WHEN** `ChatService` processes a message
- **THEN** it delegates text sanitization to `ProfanityService` rather than embedding direct library dependencies

#### Scenario: Delivery consistency for moderated chat
- **WHEN** chat content is sanitized and accepted
- **THEN** persistent storage, real-time SSE subscribers, and Discord webhooks receive the identical sanitized text

---

### Requirement: Inbound Room Text Moderation
The backend SHALL sanitize user-visible text fields from inbound player-connect room updates before storing room state or publishing updates.

#### Scenario: Room metadata contains banned words
- **WHEN** `PlayerConnectService` receives a room update with profanity in display fields
- **THEN** it stores sanitized versions of those fields in memory and broadcasts sanitized data to subscribers

#### Scenario: Non-text room data preservation
- **WHEN** bad-words filtering is applied to room display fields
- **THEN** non-text properties and room state availability remain intact with their original values

#### Scenario: Moderation service encapsulation
- **WHEN** room updates are processed
- **THEN** `PlayerConnectService` delegates text cleaning to `ProfanityService` without direct coupling to `leo-profanity`

---

### Requirement: Profanity Caching via NestJS CacheModule
`ProfanityService` SHALL cache sanitized string results using NestJS `CacheModule` to optimize throughput for repeated phrases.

#### Scenario: Cache hit avoids re-running profanity pipeline
- **WHEN** `sanitizeText()` is called with an input string matching an active cache entry
- **THEN** the cached sanitized result is returned directly without re-executing the sanitization regex engine

#### Scenario: Cache key format and TTL
- **WHEN** `sanitizeText()` runs
- **THEN** the cache entry is stored under prefix `profanity:sanitize:` followed by a deterministic input hash, expiring after the configured TTL

#### Scenario: Stable interface contract
- **WHEN** consumers call `ProfanityService.sanitizeText()`
- **THEN** the return type consistently provides `{ value: string, filtered: boolean }`