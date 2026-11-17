## ADDED Requirements

### Requirement: Independent Component Type Contracts
Component contracts, options, and prop interfaces that are shared between parent and child components SHALL reside in dedicated `.types.ts` contract files rather than inside the main component implementation file.

#### Scenario: Child component importing parent contract
- **WHEN** a child filter tag component requires the `FilterTag` or `SearchDialogProps` interface
- **THEN** it imports the type directly from the sibling `.types.ts` file without importing the parent component implementation.

### Requirement: Layer Separation Between Utils and Hooks
Utility modules in `apps/frontend/lib` SHALL NOT import React hooks or React-specific contexts, and shared query parameter logic SHALL be placed in a standalone pure utility module.

#### Scenario: Utility function execution
- **WHEN** `apps/frontend/lib/utils.ts` parses or serializes URL search parameters
- **THEN** it imports pure functions and interfaces from `apps/frontend/lib/query-params.ts` without referencing React hook modules.

### Requirement: Logic Editor Graph Decoupling
The logic editor in `apps/frontend/app/[locale]/tools/logic` SHALL isolate node contracts, action types, and store interfaces into separate modules so that individual node components and store implementations do not circularly reference each other.

#### Scenario: Logic node and store compilation
- **WHEN** the logic editor node catalog and Zustand store are imported
- **THEN** neither module creates a circular import chain back to the other or to `page.client.tsx`.

### Requirement: Zero Frontend Circular Dependencies
The `apps/frontend` codebase SHALL have zero circular dependency chains.

#### Scenario: Cycle detection on frontend codebase
- **WHEN** circular dependency scanning is executed across `apps/frontend`
- **THEN** zero circular dependency chains are found.
