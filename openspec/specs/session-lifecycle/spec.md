# session-lifecycle Specification

## Purpose
TBD - created by archiving change clear-session-on-401. Update Purpose after archive.
## Requirements
### Requirement: Client Session Cache Clearing on 401
The frontend SHALL immediately clear the TanStack Query session cache to `null` when an unauthorized response is encountered.

#### Scenario: Unauthorized response clears session cache
- **WHEN** `apiInstance` encounters an HTTP 401 status code during client execution
- **THEN** TanStack Query cache for query key `['session']` is updated to `null`, transitioning session state to `'unauthenticated'`

### Requirement: Graceful Session Query 401 Handling
The session initialization query SHALL treat 401 responses as a valid unauthenticated state rather than a terminal failure.

#### Scenario: Unauthenticated visitor checks session
- **WHEN** the session query fetches `/auth/session` and receives an HTTP 401 response
- **THEN** the query returns `null` data without error, avoiding activation of the session error screen

### Requirement: Session State Unauthenticated Fallback
The frontend session provider SHALL treat empty or null session data as an unauthenticated state and must not remain indefinitely in the loading state.

#### Scenario: Session response is null or empty
- **WHEN** the session query resolves with `null`, an empty string, or an error
- **THEN** `SessionContext` resolves state to `'unauthenticated'` with `session: null`

