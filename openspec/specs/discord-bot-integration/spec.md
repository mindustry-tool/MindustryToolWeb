# discord-bot-integration Specification

## Purpose

Defines requirements for Discord Bot integration with the Backend, including real-time room status consumption via Server-Sent Events (SSE), authenticated HTTP POST uploads, and interactive user-initiated upload flows via Discord embed buttons.
## Requirements
### Requirement: Discord Bot Consumes Backend SSE Stream
The Discord Bot MUST receive real-time game room and server state updates by consuming an authenticated Server-Sent Events (SSE) stream provided by the Backend.

#### Scenario: Real-time room updates
- **WHEN** the backend broadcasts game server room data via SSE
- **THEN** the Discord Bot receives the event and updates its presence and designated Discord channel

#### Scenario: Backend SSE stream connection drops
- **WHEN** the SSE connection is interrupted (network failure, backend restart)
- **THEN** the Discord Bot MUST automatically reconnect using exponential backoff without crashing

#### Scenario: Malformed SSE payload resilience
- **WHEN** an invalid or unrecognized SSE payload is received
- **THEN** the Discord Bot logs the error and maintains the active connection for subsequent events

---

### Requirement: Discord Bot Direct HTTP Uploads
The Discord Bot MUST submit user file uploads to the Backend via direct authenticated HTTP POST requests, handling error states gracefully.

#### Scenario: Successful upload
- **WHEN** a user uploads a schematic or map via Discord
- **THEN** the bot sends an authenticated HTTP POST request to the backend and informs the user upon 200 OK success

#### Scenario: Backend unreachable or timed out
- **WHEN** the upload request fails due to connection timeout or network refusal
- **THEN** the Discord Bot catches the error and responds: "The backend service is currently unreachable. Please try again later."

#### Scenario: Backend validation rejection
- **WHEN** the backend rejects a file with a 400 Bad Request or 413 Payload Too Large
- **THEN** the Discord Bot parses the response and sends an explanatory error message to the user

---

### Requirement: Interactive Upload Button on Embed Previews
The Discord Bot SHALL display an "Upload to Mindustry Tool" button below content preview embeds when the posting user has a linked account.

#### Scenario: Linked user posts schematic or map
- **WHEN** a user with a linked Mindustry Tool account posts a schematic or map
- **THEN** the embed response includes an "Upload to Mindustry Tool" button in an action row

#### Scenario: Unlinked user posts content
- **WHEN** a user without a linked account posts content
- **THEN** the embed response does NOT include an upload button and displays an unlinked account notice

#### Scenario: No automatic upload on post
- **WHEN** a content embed is generated for a linked user
- **THEN** the system does not automatically upload the item; upload requires an explicit button click

---

### Requirement: Pending Upload State Cache
The system SHALL store pending upload data in memory with a 1-hour time-to-live (TTL).

#### Scenario: State creation on embed generation
- **WHEN** an embed with an upload button is generated
- **THEN** the upload payload (base64 data, fileType, userId, original poster Discord ID) is stored in-memory keyed by a unique button identifier

#### Scenario: State expiration after TTL
- **WHEN** 1 hour elapses without button interaction
- **THEN** the pending upload entry is pruned from the store

---

### Requirement: Upload Button Click Handling
The system SHALL execute the upload via authenticated HTTP POST to the backend API when clicked by the original poster.

#### Scenario: Original poster triggers upload
- **WHEN** the original poster clicks the upload button
- **THEN** the bot submits the stored payload to the backend API via HTTP POST, transitions the button to disabled with label "Uploaded ✓", and updates the embed description to reflect the uploader name

#### Scenario: Non-author clicks upload button
- **WHEN** a user other than the original poster clicks the upload button
- **THEN** the system responds with an ephemeral message: "Only the original poster can upload this content" and leaves the button active

#### Scenario: Click after state expiration
- **WHEN** a user clicks the upload button after the 1-hour TTL has expired
- **THEN** the system responds with an ephemeral message indicating the upload has expired and requesting re-posting

#### Scenario: Click on already uploaded content
- **WHEN** a user clicks the upload button for content that was already uploaded
- **THEN** the system responds with an ephemeral message: "This content has already been uploaded"

### Requirement: Honeypot check precedes preview handling
The system SHALL evaluate the honeypot trip before existing schematic/map preview, player-connect link, and burst-spam handling in `AppUpdate.onMessageCreate`, so a tripped user never triggers content embeds.

#### Scenario: Honeypot message skips preview
- **WHEN** a user posts a schematic base64 payload in the honeypot channel
- **THEN** the system runs honeypot enforcement and does not generate a schematic embed

#### Scenario: Non-honeypot preview unaffected
- **WHEN** a user posts a schematic in a normal channel
- **THEN** the system generates previews as before and retains tracking for honeypot purposes

