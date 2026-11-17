# content-parser-resilience Specification

## Purpose
Defines timeout enforcement and resilience requirements for Content Parser client calls across Web Frontend, Backend, and Discord Bot.

## Requirements

### Requirement: Extended Timeout for Content Parser Requests
The Backend and Discord Bot clients MUST allow up to 180,000 milliseconds (3 minutes) for Content Parser image generation and preview operations before timing out.

#### Scenario: Long-running image render completes within timeout
- **WHEN** a schematic or map render requires up to 120 seconds in Content Parser
- **THEN** the client connection remains open and receives the completed image buffer without an AbortError or timeout exception

#### Scenario: Render exceeds extended timeout
- **WHEN** Content Parser takes longer than 180,000 milliseconds to respond
- **THEN** the client aborts the request and throws a timeout error

### Requirement: Backend Service Content Parser Calls
Backend `SchematicService` and `MapService` operations (including `preview`, `image`, `generateImage`, `upload`, and `uploadByUser`) MUST use an explicit timeout of at least 180,000 milliseconds when communicating with the Content Parser API.

#### Scenario: Schematic or map upload with heavy preview generation
- **WHEN** a user uploads a large schematic or map requiring extended parsing
- **THEN** the backend waits up to 180,000 ms for preview metadata generation before timing out

#### Scenario: Uncached image proxy generation
- **WHEN** an uncached schematic or map preview image is requested via `getImage`
- **THEN** the image generation provider allows up to 180,000 ms for Content Parser to return the raw image buffer

### Requirement: Frontend Upload Mutation Timeout
The Web frontend upload dialogs for schematics and maps MUST configure their preview, image generation, and upload mutation requests with a timeout of at least 180,000 milliseconds.

#### Scenario: Frontend schematic upload preview and image fetch
- **WHEN** a user selects a complex `.msch` file or pastes base64 in the upload dialog
- **THEN** the preview and image generation requests do not abort at the default 15-second client timeout and wait up to 180,000 ms

#### Scenario: Frontend map upload preview and image fetch
- **WHEN** a user selects a complex `.msav` map file in the upload dialog
- **THEN** the map preview and image generation requests do not abort at the default 15-second client timeout and wait up to 180,000 ms
