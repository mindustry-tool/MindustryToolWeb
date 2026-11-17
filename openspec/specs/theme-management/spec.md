# theme-management Specification

## Purpose
Provides theme persistence, dark/light/gradient theme switching, and zero-FOUC script injection compatible with React 19 and Next.js 16.

## Requirements

### Requirement: Zero-FOUC theme hydration compatible with React 19
The application SHALL apply theme initialization before hydration without rendering inline `<script>` tags inside client component render trees.

#### Scenario: Initial page load
- **WHEN** the application loads in the browser
- **THEN** the initial theme attribute is applied to the HTML document element without triggering React 19 client script tag warnings

---

### Requirement: Theme switching and persistence
The application SHALL support switching between `light`, `dark`, and `gradient` themes and persist the user's choice to client storage.

#### Scenario: User selects a new theme
- **WHEN** the user selects a theme (`light`, `dark`, or `gradient`) from the theme switcher
- **THEN** the theme is saved to client storage and the document element class is updated immediately

---

### Requirement: Theme integration with notifications
The application SHALL provide current theme information to the notification component (`Toaster`).

#### Scenario: Toast component theme synchronization
- **WHEN** the active theme changes
- **THEN** the `Toaster` component receives the updated theme value
