# color-text Specification

## Purpose

Defines requirements for `parseColorText()`, parsing Mindustry bracket color tags, named color identifiers, hex codes, reset tokens, ANSI escape sequences, and preserving newlines and literal text.

## Requirements

### Requirement: Named Color Token Parsing
`parseColorText` SHALL treat bracketed tokens whose lowercased content matches a key in `COLORS` as valid color formatters.

#### Scenario: Named color token formatted
- **WHEN** `parseColorText("[red]hello")` is called
- **THEN** it returns text segments with visible text `hello` styled with `COLORS.red`, stripping `[red]` from visible output

#### Scenario: Unknown bracket tokens preserved
- **WHEN** `parseColorText("[VI]hello")` is called with a token not in `COLORS`
- **THEN** `[VI]` remains as literal visible text and is not stripped or styled

---

### Requirement: Mindustry UI Palette Token Parsing
`parseColorText` SHALL recognize Mindustry UI colors registered in Mindustry's UI palette (`accent`, `stat`, `highlight`, `unlaunched`, `negstat`) in UPPER and lowercase-noscore casing and style text accordingly.

#### Scenario: Accent tag formatted
- **WHEN** `parseColorText("[accent]hello")` is called
- **THEN** it returns text segments with visible text `hello` styled with color `#ffd37f`

#### Scenario: Mindustry UI colors formatted
- **WHEN** `parseColorText("[stat]A [highlight]B [unlaunched]C [negstat]D")` is called
- **THEN** it returns styled text segments matching the corresponding Mindustry UI colors (`stat`: `#ffd37f`, `highlight`: `#ffe0a5`, `unlaunched`: `#8982ed`, `negstat`: `#e55454`)

---

### Requirement: Hex Color Token Parsing
`parseColorText` SHALL parse bracketed tokens starting with `#` followed by valid hex characters as hex colors.

#### Scenario: Hex color token formatted
- **WHEN** `parseColorText("[#ff0000]hello")` is called
- **THEN** it returns segments with visible text `hello` styled with color `#ff0000`

#### Scenario: Short hex token padded
- **WHEN** `parseColorText("[#f00]hello")` is called
- **THEN** the resolved color is padded to a 6-digit hex value

---

### Requirement: Reset Token Recognition
`parseColorText` SHALL recognize the empty bracket token `[]` as the color reset syntax.

#### Scenario: Reset token clears formatting
- **WHEN** `parseColorText("[red]hello[]world")` is called
- **THEN** neither `[red]` nor `[]` appears in visible text, and `world` is rendered with default uncolored styling

---

### Requirement: ANSI Escape Code Parsing
`parseColorText` SHALL recognize ANSI escape sequences matching `\u001B[<codes>m` and format the subsequent text.

#### Scenario: ANSI sequence formatted
- **WHEN** `parseColorText("\u001B[31mhello")` is called
- **THEN** the escape sequence is stripped and `hello` carries the corresponding ANSI color format

---

### Requirement: Plain Text, Empty Input, and Newline Handling
`parseColorText` SHALL preserve newlines and handle unformatted or empty text cleanly.

#### Scenario: Plain text input
- **WHEN** `parseColorText("hello world")` is called
- **THEN** it returns a single segment with text `hello world` and empty formatting

#### Scenario: Empty or undefined input
- **WHEN** `parseColorText(undefined)` or `parseColorText("")` is called
- **THEN** it returns an empty array

#### Scenario: Newline preservation
- **WHEN** `parseColorText("line one\nline two")` is called
- **THEN** it returns separate segments for `line one`, `\n`, and `line two`
