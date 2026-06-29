/**
 * Plan B client abstraction.
 *
 * Two modes, selected at build time by Vite env, with DEMO as the default:
 *
 *   1. "demo"   (default) — returns the bundled static fixtures. No network,
 *               no secrets, safe for GitHub Pages.
 *   2. "remote" (opt-in)  — fetches from a configurable backend at
 *               VITE_PLANB_API_URL. The backend holds any provider key; the
 *               browser NEVER calls OpenRouter (or any LLM provider) directly,
 *               and no secret is ever read or shipped here.
 *
 * Safety rules enforced here:
 *   - If "remote" is requested but VITE_PLANB_API_URL is missing, we fall back
 *     to demo and warn (never throw — a missing URL must not break the build).
 *   - This module imports no secrets and references no provider API.
 */
import type {
  BitcoinPlanOutput,
  BenchmarkSample,
  PlanbMode,
  PlanbRuntimeMeta,
} from "@/types/planb";
import { demoPlan, demoBenchmark, FIXTURES_GENERATED_AT } from "@/lib/planb/demoFixtures";

/** Read a Vite env var in an SSR/CSR-safe way. */
function readEnv(key: string): string | undefined {
  const value = (import.meta.env as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** The configured backend base URL for remote mode (undefined in demo mode). */
export function getPlanbApiUrl(): string | undefined {
  return readEnv("VITE_PLANB_API_URL");
}

/** Whether remote mode was explicitly requested via env. */
function remoteRequested(): boolean {
  return readEnv("VITE_PLANB_MODE")?.toLowerCase() === "remote";
}

/**
 * Resolve the effective mode. "remote" requires both VITE_PLANB_MODE=remote
 * AND a non-empty VITE_PLANB_API_URL; otherwise we fall back to "demo".
 */
export function getPlanbMode(): PlanbMode {
  if (remoteRequested() && getPlanbApiUrl()) return "remote";
  return "demo";
}

/** Display-only metadata describing how data is being loaded. */
export function getRuntimeMeta(): PlanbRuntimeMeta {
  const mode = getPlanbMode();
  const fellBackToDemo = remoteRequested() && mode === "demo";
  if (fellBackToDemo) {
    console.warn(
      "[planb] VITE_PLANB_MODE=remote was requested but VITE_PLANB_API_URL is not set — falling back to static demo mode.",
    );
  }
  return {
    mode,
    fellBackToDemo,
    apiUrl: mode === "remote" ? getPlanbApiUrl() : undefined,
    source: mode === "demo" ? `static-demo-fixtures @ ${FIXTURES_GENERATED_AT}` : "remote-backend",
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const base = getPlanbApiUrl();
  if (!base) throw new Error("[planb] remote mode requires VITE_PLANB_API_URL");
  const url = `${base.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`[planb] remote request failed: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/**
 * Load the Bitcoin plan. Demo mode returns the bundled fixture synchronously
 * (wrapped in a resolved promise); remote mode fetches from the backend and,
 * on any failure, falls back to the demo fixture so the UI never hard-fails.
 */
export async function fetchPlan(): Promise<BitcoinPlanOutput> {
  if (getPlanbMode() === "remote") {
    try {
      return await fetchJson<BitcoinPlanOutput>("/api/plan");
    } catch (err) {
      console.warn("[planb] remote plan fetch failed — falling back to demo fixture.", err);
    }
  }
  return demoPlan;
}

/** Load the benchmark sample (same demo/remote semantics as fetchPlan). */
export async function fetchBenchmark(): Promise<BenchmarkSample> {
  if (getPlanbMode() === "remote") {
    try {
      return await fetchJson<BenchmarkSample>("/api/benchmark");
    } catch (err) {
      console.warn("[planb] remote benchmark fetch failed — falling back to demo fixture.", err);
    }
  }
  return demoBenchmark;
}

/**
 * Synchronous demo accessors — used for the initial render (and SSR) so the
 * default demo page paints full content immediately, with no loading flash.
 */
export const demoPlanSync = demoPlan;
export const demoBenchmarkSync = demoBenchmark;
