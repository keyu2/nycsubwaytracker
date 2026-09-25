<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project coding standards

- Write straightforward production code that matches the surrounding project. Prefer domain terms such as `station`, `service`, `routeGroup`, and `arrival` over generic names.
- Keep modules focused, but do not create a new file or abstraction for a one-off operation. Extract code when it has a clear responsibility, is reused, or makes a large component easier to follow.
- Comments explain non-obvious transit rules, data limitations, or design decisions. Do not narrate the code, record editing history, mention source examples, or label sections as final, temporary, adapted, or AI-generated.
- Put reusable static presentation in the project stylesheets. Inline styles are reserved for values that are genuinely dynamic, preferably exposed through a descriptive CSS custom property.
- Prefer readable control flow over dense chains and speculative generalization. Keep exceptional MTA behavior explicit and close to the relevant data logic.
- Treat realtime MTA data as authoritative. Use static GTFS data only when realtime data is unavailable or for facts that realtime feeds do not contain.
- Add tests for real behavior and regressions. Test names should describe the user-visible rule without restating implementation details.
- Preserve existing behavior and unrelated working-tree changes. Before handing off a code change, run `pnpm check` unless the change is documentation-only.
