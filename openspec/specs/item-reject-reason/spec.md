# item-reject-reason Specification

## Purpose

Defines requirements for the frontend rejection dialog with preset and custom reason selection for item moderation.

## Requirements

### Requirement: Preset and Custom Rejection Reason Selection
The frontend SHALL provide an interactive rejection dialog for verifiers with preset reason chips ("Duplicated", "NSFW", "Bad ratio", "No uses") and an optional custom reason text input.

#### Scenario: Opening reject dialog and selecting a preset reason
- **WHEN** an authorized verifier triggers the reject action on an item
- **THEN** a dialog opens presenting preset reason buttons ("Duplicated", "NSFW", "Bad ratio", "No uses"), an optional text input, and confirmation buttons

#### Scenario: Rejection without providing a reason
- **WHEN** a verifier confirms rejection without selecting a preset or entering text
- **THEN** the system submits the rejection request without a reason or with undefined reason, and successfully rejects the item

#### Scenario: Rejection with a preset reason
- **WHEN** a verifier selects a preset chip (e.g. "Duplicated") and confirms rejection
- **THEN** the system submits the selected preset text as the `reason` payload to the rejection endpoint

#### Scenario: Rejection with a custom reason
- **WHEN** a verifier enters a custom explanation into the reason field (up to 500 characters) and confirms rejection
- **THEN** the system submits the custom explanation as the `reason` payload to the rejection endpoint
