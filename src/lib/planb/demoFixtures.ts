/**
 * Plan B — STATIC DEMO FIXTURES (safe for GitHub Pages).
 *
 * This is the single source of truth for the static demo. It is hand-curated,
 * sanitized, demo-grade data — NOT a live backend response. It contains:
 *   - NO API keys or secrets
 *   - NO raw model output
 *   - NO generated file contents (only file metadata)
 *
 * Mirror copies live at `public/planb-demo/*.json` for static fetch/inspection;
 * the app reads THIS file in demo mode (so there is no runtime drift risk).
 *
 * To refresh: regenerate the values here from a sanitized backend run, then
 * update the JSON mirrors. See `public/planb-demo/README.md`.
 */
import type { BitcoinPlanOutput, BenchmarkSample, PlanbDemoBundle } from "@/types/planb";

/** Static timestamp of the last fixture refresh (kept manual; do not auto-date). */
export const FIXTURES_GENERATED_AT = "2026-06-29T00:00:00.000Z";

/**
 * Breez (Lightning) wallet — model-assisted codegen sample.
 * Represents the harness output for a self-custodial Lightning wallet built on
 * the Breez SDK. Demo-grade and illustrative.
 */
export const demoPlan: BitcoinPlanOutput = {
  requestId: "demo-breez-wallet-0001",
  appName: "Breez Lightning Wallet",
  intent:
    "Build a self-custodial mobile-first Lightning wallet using the Breez SDK, " +
    "with send/receive over BOLT11 invoices, LSP-assisted channels, and a clean " +
    "Bitcoin-design UI.",
  selectedStack: [
    {
      name: "breez-sdk",
      type: "sdk",
      reason:
        "Provides an all-in-one self-custodial Lightning stack (node, LSP, on-chain swaps) behind a single SDK surface.",
      confidence: 0.95,
    },
    {
      name: "lightning-network",
      type: "protocol",
      reason: "Underlying payment layer for instant, low-fee transfers.",
      confidence: 0.97,
    },
    {
      name: "bolt11-invoices",
      type: "bolt",
      reason: "Standard invoice format for request/pay flows in the wallet UI.",
      confidence: 0.9,
    },
    {
      name: "bitcoin-design",
      type: "design_reference",
      reason: "Bitcoin Design Guide patterns for wallet UX (backups, fees, receive/send).",
      confidence: 0.82,
    },
    {
      name: "loupe",
      type: "security_tool",
      reason: "Static analysis pass planned for the generated wallet code before release.",
      confidence: 0.7,
    },
  ],
  architecture: {
    summary:
      "A mobile-first React frontend talks to the Breez SDK through a thin adapter. " +
      "Lightning send/receive runs over LSP-assisted channels; key material stays on device.",
    frontend: "React + TypeScript wallet UI (send, receive, history, backup)",
    backend: "Breez SDK embedded node (no custodial server); optional LSP for inbound liquidity",
    bitcoinLayer: "Bitcoin L1 for on-chain swaps and channel funding",
    paymentLayer: "Lightning Network (BOLT11 invoices, keysend optional)",
    securityLayer: "On-device key storage, encrypted backups, planned Loupe static scan",
    assumptions: [
      "User holds their own keys (self-custodial).",
      "An LSP is available for inbound liquidity during onboarding.",
      "Network connectivity is intermittent; flows must tolerate retries.",
    ],
    risks: [
      "LSP trust for inbound liquidity and routing.",
      "Backup/restore UX is critical — lost seed means lost funds.",
      "Fee spikes on L1 can affect swap and channel operations.",
    ],
  },
  graph: {
    nodes: [
      { id: "ui", label: "Wallet UI (React)", type: "frontend" },
      { id: "adapter", label: "Breez SDK Adapter", type: "adapter" },
      { id: "breez", label: "Breez SDK (embedded node)", type: "sdk" },
      { id: "lsp", label: "LSP (inbound liquidity)", type: "service" },
      { id: "ln", label: "Lightning Network", type: "protocol" },
      { id: "l1", label: "Bitcoin L1", type: "settlement" },
    ],
    edges: [
      { from: "ui", to: "adapter", label: "send/receive intents" },
      { from: "adapter", to: "breez", label: "SDK calls" },
      { from: "breez", to: "lsp", label: "channel open / liquidity" },
      { from: "breez", to: "ln", label: "route payments" },
      { from: "ln", to: "l1", label: "swaps / settlement" },
    ],
  },
  securityNotes: [
    {
      severity: "critical",
      area: "Key management",
      note: "Seed and channel keys are held on device.",
      recommendation:
        "Use platform secure storage (Keychain/Keystore); never log or transmit key material.",
    },
    {
      severity: "high",
      area: "Backup & recovery",
      note: "Loss of seed or channel state can mean loss of funds.",
      recommendation: "Enforce verified backup before enabling receive; document recovery flow.",
    },
    {
      severity: "medium",
      area: "LSP trust",
      note: "Inbound liquidity relies on a Lightning Service Provider.",
      recommendation: "Disclose LSP dependence; allow user-configurable LSP where possible.",
    },
    {
      severity: "low",
      area: "Invoice handling",
      note: "Malformed or expired BOLT11 invoices can confuse the pay flow.",
      recommendation: "Validate invoices client-side and surface clear expiry/amount errors.",
    },
  ],
  retrievedKnowledgeCards: [
    "breez-sdk",
    "lightning-network",
    "bolt11-invoices",
    "bitcoin-design",
    "loupe",
  ],
  modelMetadata: {
    modelName: "glm-5.2",
    provider: "zhipu",
    tokenStrategy: "medium compression / maxContextCards=6",
  },
  generatedApp: {
    slug: "breez-lightning-wallet",
    summary:
      "Scaffold for a self-custodial Lightning wallet: Breez SDK adapter, send/receive screens, " +
      "backup flow, and a planned Loupe security pass. File metadata only — no source bodies in this demo.",
    files: [
      { path: "src/App.tsx", purpose: "Wallet shell and routing", language: "tsx", bytes: 1840 },
      {
        path: "src/lib/breez/breezClient.ts",
        purpose: "Thin adapter over the Breez SDK",
        language: "ts",
        bytes: 2210,
      },
      {
        path: "src/screens/Receive.tsx",
        purpose: "Create BOLT11 invoice + QR",
        language: "tsx",
        bytes: 1620,
      },
      {
        path: "src/screens/Send.tsx",
        purpose: "Pay invoice / amount entry",
        language: "tsx",
        bytes: 1490,
      },
      {
        path: "src/screens/Backup.tsx",
        purpose: "Seed backup + verification flow",
        language: "tsx",
        bytes: 1305,
      },
      { path: "README.md", purpose: "Setup and security notes", language: "md", bytes: 980 },
    ],
    instructions: [
      "Install dependencies and provide a Breez API key via environment (never commit it).",
      "Initialize the Breez SDK adapter on app start.",
      "Complete the backup flow before enabling receive.",
      "Run the planned Loupe static analysis pass before any release build.",
    ],
    warnings: [
      "This is scaffold/demo metadata only — not production-audited code.",
      "Breez API credentials must be supplied at runtime and kept out of the client bundle/repo.",
    ],
    trustAssumptions: [
      "Self-custodial: the user controls keys; there is no custodial server.",
      "Inbound liquidity depends on an LSP.",
    ],
    securityNotes: [
      "Key material stays on device in secure storage.",
      "Backups are encrypted; recovery is documented.",
    ],
    securityTools: [
      {
        name: "Loupe",
        status: "planned",
        notes: [
          "Static analysis pass is PLANNED for the generated wallet code.",
          "Not executed in this demo build — status is 'planned' only.",
        ],
      },
    ],
    tokenUsage: {
      inputTokens: 1980,
      outputTokens: 3120,
      totalTokens: 5100,
      source: "estimated",
    },
  },
};

