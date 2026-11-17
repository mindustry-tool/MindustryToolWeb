# app-navigation Specification

## Purpose

Defines requirements for main application navigation and sidebar layout, including active route styling, priority matching for overlapping routes, collapsible parent exclusion, and sticky bottom utility links during scroll overflow.
## Requirements
### Requirement: Active Route Primary Background Highlighting
The application navbar and sidebar SHALL highlight the single active navigation link matching the current route with a primary background style (`bg-sidebar-accent` or `bg-primary` and `text-sidebar-accent-foreground`).

#### Scenario: Single route highlighted for exact or prefix match
- **WHEN** the user navigates to a route listed in navigation
- **THEN** only the single matching navigation item is rendered with the active background style

#### Scenario: Specificity priority for overlapping routes
- **WHEN** the current route matches multiple navigation paths (e.g. `/servers` and `/servers/explorer`)
- **THEN** the system SHALL select only the most specific matching route so that exactly one link is active at any time

#### Scenario: Collapsible parent triggers excluded
- **WHEN** a user navigates to a sub-route inside a collapsible menu
- **THEN** the child navigation item SHALL be highlighted, and the parent collapsible trigger SHALL NOT receive the active primary background style

---

### Requirement: Sticky Bottom Navigation Items
The bottom navigation utility links (Help, Change Language, Donate) SHALL remain anchored and visible at the bottom of the sidebar regardless of content height.

#### Scenario: Content overflow handling
- **WHEN** the sidebar navigation content exceeds available viewport height
- **THEN** only the main navigation groups scroll, while Help, Change Language, and Donate remain fixed at the bottom above the user profile footer

#### Scenario: Sidebar collapse/expand consistency
- **WHEN** the sidebar is expanded or collapsed
- **THEN** the bottom navigation items maintain their consistent anchored position

---

### Requirement: Community Server Navigation Link
The application navbar and sidebar SHALL include a direct navigation link for Community Servers (`/community-servers`) under the public server browsing section.

#### Scenario: Navigating to Community Servers
- **WHEN** user clicks on the "Community Servers" link in the navbar or sidebar
- **THEN** the application navigates to `/community-servers` and sets the active navigation highlight on the link

### Requirement: Selective Route Prefetching for Common Navigation
The application navigation SHALL support selective route prefetching, enabling prefetch on high-priority navigation links (such as main navbar items and server navigation links) while preventing unsolicited prefetch floods across general feed or card links.

#### Scenario: General links default to no prefetch
- **WHEN** a `LocalLink` is rendered without an explicit `prefetch` prop
- **THEN** Next.js route prefetching is disabled (`prefetch={false}`) to protect request quotas

#### Scenario: Common navigation links prefetch
- **WHEN** a `LocalLink` is rendered in primary navigation components with `prefetch={true}`
- **THEN** Next.js route prefetching is active for that common route

#### Scenario: Server navigation links prefetch
- **WHEN** a user is inside the server management context (`nav.mode === 'server'`)
- **THEN** the server navigation sidebar links rendered by `NavGroupSingleItemList` and `NavGroupMultipleItemList` have route prefetching enabled (`prefetch={true}`)

### Requirement: Mobile Navbar Auto-Close on Navigation
When the viewport is in mobile mode (`isMobile === true`), the application navbar SHALL automatically close the mobile sidebar drawer whenever the active route pathname changes.

#### Scenario: Closing mobile drawer on route navigation
- **WHEN** the mobile navbar drawer is open on a mobile viewport and the user navigates to a different route pathname
- **THEN** the mobile navbar drawer closes automatically (`openMobile` becomes `false`)

#### Scenario: Collapsible group trigger keeps mobile drawer open
- **WHEN** the mobile navbar drawer is open and the user clicks a collapsible navigation group trigger without changing the route pathname
- **THEN** the collapsible group toggles its expanded state and the mobile navbar drawer remains open

#### Scenario: Desktop sidebar state remains unaffected
- **WHEN** the user navigates to a different route pathname on a desktop viewport (`isMobile === false`)
- **THEN** the desktop sidebar expanded or collapsed state SHALL NOT be modified by mobile auto-close behavior

