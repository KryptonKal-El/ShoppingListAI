# Common Coding Guidelines

## Comments

- Do NOT over-comment. If the code is self-explanatory, leave it uncommented.
- Only add inline comments for esoteric or non-obvious logic that cannot be reasonably understood from the code alone.
- All exported functions and classes MUST have doc comments using JSDoc.

## Library Usage

When writing code that uses external libraries, use the `context7` MCP tool to look up current documentation before calling library APIs. Do not rely on training data for API signatures, method names, or parameter types. Look them up. This avoids hallucinating deprecated or nonexistent methods.

# JavaScript Coding Guidelines

These are defaults. If the project's existing code follows different conventions, match those instead.

## Language Features

- Use `const` by default. Use `let` only when reassignment is necessary. Never use `var`.
- Use `async`/`await` for asynchronous code. Avoid raw `.then()` chains and callbacks unless the API requires them.
- Use strict equality (`===` and `!==`). Never use `==` or `!=`.
- Use template literals over string concatenation: `` `Hello, ${name}` `` not `"Hello, " + name`.
- Use destructuring for object and array access where it improves clarity: `const { id, name } = user`.
- Use optional chaining (`?.`) instead of manual null checks.
- Use nullish coalescing (`??`) instead of `||` when the intent is to fall back only on `null`/`undefined`.
- Prefer modern ES module syntax (`import`/`export`).
- Prefer named exports over default exports.

## Naming

- Variables and functions: `camelCase`
- Classes: `PascalCase`
- Constants (module-level fixed values): `UPPER_SNAKE_CASE`
- Boolean variables: prefix with `is`, `has`, `should`, `can` when it aids readability

## Error Handling

- Always handle errors in async code.
- Never swallow promise rejections.
- Include context in error messages.
- When re-throwing, wrap the original error as the cause.

# React Coding Guidelines

## Components

- Use functional components with hooks. No class components.
- One component per file. Filename matches component name.
- PascalCase for component names.
- Destructure props in the function signature.

## State Management

- Manage state at the lowest level that needs it.
- `useState` for simple state, `useReducer` for complex state.
- Do not reach for global state when local state suffices.

## Custom Hooks

- Extract reusable logic into custom hooks with `use` prefix.

## Event Handlers

- Prefix handler functions with `handle` (e.g. `handleClick`).
- Prefix callback props with `on` (e.g. `onClick`).

## UI States

- Handle loading, error, and empty states explicitly.

## Styling

- Use CSS modules. Do not use inline styles.

# Project Memory

Use `docs/memory/` in the project root to store lessons learned during development. Read all memory files at the start of work. Write new ones when you discover something non-obvious.
