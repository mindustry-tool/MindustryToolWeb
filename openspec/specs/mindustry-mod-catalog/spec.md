# mindustry-mod-catalog Specification

## Purpose

Define synchronization with the official Mindustry mods repository (`mods.json`), mod metadata resolution (icons, author, repository, stars), and serving mod details through backend APIs. Created by archiving change `sync-mod-catalog-and-redesign-crash-ui`.

## Requirements

### Requirement: Daily Mindustry Mod Catalog Synchronization
The backend system SHALL fetch the official Mindustry mods list from `https://raw.githubusercontent.com/Anuken/MindustryMods/master/mods.json` once every 24 hours and cache it in memory.

#### Scenario: Startup catalog warming
- **WHEN** the backend application finishes bootstrapping
- **THEN** it triggers an initial fetch of `mods.json` if the cache is uninitialized

#### Scenario: Scheduled daily update
- **WHEN** the daily midnight cron triggers
- **THEN** the system refreshes the in-memory catalog from GitHub

### Requirement: Mod Identifier Matching and Fallbacks
The backend SHALL map crash report mod identifiers and names against the cached catalog to retrieve mod details, including name, author, repository, description, star count, and icon URL.

#### Scenario: Resolving cataloged mod with icon
- **WHEN** resolving a mod with `hasIcon: true` and repo `3snake3/sapphirium`
- **THEN** `iconUrl` is returned as `https://raw.githubusercontent.com/3snake3/sapphirium/HEAD/icon.png`

#### Scenario: Resolving unlisted mod
- **WHEN** resolving a mod not present in `mods.json`
- **THEN** the system returns a fallback mod object with `iconUrl: null`, `repo: null`, and the raw mod ID/name

### Requirement: Serving Mod Metadata via API
The backend API SHALL expose mod metadata in `crashedModDtoSchema`, `crashDtoSchema`, and via `GET /crashed-mods/:mod`.

#### Scenario: Querying specific mod info
- **WHEN** a client calls `GET /crashed-mods/:mod`
- **THEN** the API returns the resolved `ModInfoDto` for that mod
