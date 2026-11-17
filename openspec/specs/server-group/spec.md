# server-group Specification

## Purpose

Defines requirements for Server Group management, including group CRUD, member server assignment, group-level administrators and environment variables, group webhooks with automatic event dispatching, configuration resolution/inheritance rules, multi-page routing, and presentation within server settings.

## Requirements

### Requirement: ServerGroup CRUD Operations
The system SHALL allow authenticated users to manage ServerGroups they own, including creation, listing, retrieval, updating, and deletion.

#### Scenario: Successful creation
- **WHEN** a user sends a POST request to `/api/v4/server-groups` with `{ name, description? }`
- **THEN** the system creates a new ServerGroup owned by that user and returns the group DTO

#### Scenario: Validation failure on creation
- **WHEN** a user sends a POST request to `/api/v4/server-groups` without a required `name`
- **THEN** the system returns a 400 validation error

#### Scenario: List owned groups
- **WHEN** a user sends a GET request to `/api/v4/server-groups`
- **THEN** the system returns an array of ServerGroup DTOs owned by that user (or an empty array if none exist)

#### Scenario: Retrieve single group details
- **WHEN** a group owner sends a GET request to `/api/v4/server-groups/:groupId`
- **THEN** the system returns the ServerGroup DTO including member server IDs

#### Scenario: Unauthorized group access
- **WHEN** a user who is not the group owner attempts to retrieve, update, or delete a group
- **THEN** the system rejects the request with a 403 Forbidden status

#### Scenario: Update group details
- **WHEN** the group owner sends a PUT request to `/api/v4/server-groups/:groupId` with `{ name, description? }`
- **THEN** the system updates the group and returns the updated DTO

#### Scenario: Delete group with server unassignment cascade
- **WHEN** the group owner sends a DELETE request to `/api/v4/server-groups/:groupId`
- **THEN** the system deletes the ServerGroup record and sets `groupId = null` on all member servers

---

### Requirement: Server Assignment Management
The system SHALL allow group owners to assign and unassign servers they own to/from a ServerGroup.

#### Scenario: Assign server to group
- **WHEN** the group owner sends a POST request to `/api/v4/server-groups/:groupId/servers` with `{ serverId }` for a server they own
- **THEN** the system sets the server's `groupId` to the target group and returns the updated server DTO

#### Scenario: Reassign server from another group
- **WHEN** the group owner assigns a server that already belongs to another group
- **THEN** the system reassigns the server to the new group

#### Scenario: Unauthorized server assignment
- **WHEN** a user attempts to assign a server they do not own
- **THEN** the system rejects the request with a 403 Forbidden status

#### Scenario: Unassign server from group
- **WHEN** the group owner sends a DELETE request to `/api/v4/server-groups/:groupId/servers/:serverId`
- **THEN** the system sets the server's `groupId` to null

#### Scenario: Unassign server not in group
- **WHEN** the group owner attempts to remove a server that belongs to a different group
- **THEN** the system returns a 400 Bad Request error

---

### Requirement: Group Administrator Management
The system SHALL allow group owners to configure administrative authorities at the group level.

#### Scenario: List group admins
- **WHEN** the group owner sends a GET request to `/api/v4/server-groups/:groupId/admins`
- **THEN** the system returns an array of group admin DTOs

#### Scenario: Upsert group admin
- **WHEN** the group owner sends a PUT request to `/api/v4/server-groups/:groupId/admins` with `{ userId, authorities }`
- **THEN** the system creates or updates the `GroupServerAdmin` record with the specified authorities

#### Scenario: Delete group admin
- **WHEN** the group owner sends a DELETE request to `/api/v4/server-groups/:groupId/admins/:adminId`
- **THEN** the system deletes the `GroupServerAdmin` record

---

### Requirement: Group Environment Variable Management
The system SHALL allow group owners to configure environment variables that apply to all member servers.

#### Scenario: List group envs
- **WHEN** the group owner sends a GET request to `/api/v4/server-groups/:groupId/envs`
- **THEN** the system returns an array of group environment variable DTOs

#### Scenario: Upsert group env
- **WHEN** the group owner sends a PUT request to `/api/v4/server-groups/:groupId/envs` with `{ name, value }`
- **THEN** the system creates or updates the `GroupServerEnv` record

#### Scenario: Delete group env
- **WHEN** the group owner sends a DELETE request to `/api/v4/server-groups/:groupId/envs/:envId`
- **THEN** the system deletes the `GroupServerEnv` record

---

### Requirement: Group Webhook Management and Dispatch
The system SHALL allow group owners to configure webhooks on a ServerGroup that trigger automatically on events emitted by member servers.

#### Scenario: Manage group webhooks
- **WHEN** the group owner creates, updates, or deletes a group webhook via `/api/v4/server-groups/:groupId/webhooks`
- **THEN** the system persists the change and invalidates the cached group webhooks for that group

#### Scenario: Interactive management dialog from group webhooks tab
- **WHEN** a user clicks or presses Enter on a group webhook card on the group management Webhooks tab
- **THEN** the system opens the update dialog allowing editing of url, event, data template, or deletion

#### Scenario: Member server event dispatches group webhooks
- **WHEN** a server assigned to a group emits a lifecycle or state event matching a group webhook's `event`
- **THEN** the system formats the payload using the server's context and POSTs the payload to the group webhook URL in addition to any server-level webhooks

#### Scenario: Resilient dispatch
- **WHEN** a group webhook HTTP delivery fails
- **THEN** the error is logged and dispatching continues for any remaining webhooks without interrupting the event pipeline

---

### Requirement: Server Configuration Resolution and Inheritance
The system SHALL merge group-level configurations into a member server's effective settings, with per-server settings taking precedence.

#### Scenario: Resolved admin inheritance
- **WHEN** querying resolved admins for a server belonging to a group
- **THEN** the system merges server-level and group-level admins; if a user has both, the per-server authorities override the group authorities

#### Scenario: Resolved env inheritance
- **WHEN** querying resolved environment variables for a server belonging to a group
- **THEN** the system merges server-level and group-level variables; matching names resolve to the per-server value

#### Scenario: Resolved config sent to manager
- **WHEN** hosting a server that belongs to a group with envs
- **THEN** the configuration sent to the server manager includes the merged group and per-server environment variables

---

### Requirement: Server Group Multi-Page Routing and Navigation
The system SHALL provide distinct sub-routes for each section of a server group and direct navigation links from server-level settings.

#### Scenario: Navigating group sub-routes
- **WHEN** a user navigates to `/servers/groups/[groupId]` or sub-routes (`/admins`, `/envs`, `/servers`, `/webhooks`)
- **THEN** the system renders the group layout with the corresponding active view (General, Admins, Envs, Servers, or Webhooks)

#### Scenario: Server settings displays group webhooks read-only
- **WHEN** a user views the Webhooks section in server settings for a server belonging to a group
- **THEN** the group's webhooks are rendered as read-only cards with a "Group" badge and event preview, resilient to fetch errors

#### Scenario: Clicking inherited group resource navigates to group page
- **WHEN** a user clicks an inherited group webhook card or group admin row on a server settings page
- **THEN** the system navigates directly to the corresponding group management sub-page (`/servers/groups/[groupId]/webhooks` or `/admins`) rather than opening an edit dialog