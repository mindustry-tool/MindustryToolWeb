# image-proxy-resilience Specification

## Purpose
Resilience, timeout enforcement, resource management, and optimized caching for image proxy and thumbnail transformations.

## Requirements

### Requirement: Storage Operation Timeout Enforcement
The system SHALL enforce a maximum timeout of 30 seconds on all S3 storage client operations, including `statObject`, `getObject`, and `putObject`. If an operation does not complete within 30 seconds, it SHALL be aborted and reject with a timeout error.

#### Scenario: S3 operation exceeds timeout threshold
- **WHEN** an S3 call takes longer than 30 seconds to respond
- **THEN** the system aborts the operation and returns a 504 Gateway Timeout or 503 Service Unavailable without hanging the HTTP connection

#### Scenario: S3 operation completes within timeout
- **WHEN** an S3 call completes in under 30 seconds
- **THEN** the operation succeeds normally and the timeout timer is cleared

### Requirement: Direct-Buffer Single-PUT Caching
When generating a new transformed image, the system SHALL render the result to an in-memory `Buffer` and upload it to the cache bucket using a single standard S3 PUT operation with an explicit byte length. It SHALL NOT perform multipart uploads with undefined size for generated thumbnails.

#### Scenario: New image transform generated and cached
- **WHEN** a client requests an image transform that is not currently cached
- **THEN** the image is transformed to a Buffer, saved to S3 cache with exact `buffer.length`, and returned to the client

#### Scenario: Image without transformation requested
- **WHEN** a client requests an image that requires no transformation and is already stored in S3
- **THEN** the system streams the image directly from S3 to the client response without buffering into memory

### Requirement: In-Flight Image Request Coalescing
The system SHALL deduplicate concurrent in-flight requests for the exact same transformed image. If a request arrives for an image/transform that is currently being processed, the subsequent request SHALL await and share the result of the active task.

#### Scenario: Multiple concurrent requests for the same uncached image
- **WHEN** two or more requests arrive simultaneously for the same cache key before the first request finishes
- **THEN** only one transform and one S3 cache upload is executed, and all concurrent callers receive the same output

#### Scenario: Request completes or fails
- **WHEN** the in-flight transform finishes (either successfully or with an error)
- **THEN** the cache key is immediately removed from the in-flight map so future requests do not reuse stale or failed promises

### Requirement: Early Client Disconnect Abort
The system SHALL detect if the client HTTP connection is closed before the image processing is finished and stop further redundant streaming.

#### Scenario: Client disconnects during image fetch or transform
- **WHEN** the client terminates the HTTP connection before headers are sent or while streaming
- **THEN** downstream streams are destroyed and remaining processing is aborted to conserve system resources

### Requirement: Preview Image Generation Fallback on 400 Bad Request
When requesting a schematic or map preview image via the GET image route, if the underlying content parser rejects image generation with HTTP status 400 (Bad Request), the system SHALL default to the bundled `nomap.png` fallback image and persist this image in object storage under the item ID.

#### Scenario: Schematic preview generation fails with 400 Bad Request
- **WHEN** a client requests `GET /api/v4/schematics/:id/image` and the content parser returns status 400
- **THEN** the system catches the 400 error, serves the bundled `nomap.png` image with HTTP 200, and saves it into the schematics object storage bucket under `:id`

#### Scenario: Map preview generation fails with 400 Bad Request
- **WHEN** a client requests `GET /api/v4/maps/:id/image` and the content parser returns status 400
- **THEN** the system catches the 400 error, serves the bundled `nomap.png` image with HTTP 200, and saves it into the maps object storage bucket under `:id`

#### Scenario: Non-400 parser errors during image preview generation
- **WHEN** preview generation fails due to a status other than 400 (e.g. 500 Internal Server Error, 504 Timeout)
- **THEN** the system does not substitute the fallback image, rethrows the error, and does not save the fallback into object storage

### Requirement: Transform Concurrency Queue
The system SHALL process image transformation jobs through a serialized queue with a maximum concurrency of 1. If multiple image transform requests arrive simultaneously, they SHALL wait in the queue and execute one at a time.

#### Scenario: Multiple concurrent transform requests arrive
- **WHEN** multiple image requests requiring Sharp transformation arrive concurrently
- **THEN** only one image transformation is actively processed at a time, while remaining transforms wait in the queue without consuming CPU cycles for rendering

#### Scenario: In-flight deduplication across queued transforms
- **WHEN** multiple requests arrive for the exact same image transform key
- **THEN** only one transform job enters the queue, and all callers await and share the result of that single job

### Requirement: Container-Safe Sharp Thread Configuration
The system SHALL configure Sharp's libvips thread pool concurrency to 1 and disable Sharp's in-memory cache to prevent CPU starvation and excessive memory allocation within single-core and memory-constrained containers.

#### Scenario: Server initializes image proxy service
- **WHEN** the backend application initializes the image proxy module
- **THEN** `sharp.concurrency(1)` is set globally and `sharp.cache(false)` is applied

### Requirement: Default WebP Format for Preview Images
When a client requests an image using the preview variant (`?variant=preview`) without specifying an explicit format, the system SHALL default the transformation format to `'webp'`.

#### Scenario: Client requests preview variant without format query
- **WHEN** a client issues `GET /api/v4/schematics/:id/image.png?variant=preview` or `GET /api/v4/maps/:id/image.png?variant=preview`
- **THEN** the request query is transformed to width=384, height=384, and format='webp'
- **THEN** the response is encoded as WebP with `Content-Type: image/webp`

#### Scenario: Client explicitly requests alternate format for preview
- **WHEN** a client issues a request with `?variant=preview&format=png`
- **THEN** the system respects the explicit format and transforms the output as PNG

### Requirement: Fast-Path Cache Resolution for Explicit Formats
When an image transform request provides an explicit format (or default format like WebP for previews), the system SHALL check the image cache bucket directly using the computed cache key BEFORE querying object storage for the original image or metadata.

#### Scenario: Cached thumbnail requested with explicit or default format
- **WHEN** a request arrives for a transformed image whose cache key already exists in the cache bucket
- **THEN** the system streams the cached object directly to the client without fetching, stat-ing, or buffering the original source image

#### Scenario: Cache miss for explicit format
- **WHEN** a request arrives for a transformed image and the cache key is not found in the cache bucket
- **THEN** the system proceeds to fetch the original image, executes the queued transformation, and stores the result in the cache bucket

### Requirement: Client Lazy-Loading for Preview Images
Frontend preview card images in listings and grids SHALL NOT set preloading priority flags (`priority` or `fetchPriority='high'`), allowing the browser to lazy-load preview images as they enter the viewport.

#### Scenario: User navigates to schematics or maps catalog
- **WHEN** the catalog page loads with a grid of preview cards
- **THEN** preview images are requested only as cards enter or approach the browser viewport, preventing a thundering herd of simultaneous image requests
