## ADDED Requirements

### Requirement: Automated Circular Dependency Verification Script
The repository SHALL include a package script to run circular dependency detection via `dpdm` on both `packages/api` and `apps/frontend`.

#### Scenario: Running verification check
- **WHEN** `pnpm check:cycles` (or corresponding script) is executed in the workspace
- **THEN** the process scans module imports and exits with code 0 only if zero circular dependencies are detected.

### Requirement: CI Build Failure on Cycle Regression
Continuous integration checks SHALL fail if any change introduces a new circular dependency in `packages/api` or `apps/frontend`.

#### Scenario: Pull request with a circular dependency
- **WHEN** code containing a circular dependency is pushed to CI
- **THEN** the circular dependency validation step fails and halts the build pipeline.
