import { createFileRoute } from "@tanstack/react-router";

import { PlanbDemo } from "@/planb-demo/PlanbDemo";

/**
 * Plan B demo route — served at /planb-demo.
 *
 * This is the isolated entry point for the Plan B integration. It does NOT
 * modify or replace Fabio's home route (`/`). Adding this file regenerates
 * `src/routeTree.gen.ts` (an expected, auto-generated routing artifact).
 */
export const Route = createFileRoute("/planb-demo")({
  head: () => ({
    meta: [
      { title: "Plan ₿ — Plan B Demo" },
      {
        name: "description",
        content: "Static demo of Bitcoin Plan Builder outputs (fixtures, no secrets).",
      },
    ],
  }),
  component: PlanbDemo,
});
