# concurrent-user-tracking Specification

## Purpose
TBD - created by archiving change fix-concurrent-user-count-mid. Update Purpose after archive.
## Requirements
### Requirement: Concurrent User Tracking with Metric ID
The system SHALL track active concurrent users in memory using metric IDs (`mid`), associating each active session with its client platform (`web`, `mod`, or `unknown`), and exposing counts via the `cuncurrent_user` Prometheus gauge with a `client` label.

#### Scenario: Request with web metric ID
- **WHEN** an HTTP request completes carrying a `mid` starting with `web:`
- **THEN** the system updates or records the metric ID with client `web` in memory with a 30-minute sliding expiration window and updates `cuncurrent_user{client="web"}`

#### Scenario: Request with mod metric ID
- **WHEN** an HTTP request completes carrying a `mid` starting with `mod:`
- **THEN** the system updates or records the metric ID with client `mod` in memory with a 30-minute sliding expiration window and updates `cuncurrent_user{client="mod"}`

#### Scenario: Request with unprefixed metric ID
- **WHEN** an HTTP request completes carrying a `mid` without a recognized prefix
- **THEN** the system updates or records the metric ID with client `unknown` in memory with a 30-minute sliding expiration window and updates `cuncurrent_user{client="unknown"}`

### Requirement: Anonymous Concurrent User Tracking
The system SHALL track requests lacking a `mid` identifier in a separate dedicated Prometheus gauge named `cuncurrent_user_anonymous`, deduplicated by the client's real IP address.

#### Scenario: Request lacking mid identifier
- **WHEN** an HTTP request completes without a `mid` cookie or header
- **THEN** the system records the request's real IP in memory with a 30-minute sliding expiration window and sets `cuncurrent_user_anonymous` to the number of active anonymous IPs

### Requirement: Sliding Window Cleanup and Efficient In-Memory Sweeping
The system SHALL store active concurrent sessions using $O(1)$ in-memory hash maps and perform periodic sweeps to evict expired sessions and refresh Prometheus gauges.

#### Scenario: Periodic session expiration
- **WHEN** the background interval executes (every 30 to 60 seconds)
- **THEN** the system evicts all sessions whose sliding window timestamp has expired and sets the corresponding Prometheus gauge values to the remaining active counts

