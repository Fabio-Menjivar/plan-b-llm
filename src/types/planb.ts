/**
 * Plan B (Bitcoin Plan Builder) — frontend-facing types.
 *
 * This is a CURATED, READ-ONLY SUBSET of the backend's `BitcoinPlanOutput`
 * (see ~/Desktop/builder/bitcoin-plan-builder/packages/core/src/types.ts),
 * shaped for display in this frontend.
 *
 * Safety by design:
 *   - We intentionally DO NOT model `rawModelOutput` or generated file
 *     `content`. The frontend only ever carries file METADATA (path + purpose),
 *     never raw model output and never file bodies. This keeps demo fixtures and
 *     any future remote payloads free of secret-bearing or unreviewed content.
 *
 * These types are isolated to the Plan B integration layer and are not imported
 * by Fabio's existing app code.
 */

export type StackItemType =
  "protocol" | "sdk" | "repo" | "bip" | "bolt" | "design_reference" | "security_tool";

export interface StackItem {
  name: string;
  type: StackItemType;
  reason: string;
  /** 0..1 confidence that this item belongs in the stack. */
  confidence: number;
}

export interface ArchitecturePlan {
  summary: string;
  frontend?: string;
  backend?: string;
  bitcoinLayer?: string;
  paymentLayer?: string;
  securityLayer?: string;
  assumptions: string[];
  risks: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ComposabilityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export interface SecurityNote {
  severity: SecuritySeverity;
  area: string;
  note: string;
  recommendation: string;
}

/** Mirrors the backend's SecurityToolStatusValue. "planned" = not executed. */
export type SecurityToolStatusValue = "planned" | "mock" | "executed" | "failed";

export interface SecurityToolStatus {
  name: string;
  status: SecurityToolStatusValue;
  notes: string[];
}

export interface ModelMetadata {
  modelName: string;
  provider: string;
  tokenStrategy: string;
}

export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  /** Where the usage numbers came from. */
  source?: "api" | "estimated";
}

/** Metadata only — never file contents. */
export interface GeneratedFileMeta {
  path: string;
  purpose: string;
  /** Optional language tag for display (e.g. "ts", "tsx", "json", "md"). */
  language?: string;
  /** Optional approximate size in bytes, for display only. */
  bytes?: number;
}

export interface GeneratedAppMeta {
  slug: string;
  summary: string;
  files: GeneratedFileMeta[];
  instructions: string[];
  warnings: string[];
  trustAssumptions?: string[];
  securityNotes?: string[];
  securityTools?: SecurityToolStatus[];
  tokenUsage?: TokenUsage;
}

/**
 * Frontend-facing plan output. A safe subset of the backend `BitcoinPlanOutput`
 * (no `rawModelOutput`).
 */
export interface BitcoinPlanOutput {
  requestId: string;
  appName: string;
  intent: string;
  selectedStack: StackItem[];
  architecture: ArchitecturePlan;
  graph: ComposabilityGraph;
  securityNotes: SecurityNote[];
  retrievedKnowledgeCards: string[];
  modelMetadata: ModelMetadata;
  generatedApp?: GeneratedAppMeta;
}

// ---------------------------------------------------------------------------
// Benchmark sample (illustrative; mirrors backend benchmark report shape).
// ---------------------------------------------------------------------------

export type BenchmarkStrategy = "generic" | "specialized_harness";
export type BenchmarkMode = "mock" | "real";

export interface BenchmarkScore {
  stackAccuracy: number;
  graphCompleteness: number;
  securityAwareness: number;
  tokenEfficiency: number;
  overall: number;
}

export interface BenchmarkRunSample {
  strategy: BenchmarkStrategy;
  modelName: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  outputHasGraph: boolean;
  outputHasSecurityNotes: boolean;
  score: BenchmarkScore;
}

export interface BenchmarkSample {
  id: string;
  caseName: string;
  modelName: string;
  /** "mock" for this demo — not a verified real provider run. */
  benchmarkMode: BenchmarkMode;
  runs: BenchmarkRunSample[];
  summary: string;
  winner?: string;
  note: string;
}

// ---------------------------------------------------------------------------
// Client / mode types.
// ---------------------------------------------------------------------------

export type PlanbMode = "demo" | "remote";

/** Runtime, display-only metadata about how the data was loaded. */
export interface PlanbRuntimeMeta {
  mode: PlanbMode;
  /** True when remote was requested but we fell back to demo. */
  fellBackToDemo: boolean;
  apiUrl?: string;
  source: string;
}

/** The full demo bundle bundled with the frontend in static demo mode. */
export interface PlanbDemoBundle {
  plan: BitcoinPlanOutput;
  benchmark: BenchmarkSample;
  /** Static ISO timestamp recorded when the fixtures were last refreshed. */
  generatedAt: string;
}
