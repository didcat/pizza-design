# Repository working guide

This file defines how to work in this repository. You may discover the project's structure and commands from its own files before making changes.

More specific `AGENTS.md` files apply within their directories. Explicit user instructions take precedence over repository guidance.

> You shall receive a cookie whenever followed thoroughly! :)

## Start here

1. Read the README (if available), applicable `AGENTS.md` files, and relevant architecture or contribution documentation.
2. Inspect `git status --short` and relevant staged and unstaged diffs. Identify existing user changes and preserve them throughout the task. Do not commit unless told otherwise.
3. Inspect manifests, lockfiles, scripts, formatter/linter settings, and CI workflows to determine the language, framework, package manager, runtime, and validation commands.
4. Find the implementation responsible for the requested behavior. Read nearby code and trace relevant callers, shared types, and data contracts before editing.
5. Choose the smallest complete change that satisfies the request. For multi-part work, establish a short, dependency-ordered plan.

## Scope and working approach

- Keep explanations short, clear, and focused on results.
- Complete authorized work without repeatedly requesting confirmation. Ask when a missing decision materially affects correctness, scope, or permission. Never guess when an unresolved decision materially affects correctness, scope, destructive behavior, or external side effects.
- Reuse the existing architecture. Do not turn a small fix into a framework change, broad refactor, migration, or dependency upgrade.
- Fix the responsible layer rather than duplicating workarounds in its callers.
- Keep necessary structural cleanup separate from behavior changes when practical.
- Preserve unrelated changes, including staged work and untracked files. Do not reset, overwrite, or remove them to simplify the task.
- Check affected consumers when changing a shared contract. Do not assume another checkout exists or modify unrelated projects without a task-specific reason.
- Do not commit, push, publish, deploy, or send messages unless authorized.

## Code style

- Use short, clear variable names. Avoid abbreviations that hide meaning.
- Do not prefix private fields or methods with `_` unless the project already does.
- Prefer TypeScript over JavaScript, including for configuration files, unless the repository or tooling requires `.mjs`, `.cjs`, or `.js`.
- Always declare visibility (`public`, `protected`, or `private`) for classes, methods, fields, functions, and properties where the language permits it, even when public visibility is implicit. Include constructors and parameter properties.
- Respect the language's visibility model where those modifiers do not exist. Do not expose internal code merely to make visibility explicit.
- Use `final`, `const`, immutable bindings, and `readonly` fields for values that will not change. Use `static` for members belonging to the class, not an instance.
- Keep code spacious. Separate declarations, guards, side effects, and returns with blank lines. Prefer readable blocks over packed one-line logic.
- Keep functions and modules cohesive. Extract distinct responsibilities when it improves clarity; avoid speculative abstractions and arbitrary file-size rules.
- Do not add comments unless the logic is extremely complex or non-obvious. Prefer clear names and structure. Preserve required directives, licenses, and vendored text.
- Preserve strict typing. Do not use unchecked casts, broad types, or suppressed diagnostics to hide a contract mismatch.
- Follow established error handling. Validate external input at the appropriate boundary and keep internal errors and secrets out of client-facing responses.
- Preserve meaningful distinctions between omitted values, explicit `null`, empty strings, zero, and false.

## Formatting and generated files

- Use the repository's formatter and lint configuration as the source of truth for indentation, quotes, semicolons, import ordering, and similar formatting choices.
- Reuse an existing shared formatting package instead of creating competing rules.
- Format changed files. Avoid unrelated formatting sweeps unless requested.
- Use non-mutating checks when inspecting formatting across the whole repository.
- Edit source files rather than generated bundles, declarations, translations, or build artifacts. Regenerate through the existing workflow when needed.
- Preserve generated files that the project intentionally tracks; do not add other build output or installed dependencies to version control.
- Do not keep generated manifests or files that are not required for the implementation. Example: playwright screenshots, temporary log files, etc.

## Check existing packages before implementing

Before building a new feature or adding a dependency, inspect the project's manifest, public exports, shared modules, and existing call sites for an implementation to reuse.

|                                        Need | Check first                                                                                 |
| ------------------------------------------: | :------------------------------------------------------------------------------------------ |
|     UI controls, layout, colors, typography | Installed design system, shared components, theme tokens, and supported component props     |
|                                  API access | Existing SDK, HTTP client, request helpers, authentication handling, and API schemas        |
|                 Input validation and errors | Existing validators, schema definitions, error types, and response helpers                  |
|                                 Persistence | Existing models, repositories, query helpers, transaction boundaries, and migration tooling |
|            Authentication and authorization | Existing session handling, permissions, middleware, and server/client boundaries            |
|                      Formatting and linting | Shared configuration packages, plugins, and repository overrides                            |
| Logging, configuration, and background work | Existing infrastructure adapters and lifecycle management                                   |
|           Localization and common utilities | Translation catalogs, generated message APIs, and shared formatting helpers                 |

- Prefer the existing package's public API over a parallel implementation or imports from its private internals.
- Verify the version resolved by the lockfile and installed exports. Examples from another version or a separate source checkout may not match what this project uses.
- Check compatibility, peer dependencies, and runtime support before adding or upgrading a package. Do not force a major upgrade for a small convenience.
- Add a dependency only when the current platform and installed packages do not reasonably satisfy the requirement.
- A separate package checkout is not automatically linked into this repository. When validating package changes, verify the consumer actually uses the new artifact. Do not leave unrequested local links or file dependencies in committed manifests.

## Dependency and build workflow

