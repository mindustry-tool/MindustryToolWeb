# community-server-directory Specification

## Purpose

Defines requirements for official Mindustry multiplayer server list discovery, hourly synchronization from GitHub, binary UDP health-check pings, GeoIP country resolution, group player aggregation, 24-hour player snapshots, and public directory UI with live metrics.

## Requirements

### Requirement: Hourly GitHub Server List Ingestion
The system SHALL fetch `servers_v8.json` and `servers_be.json` from the official repository (`https://raw.githubusercontent.com/Anuken/MindustryServerList/main/`) every hour, reconcile `CommunityServerGroup` and `CommunityServer` records, and detect additions and deletions.

#### Scenario: Successful synchronization of server groups and addresses
- **WHEN** the hourly ingestion job executes
- **THEN** new server groups and server addresses are inserted, existing records are updated with channels (`v8` / `be`) and `lastSeenAt`, and DNS hostnames are resolved to IP addresses

#### Scenario: Soft-deleting servers removed from GitHub
- **WHEN** a server address previously registered in the database is no longer present in either `servers_v8.json` or `servers_be.json`
- **THEN** the system SHALL set `deletedAt = now()` on the `CommunityServer` record and mark it offline

#### Scenario: Hard-deleting servers after 7 days of soft deletion
- **WHEN** the hourly ingestion job encounters a `CommunityServer` where `deletedAt` is older than 7 days
- **THEN** the system SHALL permanently delete the record and cascade-delete its historical snapshots

#### Scenario: Pruning snapshots older than 7 days
- **WHEN** the hourly ingestion job completes
- **THEN** any `CommunityServerSnapshot` records where `createdAt` is older than 7 days SHALL be permanently removed

---

### Requirement: 2-Minute UDP Ping and Mindustry Protocol Parsing
The system SHALL ping all active `CommunityServer` entries via UDP every 2 minutes using Mindustry's discovery protocol packet `Buffer.from([0xfe, 0x01])`.

#### Scenario: Server responds to UDP ping
- **WHEN** the ping worker sends `[0xfe, 0x01]` to the target server port (default `6567`) within a 2.5-second timeout
- **THEN** the system SHALL decode the binary response, update `isOnline = true`, latency `ping`, `players`, `playerLimit`, `mapName`, `gamemode`, `wave`, `version`, and `serverName`

#### Scenario: Server times out or drops UDP packet
- **WHEN** the server does not respond within the 2.5-second timeout window
- **THEN** the system SHALL mark `isOnline = false`, set `ping = null`, and retain previous metadata

---

### Requirement: GeoIP Country Resolution and Unicode Flag Mapping
The system SHALL determine the country of each community server using `geoip-country` from its resolved IPv4/IPv6 address and map the ISO 2-letter country code to a Unicode regional indicator flag.

#### Scenario: Resolving country code from server IP
- **WHEN** a server host address is synchronized or resolved
- **THEN** the system SHALL look up the IP address in `geoip-country` and store the 2-letter country code (e.g. `US`, `VN`, `DE`)

#### Scenario: Fallback for private or unresolvable IP
- **WHEN** an IP cannot be determined or belongs to a private range
- **THEN** the system SHALL store `null` for `countryCode` and the frontend SHALL render a generic globe icon

---

### Requirement: Group Total Player Aggregation with Hub Exclusion
The system SHALL aggregate the total players for each `CommunityServerGroup`, excluding any server whose name contains `"hub"` (case-insensitive).

#### Scenario: Group contains both hub and game servers
- **WHEN** calculating the group's total active players
- **THEN** servers whose name contains `"hub"` SHALL NOT be included in the player sum to prevent double-counting proxy network totals

#### Scenario: Group contains only non-hub servers
- **WHEN** calculating total active players for a group without hub servers
- **THEN** all online servers in that group SHALL have their player counts summed

---

### Requirement: 5-Minute Player Count Snapshot Recording
The system SHALL record a `CommunityServerSnapshot` every 5 minutes for all active servers to build a 24-hour player count historical trend (up to 288 data points).

#### Scenario: Capturing 5-minute snapshot point
- **WHEN** the snapshot cron triggers every 5 minutes
- **THEN** a snapshot row containing `serverId`, `players`, `ping`, and `isOnline` is appended to the database

---

### Requirement: Community Server REST API Endpoints
The system SHALL provide REST API endpoints in `@mindustry-tool/api` and backend to query community servers and their 24-hour snapshot sparkline data.

#### Scenario: Querying paginated community server list
- **WHEN** client sends `GET /v4/community-servers` with search query, channel (`v8` / `be`), gamemode, or sort order
- **THEN** the API returns a paginated list of servers with group name, clean name, country code, online status, ping, current map, mode, player count, and recent sparkline points

#### Scenario: Querying server 24-hour player history
- **WHEN** client sends `GET /v4/community-servers/:id/history`
- **THEN** the API returns 5-minute snapshot data points for the past 24 hours ordered chronologically

---

### Requirement: Frontend Community Server Explorer Page
The frontend SHALL provide a dedicated page at `/community-servers` with infinite scrolling, search, filters, and high-performance SVG sparklines.

#### Scenario: Infinite scrolling community server cards
- **WHEN** user scrolls down the `/community-servers` page
- **THEN** additional pages of community servers are fetched seamlessly using TanStack React Query

#### Scenario: Displaying server card metadata and sparkline
- **WHEN** a community server card is rendered
- **THEN** it displays the Unicode country flag, clean server name, group name, latency badge, gamemode badge, map name, current/limit players, and an inline SVG player sparkline with hover tooltips
