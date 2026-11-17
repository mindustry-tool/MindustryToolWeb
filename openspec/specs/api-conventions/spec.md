# api-conventions Specification

## Purpose

Defines application-wide API interaction conventions, including safe frontend exception handling via `apiInstance.tryRequest` returning `[data, error]` tuples, and backend architectural decoupling where route handler parameters remain internal to decorators and services declare explicit domain DTOs.
## Requirements
### Requirement: Frontend API Error Handling via tryRequest
Frontend API calls MUST use `apiInstance.tryRequest` to receive `[data, error]` tuples and prevent uncaught network or HTTP exceptions.

#### Scenario: Server Component API request failure
- **WHEN** a Next.js Server Component or page fetches data with `apiInstance.tryRequest` and `error` is non-null
- **THEN** the component handles the failure gracefully by rendering an error fallback or alternative state rather than throwing an unhandled exception

#### Scenario: Client-side event or dialog submission failure
- **WHEN** an interactive event handler executes `apiInstance.tryRequest` and receives a non-null `error`
- **THEN** the handler presents a user-friendly error notification/toast and prevents broken UI state

#### Scenario: TanStack Query queryFn or mutationFn integration
- **WHEN** `apiInstance.tryRequest` is invoked within a query or mutation function
- **THEN** if `error` is returned, the wrapper function throws `error` so TanStack Query error tracking and retry mechanisms react appropriately

---

### Requirement: Backend Route Handler Parameter Decoupling
HTTP handler parameter types SHALL remain internal to the route decorator, and backend services SHALL declare explicit domain parameters.

#### Scenario: Route decorator parameter types are not exported
- **WHEN** an external service or module imports types from `@/decorators/route.decorator`
- **THEN** handler parameter types (`HandlerParams`, `AuthHandlerParams`, `AuthSseHandlerParams`, `SseHandlerParams`) SHALL NOT be exported or imported across domain service boundaries

#### Scenario: Services declare explicit domain DTOs
- **WHEN** a controller delegates to a service method or unit tests invoke a service
- **THEN** the service accepts strongly typed domain parameters (DTOs, IDs, user context) without requiring Express Request or Response mock objects

#### Scenario: SSE services declare explicit streaming parameters
- **WHEN** an SSE controller endpoint receives a stream request
- **THEN** the controller unpacks the stream callback and parameters, passing explicit arguments into the target service

### Requirement: ApiInstance Unauthorized Notification Callback
`ApiInstance` SHALL notify registered unauthorized listeners whenever an HTTP 401 response is received.

#### Scenario: Request encounters 401 status
- **WHEN** `ApiInstance.request` or `ApiInstance.sse` receives an HTTP response with status code 401
- **THEN** it executes the registered `onUnauthorized` callbacks before throwing the `ApiError`

#### Scenario: tryRequest encounters 401 status
- **WHEN** `ApiInstance.tryRequest` delegates to `request` and encounters a 401 response
- **THEN** registered `onUnauthorized` callbacks are triggered and `tryRequest` returns `[null, error]`

---

### Requirement: ApiInstance Skip Response Schema Validation
`ApiInstance` SHALL support skipping runtime Zod schema parsing on response payloads via a `skipResponseValidation` configuration on both `ApiConfig` and `RequestConfig` while preserving static TypeScript return types. When `skipResponseValidation` is true on the instance configuration, requests SHALL bypass response validation unless explicitly overridden by request configuration.

#### Scenario: Instance-level validation bypass
- **WHEN** an `ApiInstance` is configured with `{ skipResponseValidation: true }` and executes a request without request-level override
- **THEN** the request returns the parsed JSON payload directly without executing `route.response.parse()`

#### Scenario: Request-level validation override
- **WHEN** an `ApiInstance` request specifies `{ skipResponseValidation: true }` in its request configuration
- **THEN** the request skips `route.response.parse()` even if the instance default was false

#### Scenario: Validation active when not bypassed
- **WHEN** neither instance nor request config sets `skipResponseValidation` to true and `route.response` is defined
- **THEN** `ApiInstance` parses the response payload through `route.response.parse()` as before

### Requirement: ApiInstance Empty Response Normalization
`ApiInstance` SHALL treat empty or whitespace-only response bodies as `null` rather than falling back to a raw empty string.

#### Scenario: Empty body with skipResponseValidation
- **WHEN** an HTTP request returns a 200 or 204 status with an empty or whitespace-only body and `skipResponseValidation` is enabled
- **THEN** `ApiInstance.request` returns `null` instead of throwing a `SyntaxError` or returning `""`

#### Scenario: Non-empty response parsing
- **WHEN** an HTTP request returns a non-empty response body
- **THEN** `ApiInstance.request` parses JSON or falls back to text as usual

### Requirement: ApiInstance Error Message Fallback
`ApiInstance` SHALL ensure `ApiError.message` is populated with a meaningful description, falling back to HTTP `statusText` or a default message when the error response body is empty or unparseable.

#### Scenario: HTTP error with empty body
- **WHEN** an HTTP request fails with a non-2xx status code and the response body is empty or whitespace-only
- **THEN** `ApiError.message` contains `response.statusText` (or `'Unknown error'` if `statusText` is empty) instead of `""` or `""`

#### Scenario: HTTP error with JSON message property
- **WHEN** an HTTP request fails with a JSON body containing a `message` string
- **THEN** `ApiError.message` contains that error message string

### Requirement: ApiInstance Cross-Origin Request Simplicity
`ApiInstance` SHALL NOT attach a custom `X-CLIENT-ID` header to requests, so that cross-origin API calls remain "simple requests" and do not trigger a CORS preflight.

#### Scenario: No preflight on GET
- **WHEN** the frontend issues a GET request to the API origin
- **THEN** no `OPTIONS` preflight request precedes it

#### Scenario: No preflight on POST with JSON body
- **WHEN** the frontend issues a POST request with a JSON body to the API origin
- **THEN** the request is preceded by at most the standard CORS preflight required by `Content-Type: application/json`, and no additional preflight is triggered by a custom header

### Requirement: ApiInstance Server-Sent Events Protocol Handling
`ApiInstance.sse` SHALL attach the `Accept: text/event-stream` header to stream connection handshakes, and SHALL ignore protocol and keepalive events (`comment`, `heartbeat`, and `ping`) without invoking response schema validation or `onNext` callbacks.

#### Scenario: Handshake includes event-stream accept header
- **WHEN** `ApiInstance.sse` opens a connection to an SSE endpoint
- **THEN** the request headers include `Accept: text/event-stream`

#### Scenario: Protocol comments and heartbeats ignored
- **WHEN** an incoming SSE event frame contains `event: comment`, `event: heartbeat`, or `event: ping`
- **THEN** `ApiInstance.sse` skips response schema validation and does not trigger `onNext` or `onError` callbacks

#### Scenario: Data events parsed and dispatched
- **WHEN** an incoming SSE event contains domain data
- **THEN** `ApiInstance.sse` validates the payload against `route.response` and forwards the typed data to `onNext`

