# discord-honeypot-trap Specification

## Purpose
TBD - created by archiving change discord-honeypot-trap. Update Purpose after archive.
## Requirements
### Requirement: Honeypot trip detection
The system SHALL treat any human-authored message in honeypot channel `1556671043534327860` as a compromise signal. Bot-authored messages MUST be ignored.

#### Scenario: Human posts in honeypot
- **WHEN** a non-bot user sends any message in channel `1556671043534327860`
- **THEN** the system triggers honeypot enforcement for that user

#### Scenario: Bot message in honeypot ignored
- **WHEN** a message in channel `1556671043534327860` has `author.bot` true
- **THEN** the system takes no honeypot action

#### Scenario: Normal channel message does not trip
- **WHEN** a user sends a message in any channel other than `1556671043534327860`
- **THEN** the system does not trigger honeypot enforcement and continues normal handling

### Requirement: Five-minute recent-message tracking
The system SHALL maintain a per-user buffer of up to 50 recent messages from the last 5 minutes, storing `channelId`, `messageId`, and `timestamp`, pruned on write and on periodic cleanup.

#### Scenario: Buffer records normal messages
- **WHEN** a non-bot user sends a message in any guild text channel
- **THEN** the system appends `{ channelId, messageId, timestamp }` to that user's buffer, evicting oldest entries beyond 50 and entries older than 5 minutes

#### Scenario: Buffer expires old entries
- **WHEN** 5 minutes elapse since a buffered entry's timestamp
- **THEN** the system removes that entry during periodic cleanup

#### Scenario: Buffer survives normal preview flow
- **WHEN** a tracked message triggers schematic/map preview logic
- **THEN** the system still retains the tracking entry for honeypot purposes

### Requirement: Honeypot nuke plus DM-invite plus kick
The system SHALL on honeypot trip delete the trigger message first, then delete buffered messages via individual best-effort deletes, then attempt a DM invite and kick the member with reason `honeypot tripped`. Kick MUST proceed even if DM or individual deletes fail; failures MUST be logged.

#### Scenario: Successful nuke and kick
- **WHEN** a honeypot trip fires for a user with 3 buffered messages
- **THEN** the system deletes the honeypot message, deletes the 3 buffered messages individually, DMs a single-use invite, and kicks the member

#### Scenario: DM closed still kicks
- **WHEN** a honeypot trip fires but the user has DMs closed
- **THEN** the system logs the DM failure and still kicks the member

#### Scenario: Already-deleted message tolerated
- **WHEN** a buffered message was already deleted before enforcement
- **THEN** the system skips it, logs a warning, and continues with remaining messages and kick

#### Scenario: No role exemptions for humans
- **WHEN** a moderator or admin posts in the honeypot channel
- **THEN** the system enforces identically (nuke plus kick)

