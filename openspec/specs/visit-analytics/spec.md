# visit-analytics Specification

## Purpose

Defines requirements for tracking unique visitor IP addresses with in-memory write deduplication, persisting visit timestamps, exposing aggregated analytics by date range without IP exposure, and presenting metrics in the admin dashboard.
## Requirements
### Requirement: Anonymous IP Visit Tracking and Cache Deduplication
The system SHALL track unique visitor metrics using an in-memory cache to throttle persistent database writes, associating each visit with its client origin (`web`, `mod`, or `unknown`) in the `IpVisit` table.

#### Scenario: First visit records metric ID and client
- **WHEN** an HTTP request arrives with a metric ID not present in the in-memory cache
- **THEN** the system determines the client type (`web` if prefixed with `web:`, `mod` if prefixed with `mod:`, defaulting to `unknown` if unspecified), upserts the `IpVisit` record with the metric ID, current timestamp, and client attribution, and caches the entry with a 5-minute TTL

#### Scenario: Subsequent visit within 5 minutes
- **WHEN** a request arrives with a metric ID seen within the last 5 minutes
- **THEN** the system skips the database write due to cache hit

#### Scenario: Subsequent visit after cache expiration
- **WHEN** a request arrives with a metric ID whose cache entry has expired
- **THEN** the system updates `lastAccess` and `client` in the `IpVisit` record and refreshes the cache

### Requirement: Request Interception via RouteInterceptor
The system SHALL evaluate and record IP visits within `RouteInterceptor` on HTTP requests matching defined API routes.

#### Scenario: Visit recorded on valid route request
- **WHEN** an incoming HTTP request is handled by `RouteInterceptor`
- **THEN** the interceptor invokes the visitor tracking service asynchronously without blocking route execution

---

### Requirement: Aggregated Analytics Queries Without IP Exposure
The system SHALL provide an administrative endpoint that returns aggregated visitor counts across calendar intervals both in total and separated by client type without exposing IP addresses or individual identifiers.

#### Scenario: Querying interval visit counts with client breakdown
- **WHEN** an authorized admin requests visit statistics with `start` and `end` query parameters
- **THEN** the system returns an object containing `{ daily, weekly, monthly }` where each interval contains `{ total, mod, web, unknown }` counts for unique visitor records active within those periods

#### Scenario: IP privacy invariant
- **WHEN** the analytics endpoint returns data
- **THEN** the response body SHALL contain strictly numeric aggregation counts and no IP addresses or individual identifiers

### Requirement: Admin Analytics Dashboard Presentation
The administrative interface SHALL display visitor analytics in an Analytics tab within the user management area, showing total visitor numbers alongside counts separated by client (`web`, `mod`, and `unknown`).

#### Scenario: Analytics tab displays total and client breakdown
- **WHEN** an admin navigates to the management area and selects the Analytics tab
- **THEN** each time interval card (Daily, Weekly, Monthly) displays the total number of unique visitors and separate count indicators for each client type (`Web`, `Mod`, and `Unknown`)

### Requirement: Web Metric Cookie Prefixing
The frontend `ClientInit` component SHALL ensure the `mid` cookie value is prefixed with `web:` (e.g. `web:<uuid>`) when creating or ensuring the visitor metric cookie for non-bot visitors, and SHALL NOT generate or set a `mid` cookie when the visitor's `navigator.userAgent` is identified as a bot or crawler.

#### Scenario: Client generates new mid cookie for non-bot visitor
- **WHEN** a non-bot user visits the web application and has no existing valid `web:`-prefixed `mid` cookie
- **THEN** the system generates a random UUID, prefixes it with `web:`, and sets the `mid` cookie across subdomains

#### Scenario: Preserving existing web-prefixed mid cookie
- **WHEN** a user visits the web application and already has a valid `mid` cookie starting with `web:`
- **THEN** the system retains the existing `mid` value without modification

#### Scenario: Skipping mid cookie for bot or crawler user agent
- **WHEN** a bot or crawler (identified via `isbot` on `navigator.userAgent`) visits the web application without a valid `web:`-prefixed `mid` cookie
- **THEN** the system SHALL NOT generate or set the `mid` cookie