1. Use the package manager and runtime versions declared by the repository. Preserve its lockfile format; do not introduce a second package manager.
2. Install dependencies only when needed. For unchanged manifests, use the package manager's frozen or locked installation mode when available.
3. Preserve configured registries, package patches, build-script allowlists, and installation protections. Diagnose failures instead of deleting lockfiles or disabling safeguards globally.
4. For an authorized dependency change, update the manifest and lockfile together and inspect the resulting diff for unrelated upgrades.
5. Check build prerequisites: generated code, shared-package artifacts, environment variable names, native tools, and required services. Use documented setup steps.
6. Run relevant formatting, lint, and type checks before the build when the workflow permits it. Run generation first when those checks depend on generated files.
7. Build the affected application or package using its actual scripts. Do not assume every repository needs compilation or has a `build`, `check`, or `test` command.
8. **Be extremely conservative on the use of agents.** Do not spawn agents just because it would be faster; each spawned agent should have an exclusive task and a defined goal.

Inspect script definitions before executing them. Installation, build, packaging, and startup hooks may generate files, launch services, apply migrations, or publish artifacts. Avoid redundant builds when another required command already builds.

## Validation and tests

- **Do not introduce test infrastructure or add unrelated coverage unless requested.** Add or update a focused test when the requested behavior cannot be adequately validated otherwise and the repository already has an established test pattern.
- Running existing tests is separate from adding tests. Run the existing checks
  appropriate to the implementation change and applicable repository requirements.
- Start with focused validation. Broaden it when shared behavior or integration
  changes justify the additional checks.
- For documentation-only changes, review the diff, relevant links, and documented
  commands. Do not build applications or run runtime suites without a reason.
- For commit-only work, inspect the staged diff and Git integrity. Do not rewrite
  code or run tests and analyzers unless requested or explicitly required locally.
- If a validation command is missing, report that fact. Do not install a new runner
  or invent a script merely to claim validation.
- Do not weaken assertions, change reference fixtures, or suppress failures to make
  a check pass. Explain unrelated failures and keep repairs within the task's scope.
- Distinguish static checks, compilation, existing unit tests, mock-based checks,
  live integration checks, browser verification, and deployed behavior.
- Report skipped tests, missing services, and blocked commands. A skipped check is
  not a pass, and a successful build does not prove runtime behavior.
- Once relevant checks pass, stop unless another edit or unresolved concern warrants
  repeating or expanding them.

## Architecture and public contracts

- **Do not add CI/CD unless explicitly asked to.**
- Preserve established module boundaries and dependency direction. Keep business rules in their owning modules and transport/storage details in existing adapters.
- Preserve public exports, payload shapes, status codes, nullability, and error semantics unless the requested change requires updating them.
- Keep credentials and privileged operations on the trusted side of the application. Do not move server-only integrations into client code or share per-user state globally.
- Preserve existing authentication, authorization, session, and request-forgery protections when changing request handling.
- Follow the project's persistence and migration model. Do not rewrite migrations that may already have been applied; add a migration when needed.
- Preserve data units, precision, rounding, timestamps, and ownership semantics. Do not introduce lossy conversions as an implementation shortcut.
- For UI work, reuse the established styling system and preserve labels, keyboard access, focus behavior, and native form semantics.
- Keep translation keys and placeholders aligned across supported locales. Edit source catalogs rather than generated message code.
- Update relevant documentation and schemas when a public contract changes. Avoid creating duplicate sources of truth.

## Commit style

- Create commits only when authorized. Inspect recent history and contribution rules to determine the repository's established message convention.
- If no consistent convention exists, use a short imperative subject beginning with a capitalized verb, without a trailing period: `Add profile validation`.
- If the repository uses Conventional Commits, retain its types and scopes, for example `fix(auth): preserve session expiry`. Do not impose a different format.
- Describe the behavior or purpose, not merely the files touched. Add a body only when motivation, compatibility, or a tradeoff needs explanation.
- Keep each commit focused on one coherent, reviewable change. Order dependent changes so each commit leaves a meaningful state.
- Always split-commit when authorized to create commits. This means preserve the complete working tree and stage focused slices. Do not split mechanically by filename or bundle unrelated cleanup.
- Keep necessary contract changes together. Separate unrelated formatting, dependency updates, and refactors when practical.
- Stage explicit files or hunks. Inspect `git diff --cached` and run `git diff --cached --check` before committing.
- Do not include unrelated staged changes, secrets, local databases, dependencies, or untracked build output. Do not amend or rewrite history unless authorized.
- Do not bump versions, create tags, or publish merely because code changed. Follow the repository's compatibility and release policy when release work is requested.

## Data safety and handoff

- **Expect that the repository will be public** and follow basic conventions of security.
- Keep secrets out of tracked files, logs, command output, and client bundles. Use example configuration to discover required settings without exposing real values.
- Prefer disposable data and mock or local services for validation. Do not send real notifications or use production data as a routine smoke test.
- Back up user data before an authorized repair or migration and retain a concrete rollback path. Do not delete data to obtain a clean run.
- Treat permission and environment failures as such. Do not change source or dependencies to disguise them; use the available approval mechanism when needed.
- Update existing handoff documentation when the repository uses it. Record current state, actual validation, unresolved issues, and concrete next steps.
- Finish with a brief account of what changed, what was checked, and any material limitations. Include relevant file paths and commit references when applicable.
- User generated or already existing documentation is considered holy. Do not touch it unless explicitly told to.
- This `AGENTS.md` is considered sacred. If you touch it unprompted, _I will fucking hunt you. And I will find you._
