# media-upload Specification

## Purpose

Magic-byte image upload validation with guaranteed image-extension URLs, served through the API proxy. Created by archiving change fix-image-upload-extension.

## Requirements

### Requirement: Magic-byte upload type detection
The system SHALL determine the uploaded image type exclusively from buffer magic bytes (image content sniffing), and SHALL NOT use the client filename or client MIME type for the type decision.

#### Scenario: Garbage filename with valid JPEG bytes
- **WHEN** a client uploads JPEG bytes with filename `image:1000103380`
- **THEN** the system detects `jpeg` from the bytes and proceeds as JPEG.

#### Scenario: Spoofed MIME type
- **WHEN** a client uploads PNG bytes labeled `image/jpeg`
- **THEN** the system detects `png` from the bytes and proceeds as PNG.

### Requirement: Whitelisted image types only
The system SHALL accept only sniffed types `png`, `jpg`/`jpeg`, and `webp` for media uploads, and SHALL reject any other detected or undetectable type with HTTP 400 before writing to storage.

#### Scenario: GIF upload rejected
- **WHEN** a client uploads GIF bytes
- **THEN** the system responds with HTTP 400 and writes no object to MinIO and no row to the database.

#### Scenario: Undetectable bytes rejected
- **WHEN** a client uploads bytes that content sniffing cannot identify as png/jpeg/webp
- **THEN** the system responds with HTTP 400 and writes nothing.

### Requirement: Extension normalization and URL suffix
The system SHALL normalize detected `jpeg` to storage extension `jpg` (keeping `png` and `webp` as-is) so every returned upload URL ends with `.png`, `.jpg`, or `.webp`.

#### Scenario: JPEG bytes yield .jpg URL
- **WHEN** a client uploads JPEG bytes under any filename
- **THEN** the returned URL ends with `.jpg` and the stored key ends with `.jpg`.

#### Scenario: PNG and WebP suffixes preserved
- **WHEN** a client uploads PNG or WebP bytes
- **THEN** the returned URL ends with `.png` or `.webp` respectively.

### Requirement: Sanitized storage key shape
The system SHALL store uploads as `media/<uuidv7>/<sanitized-stem>.<ext>` where the stem is derived from the client filename by replacing runs of `[^a-zA-Z0-9-_]` with `_`, trimming, truncating to 64 characters, and falling back to `image` when empty.

#### Scenario: Colon filename sanitized
- **WHEN** a client uploads with filename `image:1000103380`
- **THEN** the stored key matches `media/<uuid>/image_1000103380.<ext>` and the returned URL contains that key.

#### Scenario: Empty stem fallback
- **WHEN** a client uploads with a filename that sanitizes to empty
- **THEN** the stem `image` is used.

### Requirement: Stored content-type metadata
The system SHALL store `Content-Type`, `X-Amz-Meta-Content-Type`, `X-Amz-Meta-Mime-Type`, and `X-Amz-Meta-Format` alongside every uploaded object, and SHALL serve proxied reads with the stored content type.

#### Scenario: JPEG served as image/jpeg
- **WHEN** a client fetches a stored JPEG upload via `/static/media/<uuid>/<stem>.jpg`
- **THEN** the response `Content-Type` is `image/jpeg`.

### Requirement: Proxied reads with hidden MinIO
The system SHALL serve all `/static/:bucket/*path` reads through the API proxy with Cloudflare caching, SHALL accept both `.jpg` and `.jpeg` spellings on read by mapping them to the same image format, and SHALL NOT require MinIO to be publicly reachable.

#### Scenario: jpg alias resolves
- **WHEN** a client requests an object stored as `.jpeg` via its `.jpg` alias path (or vice versa per canonical mapping)
- **THEN** the image is served with the correct content type instead of 404.

#### Scenario: MinIO not directly addressable
- **WHEN** MinIO's native port is firewalled to backend-only and a client requests `/static/media/<uuid>/<stem>.jpg`
- **THEN** the image is still served via the API + Cloudflare origin.
