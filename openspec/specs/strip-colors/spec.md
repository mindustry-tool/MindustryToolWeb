# strip-colors Specification

## Purpose

Java-parity color-tag stripping for shared strings, pinned to Arc `Strings.java`/`Colors.java` @ `8eb00ffff0126d0576c67df46f99b8f6bccd96fe`. Created by archiving change strip-colors-java-parity.

## Requirements

### Requirement: Named color parity with Arc and Mindustry UI
The system SHALL strip bracket tags whose names exist in the `COLORS` palette (including Arc colors and Mindustry UI colors `accent`, `stat`, `highlight`, `unlaunched`, `negstat` in UPPER and lowercase-noscore variants), and SHALL keep all other bracket contents literal.

#### Scenario: Lowercase and uppercase known names stripped
- **WHEN** the input is `[red]hi` or `[RED]hi` or `[LIGHT_GRAY]hi` or `[accent]hi` or `[ACCENT]hi`
- **THEN** the output is `hi`.

#### Scenario: Mixed-case unknown name kept
- **WHEN** the input is `[ReD]hi` or `[acCent]hi`
- **THEN** the output is the original string with tag literal.

#### Scenario: Unknown token kept
- **WHEN** the input is `[VI]hello` or `[nonexistent]hi`
- **THEN** the output is the original string with tag literal.

### Requirement: Hex color parity with Arc
The system SHALL strip `[#` plus 1–8 hex digits plus `]`, and SHALL keep hex-like tags with 0 or 9+ digits or non-hex characters literal.

#### Scenario: Six and eight digit hex stripped
- **WHEN** the input is `[#ff0000]hello` or `[#ffffffff]hello`
- **THEN** the output is `hello`.

#### Scenario: Nine digit and non-hex kept
- **WHEN** the input is `[#fffffffff]hello` or `[#zzz]hello`
- **THEN** the output keeps the tag literally.

### Requirement: Escape and pop tag semantics
The system SHALL strip the `[]` pop tag, SHALL reduce `[[red]` to `[`, and SHALL keep unclosed or unknown tags literal starting from the `[`.

#### Scenario: Pop tag stripped
- **WHEN** the input is `[red]hello[]world`
- **THEN** the output is `helloworld`.

#### Scenario: Escaped tag reduced
- **WHEN** the input is `[[red]`
- **THEN** the output is `[`.

#### Scenario: Unclosed tag kept
- **WHEN** the input is `[red`
- **THEN** the output is `[red`.

### Requirement: No whitespace trimming
The system SHALL NOT trim leading or trailing whitespace; spaces around stripped tags are preserved exactly as Java produces.

#### Scenario: Surrounding spaces preserved
- **WHEN** the input is `  [red]hi  `
- **THEN** the output is `  hi  `.

### Requirement: Sibling tokenizer alignment
`parseColorText` SHALL recognize the same named and hex token set as `stripColors` (same map, same `[]` reset semantics) while keeping its existing segment/ANSI behavior.

#### Scenario: Uppercase token recognized consistently
- **WHEN** the input is `[RED]hello`
- **THEN** both `stripColors` and `parseColorText` treat `[RED]` as a color token rather than literal text.

#### Scenario: Mixed-case token kept literal consistently
- **WHEN** the input is `[ReD]hello`
- **THEN** both `stripColors` and `parseColorText` keep it as literal text.
