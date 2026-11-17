# webhook-embed-builder Specification

## Purpose

Defines requirements for Discord webhook creation and editing forms, mode toggling between raw chat messages and structured Discord embeds, interactive visual preview, dynamic field configuration, and confirmation dialog cancel behavior.

## Requirements

### Requirement: Webhook Message Type Toggle
The system SHALL provide a mode toggle option in Webhook Create and Update forms allowing users to select between "Chat Message" (plain text) and "Embed Builder".

#### Scenario: User selects Chat Message mode
- **WHEN** user selects "Chat Message" mode in the webhook form
- **THEN** the system displays a text area for entering raw text templates and renders plain text preview

#### Scenario: User selects Embed Builder mode
- **WHEN** user selects "Embed Builder" mode in the webhook form
- **THEN** the system displays interactive controls for editing Discord Embed fields and renders a live Discord Embed preview

---

### Requirement: Discord Embed Visual Preview
The system SHALL visually render Discord Embed objects (with left color bar, author, title, description, fields, and footer) in both webhook cards and webhook edit forms.

#### Scenario: Rendering a JSON embed in Webhook Card
- **WHEN** a webhook has data formatted as a valid JSON embed
- **THEN** `WebhookCardView` renders a Discord-styled embed preview instead of plain JSON text

---

### Requirement: Interactive Embed Builder Form
The system SHALL allow users to construct Discord Embeds via UI controls (Title, Description, Color, Author, Footer, and dynamic Fields) without writing raw JSON strings.

#### Scenario: Adding a field to an embed
- **WHEN** user clicks "Add Field" in Embed Builder
- **THEN** a new field input row with Name, Value, and Inline toggle is added to the embed configuration

---

### Requirement: Delete Webhook Dialog Cancel Action
The system SHALL include a Cancel button in the Delete Webhook confirmation alert dialog.

#### Scenario: User cancels webhook deletion
- **WHEN** user clicks "Cancel" in the Delete Webhook alert dialog
- **THEN** the dialog closes without deleting the webhook
