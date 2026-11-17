# ad-reward-credits Specification

## Purpose

Defines requirements for the backend API contract and `@Route` endpoints that issue single-use ad session nonces and grant `+60` user credits with per-user cooldown and daily cap enforcement.

## Requirements

### Requirement: Ad session nonce issuance
The system SHALL provide an authenticated `@Route` endpoint (`POST /users/@me/ads/session`) defined in `@mindustry-tool/api` that issues a single-use cryptographic nonce stored with a 10-minute TTL only when the user is not in cooldown and has not exceeded the daily reward cap.

#### Scenario: Eligible user requests an ad session
- **WHEN** an authenticated user with fewer than 10 claims today and no active 1-minute cooldown calls `POST /users/@me/ads/session`
- **THEN** the backend stores a single-use nonce scoped to that user and returns `{ nonce, expiresAt }`

#### Scenario: User requests an ad session during cooldown or after daily limit
- **WHEN** an authenticated user within the 1-minute cooldown or with 10 claims already recorded for the UTC day calls `POST /users/@me/ads/session`
- **THEN** the backend rejects the request with a rate-limit / bad-request error indicating cooldown or daily cap reached

### Requirement: Atomic ad reward claim and credit grant
The system SHALL provide an authenticated `@Route` endpoint (`POST /users/@me/ads/claim`) defined in `@mindustry-tool/api` that atomically verifies and consumes the single-use nonce, enforces the 1-claim-per-minute cooldown and 10-claims-per-day cap, and increments the user's `UserStats` `credit` balance by `60`.

#### Scenario: Valid single-use nonce claim
- **WHEN** an authenticated user submits an unexpired, unused `nonce` issued for their account to `POST /users/@me/ads/claim`
- **THEN** the nonce is atomically deleted, the 1-minute cooldown and daily counter are recorded, `UserStats` (`credit`) is incremented by `60` via `StatsService.addStats`, and the endpoint returns the granted amount and remaining daily quota

#### Scenario: Replayed, expired, or foreign nonce claim
- **WHEN** a user submits an already-consumed, expired, missing, or another user's `nonce` to `POST /users/@me/ads/claim`
- **THEN** the backend rejects the claim without modifying `UserStats` (`credit`)

#### Scenario: Unauthenticated access
- **WHEN** an unauthenticated caller requests either `POST /users/@me/ads/session` or `POST /users/@me/ads/claim`
- **THEN** the backend rejects the request with `401 Unauthorized`
