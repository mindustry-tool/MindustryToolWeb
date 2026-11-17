# content-items Specification

## Purpose

Defines requirements for unified item identification across schematics, maps, posts, and content patches using `itemId`, asset retrieval and downloads, verifier and author item editing, optimistic UI mutations, and frontend routing.
## Requirements
### Requirement: Unified Item Retrieval and Asset Access by itemId
The backend endpoints for schematics, maps, posts, and content-patches SHALL operate using the unified string `itemId` identifier.

#### Scenario: Retrieve schematic details and assets by itemId
- **WHEN** a client requests `/schematics/:id`, `/schematics/:id/image.png`, or `/schematics/:id/data` using an `itemId`
- **THEN** the system finds the matching schematic record and returns the metadata, preview image, or binary `.msch` file (incrementing the download counter on data download)

#### Scenario: Retrieve map details and assets by itemId
- **WHEN** a client requests `/maps/:id`, `/maps/:id/image.png`, or `/maps/:id/data` using an `itemId`
- **THEN** the system finds the matching map record and returns the metadata, preview image, or binary `.msav` file (incrementing the download counter on data download)

#### Scenario: Retrieve and manage posts by itemId
- **WHEN** a client requests `GET /posts/:id`, `PUT /posts/:id`, `DELETE /posts/:id`, or records views via `POST /posts/:id/view` using an `itemId`
- **THEN** the system retrieves, modifies, deletes, or increments the view count for the post record matching `itemId`

#### Scenario: Retrieve content patch details and data by itemId
- **WHEN** a client requests `GET /content-patches/:id` or `GET /content-patches/:id/data` using an `itemId`
- **THEN** the system returns the content patch record or patch data payload matching `itemId`

#### Scenario: Detail response embeds author
- **WHEN** a client requests `GET /schematics/:id` or `GET /maps/:id`
- **THEN** the response includes `createdByUser: { id, name, imageUrl }` for the item's author, so no separate user fetch is required

### Requirement: Verification Actions Using itemId
Moderation and verification endpoints SHALL inspect and update verification status using `itemId`, supporting optional rejection reason submission.

#### Scenario: Verifying an item by itemId
- **WHEN** an authorized verifier submits a status change to `PUT /:itemType/:id/verify` using an `itemId`
- **THEN** the system updates the verification status of the record matching `itemId` to `VERIFIED` and notifies the author with credits awarded and links pointing to `/${itemType}/${itemId}`

#### Scenario: Rejecting an item with an optional reason by itemId
- **WHEN** an authorized verifier submits a status change to `PUT /:itemType/:id/reject` with an optional `reason` in the request body
- **THEN** the system updates the verification status of the record matching `itemId` to `REJECTED` and sends a `verification.rejected` notification to the author containing the `reason` (if provided) and links pointing to `/${itemType}/${itemId}`

#### Scenario: Resetting verification status by itemId
- **WHEN** an authorized verifier submits a status change to `PUT /:itemType/:id/reset` using an `itemId`
- **THEN** the system updates the verification status of the record matching `itemId` to `PENDING`

---

### Requirement: Authorized Item Detail Editing
The system SHALL provide distinct authorized API endpoints for updating schematic and map details (name, description).

#### Scenario: Successful schematic update by authorized user
- **WHEN** a user with `schematic:manage` permission or the original author submits an updated `name` or `description` to `PUT /schematics/:id`
- **THEN** the system updates the schematic record, updates audit timestamps, and returns the updated schematic detail

#### Scenario: Successful map update by authorized user
- **WHEN** a user with `map:manage` permission or the original author submits an updated `name` or `description` to `PUT /maps/:id`
- **THEN** the system updates the map record, updates audit timestamps, and returns the updated map detail

#### Scenario: Unauthorized item update rejection
- **WHEN** a user without management permissions or authorship attempts to update an item
- **THEN** the system rejects the request with a 403 Forbidden status

---

### Requirement: Independent Name and Description Edit Dialogs
The frontend SHALL provide independent dialogs for editing item name and description.

#### Scenario: Opening edit name dialog
- **WHEN** an authorized user triggers the edit action adjacent to the item name
- **THEN** the system opens an edit dialog prefilled with the current name in a single-line input field

#### Scenario: Opening edit description dialog
- **WHEN** an authorized user triggers the edit action adjacent to the item description
- **THEN** the system opens an edit dialog prefilled with the current description in a multi-line input field

---

### Requirement: Optimistic Updates with Debouncing and Rollback
The client SHALL apply optimistic UI updates for item detail edits, debounce server mutations, flush pending changes on dialog close, and roll back on failure.

#### Scenario: Optimistic update with auto-flush
- **WHEN** a user submits or dismisses an item edit dialog after modifying text
- **THEN** the client immediately updates the local UI cache, flushes the debounced mutation to the server, and revalidates query state upon completion

#### Scenario: Mutation failure rollback
- **WHEN** an item update mutation fails on the server
- **THEN** the client rolls back the optimistic update to its previous value and displays an error toast notification

---

### Requirement: Frontend Routing and Links Consume itemId
Frontend item cards, preview links, download buttons, detail views, and post-upload redirects SHALL use `itemId` instead of internal database primary keys.

#### Scenario: Navigation to item detail page
- **WHEN** a user clicks on an item card or preview link
- **THEN** the application navigates to `/${itemType}/${itemId}` and loads item data using `itemId`

#### Scenario: Post-upload redirect
- **WHEN** a user successfully uploads a schematic, map, or patch
- **THEN** the application redirects the user to `/${itemType}/${data.itemId}`

