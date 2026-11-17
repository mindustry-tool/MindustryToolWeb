# distributed-cache Specification

## Purpose
TBD - created by archiving change redis-backed-cache. Update Purpose after archive.
## Requirements
### Requirement: Redis-Backed Global Cache
The backend SHALL route `@nestjs/cache-manager` operations through Redis instead of in-process Node.js memory.

#### Scenario: Global cache operations store in Redis
- **WHEN** a service writes a key to the cache using `cacheManager.set(key, value, ttl)`
- **THEN** the value is serialized and stored in Redis with the specified TTL in milliseconds

#### Scenario: Default TTL application
- **WHEN** a service writes a key to the cache without an explicit TTL
- **THEN** the cache applies a default TTL of 10 minutes (600,000 ms) in Redis

#### Scenario: Retrieving cached data
- **WHEN** a service calls `cacheManager.get(key)`
- **THEN** the value is fetched from Redis and returned, or `undefined`/`null` if not found or expired

#### Scenario: Eviction and memory management
- **WHEN** a cached entry expires past its TTL
- **THEN** Redis automatically purges the key via its background TTL expiration mechanism without consuming Node.js heap memory

