# donation-dialog Specification

## Purpose
TBD - created by archiving change donation-dialog. Update Purpose after archive.
## Requirements
### Requirement: Timed Session Trigger
The application SHALL trigger the donation dialog prompt only after a user has been browsing the web application for at least 1 minute (60 seconds) in the current session.

#### Scenario: User browsing for less than 1 minute
- **WHEN** a user visits the application and spends less than 60 seconds
- **THEN** the donation dialog SHALL NOT be displayed

#### Scenario: User browsing reaches 1 minute
- **WHEN** a user has been browsing the application for 60 seconds and is not suppressed by cooldown or permanent opt-out
- **THEN** the donation dialog SHALL be displayed

#### Scenario: User visits the donation page directly
- **WHEN** the current route is `/donate` or its localized path
- **THEN** the donation dialog SHALL NOT appear even if 60 seconds have elapsed

---

### Requirement: Frequency Capping and 3-Day Cooldown
The system SHALL restrict the presentation of the donation dialog to at most once every 3 days (259,200,000 ms) per client device.

#### Scenario: Prior display within the 3-day window
- **WHEN** the donation dialog was previously displayed less than 3 days ago and the user has not permanently opted out
- **THEN** the dialog SHALL NOT be shown

#### Scenario: Cooldown period elapsed
- **WHEN** at least 3 days have elapsed since the dialog was last shown and the user reaches the 1-minute session mark
- **THEN** the donation dialog SHALL be shown again

---

### Requirement: Permanent Opt-Out Option
The donation dialog SHALL include a checkbox allowing the user to permanently suppress future donation dialogs.

#### Scenario: Default checkbox state
- **WHEN** the donation dialog opens
- **THEN** the "Don't show this again" checkbox SHALL be unchecked by default

#### Scenario: Dismissal without checking opt-out
- **WHEN** the user closes the dialog or clicks "Maybe later" while "Don't show this again" is unchecked
- **THEN** the system SHALL record the current timestamp as the last shown time and snooze the prompt for 3 days

#### Scenario: Dismissal with opt-out checked
- **WHEN** the user checks "Don't show this again" and closes the dialog
- **THEN** the system SHALL set the permanent suppression flag in local storage and never show the dialog again

#### Scenario: Clicking Donate with opt-out checked
- **WHEN** the user checks "Don't show this again" and clicks the "Donate" call-to-action
- **THEN** the system SHALL set the permanent suppression flag in local storage and navigate the user to `/donate`

---

### Requirement: Centered Modal Dialog Presentation
The system SHALL render the donation prompt as a centered modal dialog with an overlay backdrop, icon, localized header, description, and action controls.

#### Scenario: Dialog visual composition
- **WHEN** the donation dialog opens
- **THEN** it SHALL render an icon (e.g. Heart), a localized title, descriptive copy explaining community funding needs, the opt-out checkbox, a dismiss action, and a primary CTA button navigating to `/donate`

#### Scenario: Clicking primary CTA
- **WHEN** the user clicks the "Donate" button
- **THEN** the dialog SHALL close and navigate the user to `/donate`

