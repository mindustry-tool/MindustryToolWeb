# media-deletion Specification

## Purpose
TBD - created by archiving change add-admin-media-deletion. Update Purpose after archive.
## Requirements
### Requirement: Administrative media deletion endpoint
The system SHALL provide an authenticated HTTP endpoint `DELETE /media/:id` accessible only to users possessing the `media:delete` authority or the `god` role.

#### Scenario: Authorized deletion succeeds
- **WHEN** an authenticated user with `media:delete` or `god` authority sends a DELETE request to `/media/:id` for an existing media item
- **THEN** the system removes the storage object from MinIO, deletes the database record from Prisma, logs an audit entry to the Action table, and responds with HTTP 200 or 204.

#### Scenario: Unauthorized deletion rejected
- **WHEN** an unauthenticated client or a user without `media:delete` or `god` authority attempts to delete a media item
- **THEN** the system rejects the request with HTTP 401 or 403 and leaves the storage and database records untouched.

#### Scenario: Non-existent media returns 404
- **WHEN** an authorized user attempts to delete a media item with an ID that does not exist
- **THEN** the system responds with HTTP 404.

### Requirement: Storage and database synchronization on deletion
The system SHALL delete the underlying image object from MinIO storage when a media record is deleted, ensuring no orphaned blobs remain.

#### Scenario: Storage object removed
- **WHEN** an existing media record with a valid MinIO URL is deleted
- **THEN** the object in bucket `media` matching the stem and format is removed from MinIO storage.

#### Scenario: Storage failure prevents database deletion
- **WHEN** MinIO encounters a fatal error during file deletion
- **THEN** the operation aborts and the database record is preserved so it can be retried.

### Requirement: Action audit logging
The system SHALL record an audit action in the `Action` table whenever a media image is deleted by an administrator.

#### Scenario: Audit log entry created
- **WHEN** a media record is successfully deleted by an administrator
- **THEN** an `Action` entry is created with name `media.delete`, `triggeredBy` set to the admin user ID, and metadata containing the deleted media ID, filename, URL, and original creator ID.

### Requirement: Frontend media deletion interface
The media management page SHALL render a delete action button on each media card and prompt the user for confirmation before sending the delete request.

#### Scenario: Confirmation dialog on delete trigger
- **WHEN** an admin clicks the delete button on a media card
- **THEN** an AlertDialog opens displaying the item identifier and requesting confirmation.

#### Scenario: Successful deletion updates the gallery
- **WHEN** the admin confirms deletion and the API request succeeds
- **THEN** a success toast is shown, and the media query cache is invalidated, removing the item from the grid.

#### Scenario: Deletion error feedback
- **WHEN** the deletion API request fails
- **THEN** an error toast is displayed describing the failure, and the item remains in the grid.

