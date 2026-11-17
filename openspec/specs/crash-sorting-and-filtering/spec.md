# crash-sorting-and-filtering Specification

## Purpose

Define query parameters, ordering rules, status filtering, and UI presentation for mod crash reports. Created by archiving change `add-crash-sort-and-filters`.

## Requirements

### Requirement: Querying Crash Reports with Sort and Order Parameters
The backend API SHALL accept optional `sort` and `order` parameters on `api.v4.crashes.findAll`. The allowed `sort` values SHALL be `last_seen`, `first_created`, and `count`. The allowed `order` values SHALL be `asc` and `desc`.

#### Scenario: Default sort order when unspecified
- **WHEN** a client calls `findAll` without `sort` and `order` parameters
- **THEN** the backend orders reports by `updatedAt desc`

#### Scenario: Sorting by first created ascending
- **WHEN** a client calls `findAll` with `sort=first_created` and `order=asc`
- **THEN** the backend orders reports by `createdAt asc`

#### Scenario: Sorting by occurrence count descending
- **WHEN** a client calls `findAll` with `sort=count` and `order=desc`
- **THEN** the backend orders reports by `count desc`

### Requirement: Crash Page Sorting and Filtering Controls
The frontend crash list page at `/crashes/[mod]` SHALL provide controls to filter by crash status (`ALL`, `PENDING`, `RESOLVED`), select the sort metric (`last_seen`, `first_created`, `count`), and toggle the order direction (`asc`, `desc`).

#### Scenario: Selecting status filter
- **WHEN** a user selects a status filter such as `PENDING`
- **THEN** the list refreshes showing only crashes with the selected status, resetting the infinite query to page 0

#### Scenario: Changing sort metric
- **WHEN** a user selects a sort metric such as `count`
- **THEN** the list refreshes ordered by that metric, resetting the infinite query to page 0

#### Scenario: Toggling sort direction
- **WHEN** a user clicks the direction toggle button
- **THEN** the sort order toggles between ascending and descending and the list refreshes

### Requirement: URL State Synchronization for Crash Filters
The frontend crash list page SHALL synchronize the `sort`, `order`, and `status` values with the URL query parameters using `nuqs`.

#### Scenario: Navigating with URL query parameters
- **WHEN** a user opens `/crashes/[mod]?sort=count&order=desc&status=PENDING`
- **THEN** the page initializes the UI controls to count, descending, and pending, and queries the backend with those parameters

### Requirement: Displaying Timestamp and Occurrence Metadata on Crash Cards
Each crash card on the crash list page SHALL display the total number of occurrences, the first created timestamp, and the last seen timestamp with relative time indicators.

#### Scenario: Viewing crash card metadata
- **WHEN** a user views a crash card
- **THEN** the card displays the occurrence count, the first created timestamp, and the last seen timestamp

### Requirement: Search Filtering on Mod Directory
The `/crashes` page SHALL provide a search bar to filter crashed mods in real-time by mod name, mod identifier, or author.

#### Scenario: Searching for a mod
- **WHEN** a user enters a search query in the search bar on `/crashes`
- **THEN** only mods matching the query in name, identifier, or author are displayed

### Requirement: Mod Hero Card on Mod Crash List Page
The `/crashes/[mod]` page SHALL render a hero card displaying the mod's icon (or fallback avatar), display name, author, version, minimum game version, GitHub link with star count, and description preview.

#### Scenario: Viewing mod hero banner
- **WHEN** a user navigates to `/crashes/[mod]`
- **THEN** the mod's metadata and icon are displayed in the header hero section

### Requirement: Mod Identity on Crash Detail Page
The `/crashes/[mod]/[id]` page SHALL render the mod's icon and GitHub repository link in the header and breadcrumb navigation.

#### Scenario: Navigating from crash detail to GitHub
- **WHEN** a user views a crash detail with a known GitHub repository
- **THEN** a link to the repository is accessible from the header and metadata sections