/**
 * Illustrative benchmark sample (benchmarkMode: "mock").
 * Compares the same model used two ways: a generic prompt vs the specialized
 * Bitcoin Plan Builder harness. NOT a verified real-provider run.
 */
export const demoBenchmark: BenchmarkSample = {
  id: "demo-breez-wallet-bench-0001",
  caseName: "Breez Lightning Wallet",
  modelName: "glm-5.2",
  benchmarkMode: "mock",
  runs: [
    {
      strategy: "generic",
      modelName: "glm-5.2",
      provider: "zhipu",
      inputTokens: 520,
      outputTokens: 3400,
      totalTokens: 3920,
      latencyMs: 1180,
      outputHasGraph: false,
      outputHasSecurityNotes: false,
      score: {
        stackAccuracy: 0.55,
        graphCompleteness: 0.2,
        securityAwareness: 0.3,
        tokenEfficiency: 0.6,
        overall: 0.43,
      },
    },
    {
      strategy: "specialized_harness",
      modelName: "glm-5.2",
      provider: "zhipu",
      inputTokens: 1980,
      outputTokens: 3120,
      totalTokens: 5100,
      latencyMs: 1320,
      outputHasGraph: true,
      outputHasSecurityNotes: true,
      score: {
        stackAccuracy: 0.92,
        graphCompleteness: 0.88,
        securityAwareness: 0.9,
        tokenEfficiency: 0.74,
        overall: 0.86,
      },
    },
  ],
  summary:
    "The specialized harness produces a grounded stack, a composability graph, and security notes " +
    "that the generic prompt omits — at a modest token cost.",
  winner: "specialized_harness",
  note: "Illustrative mock sample for the demo. Not a verified real-provider benchmark.",
};

export const demoBundle: PlanbDemoBundle = {
  plan: demoPlan,
  benchmark: demoBenchmark,
  generatedAt: FIXTURES_GENERATED_AT,
};
