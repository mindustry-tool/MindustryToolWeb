# server-players Specification

## Purpose

Defines requirements for server player registry inspection, recent player activity tracking, active kicked IP management, and server moderation actions (kick, ban, unban, admin toggle).

## Requirements

### Requirement: Server Player Records Page and Search
The application SHALL provide a player records interface at `/servers/[id]/players` accessible from server management navigation with search, filtering, and pagination.

#### Scenario: Navigating to player records
- **WHEN** an authorized user navigates to `/servers/[id]/players`
- **THEN** the system displays the player records table, search input, status filters, and pagination controls

#### Scenario: Displaying player details
- **WHEN** player records are loaded from `api.v4.servers.players.getPlayerInfos`
- **THEN** each entry displays the player's last known name (with color formatting), aliases, last IP address, known IPs, join count, kick count, ban status, and in-game admin status

#### Scenario: Search and status filtering
- **WHEN** a user enters a search query (name, IP, or UUID) or selects a status filter (All, Banned, Active)
- **THEN** the system fetches filtered records matching the criteria and reflects parameters in the URL query string

#### Scenario: Pagination controls
- **WHEN** a user navigates between pages or alters the page size
- **THEN** the view queries records with updated `page` and `size` parameters and updates the URL

---

### Requirement: Live Player Moderation Actions
The system SHALL provide moderation controls to ban, unban, and toggle in-game admin status for players on an online server.

#### Scenario: Banning a player with required reason
- **WHEN** an authorized user opens the Ban modal for an active player, enters or selects a non-empty ban reason, and confirms
- **THEN** the system dispatches `ban id <uuid> <reason>` via `api.v4.servers.commands.send`, dispatches `ban ip <ip> <reason>` if IP banning is toggled on, and refreshes player and player-info queries

#### Scenario: Prevent ban submission without reason
- **WHEN** an authorized user opens the Ban modal and the reason input is empty or whitespace only
- **THEN** the ban submission action SHALL be disabled and prevent command dispatch

#### Scenario: Unbanning a player
- **WHEN** an authorized user triggers and confirms an Unban action on a banned player record
- **THEN** the system dispatches console unban commands (`unban <uuid>`, `unban <ip>`) via `api.v4.servers.commands.send` and refreshes the player list

#### Scenario: Toggling in-game admin status
- **WHEN** an authorized user toggles the admin status on a player record and confirms
- **THEN** the system dispatches `admin add <uuid>` or `admin remove <uuid>` via `api.v4.servers.commands.send` and refreshes the player list

#### Scenario: Server offline state disables live moderation
- **WHEN** the target server is offline
- **THEN** moderation action buttons requiring live console command dispatch SHALL be disabled

---

### Requirement: Recent Players Tracking and Moderation
The system SHALL provide an interface to inspect and moderate players who joined the server within the last 30 minutes.

#### Scenario: Displaying recent players
- **WHEN** an authorized user views the Recent Players section for an active server
- **THEN** the system requests recent players via `api.v4.servers.recentPlayers` and displays entries sorted descending by join timestamp (`joinedAt`), showing name, UUID, IP address, and relative join time

#### Scenario: Quick kick and ban from recent list
- **WHEN** an authorized user clicks Kick or Ban on a recent player entry, provides the required parameters (duration and/or reason), and confirms
- **THEN** the system dispatches the corresponding kick or ban console command (`kickWithReason` or `ban id <uuid> <reason>`) and refreshes recent player data

---

### Requirement: Kicked IP Address Management
The system SHALL allow viewing and removing active IP kicks on a server instance.

#### Scenario: Displaying active kicked IPs
- **WHEN** an authorized user views the Kicked IPs section
- **THEN** the system fetches kicked IPs via `api.v4.servers.kicks.getAll` and displays the IP addresses alongside formatted expiration countdowns

#### Scenario: Removing a kicked IP
- **WHEN** an authorized user clicks Remove Kick for a kicked IP and confirms
- **THEN** the system issues a DELETE request via `api.v4.servers.kicks.remove` and refreshes the kicked IPs list
