## ADDED Requirements

### Requirement: Single Responsibility Component Decomposition
Large monolithic frontend components and pages exceeding 400 lines SHALL be decomposed into focused subcomponents, separating orchestration, data-fetching, and presentational logic.

#### Scenario: Rendering complex administration and generator views
- **WHEN** complex views such as `OutputInfoPanel`, `media-upload.form`, or `management/notifications/page` are rendered
- **THEN** each view delegates layout, input controls, and data state handling to distinct, single-responsibility subcomponents.

### Requirement: Presentational and Container Separation
Forms and interactive panels SHALL separate server/API query orchestration from visual rendering elements.

#### Scenario: Media upload form execution
- **WHEN** a user uploads media through `media-upload.form`
- **THEN** file selection, preview rendering, and upload mutation orchestration are handled by distinct, composable helper components or hooks.
