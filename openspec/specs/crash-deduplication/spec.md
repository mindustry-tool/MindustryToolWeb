# crash-deduplication Specification

## Purpose

Define cross-platform crash fingerprinting, stack frame and message normalization, mod scoping, and fallback attribution for Mindustry crash reports. Created by archiving change `improve-crash-dedupe`.

## Requirements

### Requirement: Cross-platform crash fingerprinting
The system SHALL compute identical fingerprints for crash reports sharing the same root cause exception, normalized error signature, and stack frames, regardless of whether the crash occurred on Desktop (Hotspot JVM) or Android (ART).

#### Scenario: Matching NoSuchMethodError across Windows and Android
- **WHEN** a crash report from Android and a crash report from Windows contain the same missing method error (e.g. `ModsDialog.githubImportMod`)
- **THEN** both crash reports produce the identical SHA-256 fingerprint hash

#### Scenario: Stripping Android APK and filesystem paths
- **WHEN** an Android crash message contains dynamic install paths (e.g., `/data/app/~~.../base.apk`)
- **THEN** dynamic path substrings are stripped during message normalization before fingerprinting

### Requirement: Synthetic and desugared lambda frame normalization
The system SHALL filter out compiler-specific synthetic frames and normalize lambda method names across platforms.

#### Scenario: Dropping D8 and R8 synthetic lambda classes
- **WHEN** a stacktrace contains frames such as `$$ExternalSyntheticLambda` or `$r8$lambda$`
- **THEN** those synthetic frames are excluded from user frame selection

#### Scenario: Normalizing lambda index suffixes
- **WHEN** a stacktrace contains a desugared lambda method such as `lambda$new$2$mindustrytool-services-UpdateAvailableDialog` or `lambda$new$2`
- **THEN** the method is normalized to `lambda$new`

### Requirement: Mod-scoped fingerprinting and engine frame fallback
The system SHALL include the mod identifier in fingerprint generation and provide fallback to engine frames when no mod frames are present.

#### Scenario: Isolating reports across different mods
- **WHEN** two different mods produce an identical runtime exception message with no custom frames
- **THEN** their computed fingerprints remain distinct because `modId` is included in the hash input

#### Scenario: Preserving engine frames for vanilla crashes
- **WHEN** a crash report contains no third-party mod stack frames
- **THEN** the system retains the top normalized `arc.*` and `mindustry.*` frames rather than generating an empty frame list

### Requirement: Solim package fallback detection
The system SHALL attribute crash reports to the `solim` mod when no mod header is detected but the stacktrace contains the `solim.` package prefix.

#### Scenario: Identifying Solim crash without mod banner
- **WHEN** a crash report does not contain a standard Mindustry mod header banner, but its stacktrace contains references to the `solim.` package
- **THEN** the crash report is attributed to `mod: "solim"` and `modName: "Solim"` instead of `no-mod-detected`

### Requirement: Bounded-time crash normalization
The system SHALL normalize stack frames and crash messages in time bounded by input length, such that no caller-supplied crash report can cause normalization to run unboundedly or stall the API event loop. Normalization regexes SHALL NOT contain nested quantifiers or ambiguous repeated alternations.

#### Scenario: Long nested-class frame normalizes quickly
- **WHEN** a crash report contains a stack frame whose class segment holds a long run of word characters after a `$` separator, followed by a character outside that run
- **THEN** frame normalization completes within the regression time budget rather than backtracking exponentially

#### Scenario: Long path-like message segment normalizes quickly
- **WHEN** a crash message contains a long run of path segments
- **THEN** message normalization strips the path to its trailing filename within the regression time budget rather than degrading quadratically

#### Scenario: Untrusted report cannot stall the event loop
- **WHEN** an unauthenticated caller submits a crash report engineered to maximize backtracking against frame normalization
- **THEN** the report is processed and the API continues serving concurrent requests without event-loop starvation

### Requirement: Normalization pattern regression guard
The system SHALL verify at build time that every regular expression in the crash normalization module is free of catastrophic backtracking, so a newly added unsafe pattern cannot be introduced silently.

#### Scenario: Unsafe pattern added to crash normalization
- **WHEN** a regular expression exhibiting nested quantifiers or ambiguous repeated alternation is added to the crash normalization module
- **THEN** the regression guard fails the build

#### Scenario: Existing safe patterns remain accepted
- **WHEN** the crash normalization module contains only linear-time regular expressions
- **THEN** the regression guard passes and fingerprinting behaviour is unchanged
