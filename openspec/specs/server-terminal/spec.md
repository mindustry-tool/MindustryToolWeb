# server-terminal Specification

## Purpose

Defines requirements for the interactive server console terminal, including command input, shell-like history cycling, auto-completion, parameter signature hints compliant with Mindustry's CommandHandler, contextual parameter suggestion, and command/chat message submission.

## Requirements

### Requirement: Command Input and History Cycling
The terminal input SHALL support shell-like command history cycling using the keyboard within the input field.

#### Scenario: Navigating back into command history
- **WHEN** the input field is focused, suggestions are closed or inactive, and the user presses ArrowUp
- **THEN** the input text SHALL be replaced with the previous command from history, and the text cursor SHALL be placed at the end of the text

#### Scenario: Navigating forward into command history
- **WHEN** the user is viewing a historical command and presses ArrowDown
- **THEN** the input text SHALL advance to the next newer command in history, or restore the unsubmitted draft if at the latest entry

#### Scenario: Command submission persists to history
- **WHEN** the user submits a command
- **THEN** the command SHALL be prepended to the local storage command history, consecutive duplicate commands SHALL be ignored, and the history index SHALL reset

#### Scenario: History dropdown toggle
- **WHEN** the user clicks the history button or triggers history view
- **THEN** a list of recent command histories SHALL appear, allow keyboard ArrowUp/ArrowDown navigation and Enter/click selection, and close when Escape is pressed

---

### Requirement: Command Auto-Completion and Tab Completion
The terminal input SHALL provide auto-completion for server commands with Tab key support.

#### Scenario: Triggering command suggestions
- **WHEN** the user types `/` followed by characters matching server commands
- **THEN** the system SHALL display a list of matching commands sorted by relevance

#### Scenario: Auto-completing command with Tab key
- **WHEN** command suggestions are displayed and the user presses the `Tab` key
- **THEN** the system SHALL auto-complete the active or top-matching command into the input followed by a space, prevent default tab navigation, and keep input focus

#### Scenario: Accepting command with Enter key
- **WHEN** a command suggestion is highlighted and the user presses `Enter`
- **THEN** the system SHALL complete the command into the input with a trailing space without submitting the form

---

### Requirement: Keyboard Navigation Within Suggestions
The terminal input SHALL provide seamless keyboard navigation for suggestions while keeping focus strictly in the input textarea.

#### Scenario: Cycling suggestions with Arrow keys
- **WHEN** suggestion dropdown is open and the user presses ArrowDown or ArrowUp
- **THEN** the highlighted suggestion index SHALL update cyclically, the highlighted element SHALL scroll into view, and the textarea SHALL retain browser focus

#### Scenario: Dismissing suggestions with Escape
- **WHEN** suggestion dropdown is open and the user presses `Escape`
- **THEN** the suggestion dropdown SHALL close and the textarea SHALL remain focused

---

### Requirement: Parameter Hints and Mindustry CommandHandler Compliance
The terminal input SHALL display parameter signature hints and validate arguments adhering to Mindustry's `arc.util.CommandHandler` specification.

#### Scenario: Displaying parameter signature and active parameter
- **WHEN** the user has entered a valid command name followed by a space
- **THEN** the system SHALL display the parameter signature showing mandatory parameters as `<param>`, optional parameters as `[param]`, and variadic parameters with trailing `...`, highlighting the parameter matching the current cursor position

#### Scenario: Handling variadic parameters
- **WHEN** the user enters arguments for a command with a variadic parameter
- **THEN** all remaining text from the start of the variadic parameter SHALL be treated as belonging to that parameter without incrementing the argument count on subsequent spaces

#### Scenario: Command argument validation indicators
- **WHEN** arguments are entered for a command
- **THEN** the system SHALL indicate whether the syntax is valid, missing mandatory arguments (`fewArguments`), or exceeding allowed arguments (`manyArguments`)

---

### Requirement: Contextual Parameter Auto-Completion
The terminal input SHALL provide contextual suggestions based on parameter name and type.

#### Scenario: Auto-completing player parameters
- **WHEN** the active parameter corresponds to a player (`player`, `user`, `target`)
- **THEN** the system SHALL suggest online and recent player names/UUIDs fetched from the server

#### Scenario: Auto-completing map parameters
- **WHEN** the active parameter corresponds to a map (`map`)
- **THEN** the system SHALL suggest installed server maps fetched from the server

#### Scenario: Auto-completing command parameters
- **WHEN** the active parameter corresponds to a command name (e.g. `/help [command]`)
- **THEN** the system SHALL suggest registered server commands

#### Scenario: Auto-completing enumeration parameters
- **WHEN** the active parameter corresponds to gamemodes, teams, or booleans
- **THEN** the system SHALL suggest valid enum values (e.g. `survival`, `attack`, `pvp`, `sandbox`, `editor` or `on`, `off`, `true`, `false`)

#### Scenario: Replacing active argument token
- **WHEN** the user accepts a parameter suggestion via `Tab`, `Enter`, or click
- **THEN** the argument token at the current cursor position SHALL be replaced with the selected value, followed by a space, and the cursor positioned after the space

---

### Requirement: Command Submission
The terminal input SHALL properly submit commands and chat messages to the server.

#### Scenario: Submitting server command
- **WHEN** the user presses `Enter` (without Shift) and no suggestion is being actively accepted
- **THEN** the form SHALL submit, strip the leading `/` for slash commands, invoke the server command API, and clear the input upon success

#### Scenario: Submitting chat message
- **WHEN** the user enters text not starting with `/` and presses `Enter`
- **THEN** the message SHALL be formatted with the user's name and dispatched to the server
