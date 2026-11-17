# backend-runtime Specification

## Purpose

Defines requirements for core backend runtime infrastructure, including in-memory sliding window rate limiting and expired bucket sweeping, direct sequential batch processing with periodic recovery, and Node.js event loop lag observability via Prometheus metrics.
## Requirements
### Requirement: In-Memory Rate Limiting and Efficient Sweeping
The backend SHALL enforce request rate limits in memory and perform efficient periodic bucket cleanup to prevent CPU and memory overhead. Limits SHALL be enforced at three tiers: a per-route tier declared by an individual route, a per-IP action tier applied to routes carrying an action, and a per-IP global tier applied to all remaining routes. The per-route tier SHALL be keyed by the route template rather than the concrete request path, so that requests differing only by substituted path parameters share a single bucket; that key SHALL be constructed so that no two distinct method, route template, and client address combinations can collide onto a shared bucket. Tripping a per-route limit SHALL throttle the client with a 429 response but SHALL NOT arm the escalation strike counter; only the action and global tiers SHALL escalate toward a temporary IP block. A recorded strike SHALL remain resident until the escalation decision can no longer be made against it, so that periodic sweeping cannot remove a strike before a client tripping a limit again within the strike interval is escalated. Window evaluation for an incoming request SHALL read the clock once and SHALL remove expired entries without repeated front-removal of the underlying array.

#### Scenario: Rate limits are enforced
- **WHEN** a client exceeds the allowed request threshold within a window
- **THEN** the system rejects excessive requests with a 429 Too Many Requests response

#### Scenario: Optimized bucket cleanup
- **WHEN** rate-limit sweeping executes
- **THEN** the cleanup skips keys whose oldest entry is still within the window, and removes expired entries using single-pass in-place array mutation rather than allocating intermediate arrays

#### Scenario: Per-route limits share one bucket across path parameters
- **WHEN** a route declares a per-route limit and a client sends requests that differ only in substituted path parameters, such as `GET /maps/aaaa/image.png` and `GET /maps/bbbb/image.png`
- **THEN** both requests are counted against the same per-route bucket for that client, and exceeding the declared limit yields a 429 response

#### Scenario: Distinct routes do not share a bucket by key collision
- **WHEN** two different routes and two different client addresses would concatenate to the same per-route key under naive concatenation
- **THEN** the requests are counted against separate buckets, and neither route's limit is affected by the other's traffic

#### Scenario: Per-route throttling does not escalate to an IP block
- **WHEN** a client repeatedly exceeds a per-route limit
- **THEN** the system returns 429 Too Many Requests for those requests and does not record a strike against the client's escalation counter

#### Scenario: Escalation remains available for global and action tiers
- **WHEN** a client exceeds the global or action tier and continues exceeding it beyond the strike interval
- **THEN** the system records the client in the temporary block list and subsequent requests from that client are rejected before reaching the route handler

#### Scenario: Strike survives periodic sweeping until escalation is possible
- **WHEN** a strike has been recorded and periodic rate-limit sweeping executes repeatedly before the strike interval has elapsed
- **THEN** the strike remains in memory, and a subsequent trip on the global or action tier within that interval escalates the client to the temporary block list

#### Scenario: Blocked clients are rejected before route handling
- **WHEN** a client is present in the temporary block list
- **THEN** its requests are rejected with a 418 response without invoking the route handler

#### Scenario: Expired strike counters are swept
- **WHEN** rate-limit sweeping executes and a client's recorded strike can no longer lead to escalation
- **THEN** the strike entry for that client is removed from memory so the map does not grow without bound

#### Scenario: Buckets are swept against their own declared window
- **WHEN** a per-route bucket was created with a window longer than the default sweeping interval, and rate-limit sweeping executes
- **THEN** entries in that bucket are retained until their own window has elapsed, rather than being discarded at the default interval

#### Scenario: SSE routes are exempt from rate limiting
- **WHEN** a client opens a Server-Sent Events stream on the chat, notification, or player-connect stream endpoint
- **THEN** the request is not counted against any rate-limit bucket, and the number of concurrent streams a single client may hold is not constrained by this requirement

#### Scenario: Endpoints declared outside the route handler are exempt
- **WHEN** a client calls an endpoint declared with a raw NestJS HTTP decorator instead of through the route handler
- **THEN** the request is not counted against any rate-limit bucket, and this is a recorded exemption rather than an enforced limit

### Requirement: Sequential In-Memory Batch Processing
The backend MUST process GitHub repository imports sequentially within application memory and recover stalled jobs periodically.

#### Scenario: Processing import batches
- **WHEN** a repository import is triggered and files are extracted
- **THEN** the system processes extracted files sequentially within the background process, updating the `GitHubUpload` record upon completion

#### Scenario: Periodic recovery of stalled batches
- **WHEN** uploads remain stuck in a pending state due to an unexpected process restart
- **THEN** a background job running every 10 minutes retrieves pending jobs and resumes processing

#### Scenario: Per-item failure isolation
- **WHEN** an individual item fails processing within a batch
- **THEN** the system logs the error, increments the fail counter, broadcasts a failure event over SSE, and safely continues processing the remaining items in the batch

---

### Requirement: Event Loop Lag Observability
The system SHALL monitor Node.js event loop delay using `perf_hooks` and expose delay metrics to Prometheus.

#### Scenario: Event loop gauge registration and sampling
- **WHEN** the Prometheus service initializes
- **THEN** a `perf_hooks.monitorEventLoopDelay` histogram is created, and the `event_loop_lag_milliseconds` gauge is registered

#### Scenario: Metrics scraping
- **WHEN** Prometheus scrapes the `/metrics` endpoint
- **THEN** the response includes `event_loop_lag_milliseconds` with `quantile` labels for `p50`, `p95`, and `p99`

### Requirement: HTTP Request Latency Tracking Excludes SSE Streams
The backend route interceptor SHALL track HTTP request latency percentiles in Prometheus `responseTimeHistogram` for standard JSON and file responses, but SHALL exclude Server-Sent Events (SSE) connections from histogram observations to prevent long-lived connection lifetimes from distorting HTTP response latency metrics.

#### Scenario: Standard request latency observed
- **WHEN** an HTTP request to a standard route completes
- **THEN** its duration is observed in `responseTimeHistogram` and the request counter is incremented

#### Scenario: SSE stream latency excluded
- **WHEN** a Server-Sent Events connection closes
- **THEN** its total lifetime is not observed in `responseTimeHistogram`, while request count metrics are updated

