// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Plan B integration (additive, build-only): the GitHub Pages base path is
// applied ONLY when PLANB_PAGES_BASE is set (e.g. "/plan-b-llm/"), which the
// Pages workflow sets. It is unset during local dev and on Lovable, so this is
// a no-op there and does not change Fabio's local/Lovable build behavior.
const planbPagesBase = process.env.PLANB_PAGES_BASE;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  ...(planbPagesBase ? { vite: { base: planbPagesBase } } : {}),
});
