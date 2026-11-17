# scroll-restoration Specification

## Purpose
TBD - created by archiving change virtualized-grid-scroll-restoration. Update Purpose after archive.
## Requirements
### Requirement: Centralized Scroll State Storage
The system SHALL persist and retrieve scroll offset data in `localStorage` under the key `scroll-top` as a JSON map of scroll keys to numeric vertical offsets.

#### Scenario: Successfully reading stored scroll offset
- **WHEN** a container requests the stored scroll position for key `scroll-top-en-maps-grid`
- **THEN** the system returns the stored numeric vertical scroll offset, or 0 if no record exists or if storage is inaccessible

#### Scenario: Handling corrupt storage
- **WHEN** the stored JSON in `localStorage` under `scroll-top` is invalid or corrupted
- **THEN** the system resets the `scroll-top` storage to an empty object `{}` and returns 0 without crashing

### Requirement: Debounced Scroll Persistence
The system SHALL capture scroll position updates on user scroll events and persist them to storage after a debounce delay (default 300ms) to minimize I/O overhead.

#### Scenario: User scrolls within a container
- **WHEN** the user scrolls a `ScrollContainer` or `VirtualizedGrid`
- **THEN** the latest `scrollTop` value is scheduled for persistence and written to `localStorage` after the debounce interval elapses

### Requirement: Scroll Restoration in Standard Containers
The system SHALL restore the scroll position of `ScrollContainer` upon mounting or route/ID change when a saved offset exists.

#### Scenario: Returning to a previously scrolled page with ScrollContainer
- **WHEN** a user navigates back to a route containing a `ScrollContainer` with a previously saved scroll position
- **THEN** the container restores its scroll position to the saved offset

### Requirement: Layout-Aware Scroll Restoration for VirtualizedGrid
The system SHALL restore the scroll position of `VirtualizedGrid` once grid dimensions and items have been computed and rendered, synchronizing both the DOM scroll position and the component's internal `scrollTop` state.

#### Scenario: Navigating back to a VirtualizedGrid after visiting item details
- **WHEN** a user navigates back to a page containing `VirtualizedGrid` and items are loaded
- **THEN** `VirtualizedGrid` restores its DOM scroll position and updates its visible item range corresponding to the saved offset without flickering back to top

#### Scenario: Items are initially loading
- **WHEN** a user returns to a `VirtualizedGrid` page while items are empty or pending fetch
- **THEN** scroll restoration waits until items and layout dimensions are computed before applying the stored offset

### Requirement: Scoped Key Generation and Customization
The system SHALL generate scroll keys derived from the current pathname and an optional container identifier (`id`), allowing consumers to override or isolate scroll restoration keys.

#### Scenario: Multiple scroll containers on the same page
- **WHEN** two scrollable components exist on the same route with distinct `id` attributes
- **THEN** each component maintains and restores its own independent scroll offset

