# Plan B demo fixtures (static artifacts)

These JSON files are **static, sanitized demo artifacts** for the Plan B
(Bitcoin Plan Builder) integration. They are served as-is from
`/<base>/planb-demo/*.json` on GitHub Pages.

- `plan.json` — a Breez Lightning wallet model-codegen sample (selected stack,
  architecture, composability graph, security notes, generated **file metadata**,
  Loupe status `planned`, model/token metadata).
- `benchmark.json` — an illustrative `mock` benchmark sample.

## Safety

These files contain **no secrets**, **no API keys**, **no raw model output**, and
**no generated file bodies** (only file metadata). Never add any of those here.
The browser never calls OpenRouter; in remote mode the frontend only ever talks
to `VITE_PLANB_API_URL`.

## Source of truth & refresh

The app reads the TypeScript fixtures in `src/lib/planb/demoFixtures.ts` (demo
mode), not these JSON files — so there is no runtime drift risk. These JSON
mirrors exist for static fetch / external inspection and for exercising a
remote-style fetch.

To refresh after a backend or frontend change:

1. Produce/sanitize a backend run (strip secrets, raw model output, file bodies).
2. Update `src/lib/planb/demoFixtures.ts`.
3. Mirror the same values into these JSON files.
4. Run `bun run build` and the secret scan, then commit on `integration/planb-demo`.
