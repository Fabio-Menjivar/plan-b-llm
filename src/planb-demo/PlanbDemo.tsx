/**
 * Plan B demo — isolated demo surface.
 *
 * This component is part of the Plan B integration layer (NOT Fabio's app code).
 * It renders Plan B outputs through `planbClient`, defaulting to bundled static
 * fixtures (demo mode). It performs no network calls in demo mode and never
 * touches any LLM provider.
 *
 * It reuses Fabio's existing design system (shadcn/ui + Tailwind tokens) so it
 * looks native, without modifying any of his files.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bitcoin,
  Boxes,
  Cpu,
  FileCode2,
  Gauge,
  Network,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  fetchBenchmark,
  fetchPlan,
  getRuntimeMeta,
  demoPlanSync,
  demoBenchmarkSync,
} from "@/lib/planb/planbClient";
import type {
  BenchmarkSample,
  BitcoinPlanOutput,
  SecuritySeverity,
  SecurityToolStatusValue,
} from "@/types/planb";

function severityVariant(s: SecuritySeverity): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "critical":
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
    default:
      return "outline";
  }
}

function toolStatusVariant(
  s: SecurityToolStatusValue,
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "executed":
      return "default";
    case "failed":
      return "destructive";
    case "mock":
      return "secondary";
    case "planned":
    default:
      return "outline";
  }
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-panel/60 border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-bitcoin">{icon}</span>
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function PlanbDemo() {
  const meta = useMemo(() => getRuntimeMeta(), []);
  const [plan, setPlan] = useState<BitcoinPlanOutput>(demoPlanSync);
  const [bench, setBench] = useState<BenchmarkSample>(demoBenchmarkSync);

  useEffect(() => {
    let alive = true;
    void fetchPlan().then((p) => alive && setPlan(p));
    void fetchBenchmark().then((b) => alive && setBench(b));
    return () => {
      alive = false;
    };
  }, []);

  const usage = plan.generatedApp?.tokenUsage;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Plan ₿
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={meta.mode === "demo" ? "outline" : "default"}
                className="border-bitcoin/40 text-bitcoin"
              >
                {meta.mode === "demo" ? "Static demo mode" : "Remote backend mode"}
              </Badge>
              {meta.fellBackToDemo ? <Badge variant="secondary">fell back to demo</Badge> : null}
            </div>
          </div>

          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Bitcoin className="size-7 text-bitcoin" />
            {plan.appName}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{plan.intent}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary" className="font-mono">
              <Cpu className="mr-1 size-3" />
              {plan.modelMetadata.modelName}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {plan.modelMetadata.provider}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {plan.modelMetadata.tokenStrategy}
            </Badge>
            {usage?.totalTokens ? (
              <Badge variant="outline" className="font-mono">
                {usage.totalTokens.toLocaleString()} tok ({usage.source ?? "estimated"})
              </Badge>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Source: <span className="font-mono">{meta.source}</span> · No secrets · No OpenRouter
            calls from the browser
          </p>
        </header>

        <div className="grid gap-6">
          {/* Selected stack */}
          <Section icon={<Boxes className="size-4" />} title="Selected stack">
            <ul className="grid gap-3 sm:grid-cols-2">
              {plan.selectedStack.map((item) => (
                <li
                  key={item.name}
                  className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold">{item.name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    confidence {pct(item.confidence)}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          {/* Architecture */}
          <Section icon={<Network className="size-4" />} title="Architecture">
            <p className="text-sm">{plan.architecture.summary}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {(
                [
                  ["Frontend", plan.architecture.frontend],
                  ["Backend", plan.architecture.backend],
                  ["Bitcoin layer", plan.architecture.bitcoinLayer],
                  ["Payment layer", plan.architecture.paymentLayer],
                  ["Security layer", plan.architecture.securityLayer],
                ] as const
              )
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => (
                  <div key={k} className="rounded-md border border-border/50 bg-elevated/30 p-2">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="text-sm">{v}</dd>
                  </div>
                ))}
            </dl>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Assumptions</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {plan.architecture.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Risks</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                  {plan.architecture.risks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Composability graph */}
          <Section
            icon={<Network className="size-4" />}
            title="Composability graph"
            description="How the selected pieces connect."
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {plan.graph.nodes.map((n) => (
                <Badge key={n.id} variant="secondary" className="font-mono text-xs">
                  {n.label}
                </Badge>
              ))}
            </div>
            <ul className="space-y-1 text-xs">
              {plan.graph.edges.map((e, i) => {
                const from = plan.graph.nodes.find((n) => n.id === e.from)?.label ?? e.from;
                const to = plan.graph.nodes.find((n) => n.id === e.to)?.label ?? e.to;
                return (
                  <li key={`${e.from}-${e.to}-${i}`} className="font-mono text-muted-foreground">
                    <span className="text-foreground">{from}</span>
                    <span className="text-bitcoin"> → </span>
                    <span className="text-foreground">{to}</span>
                    {e.label ? <span className="text-muted-foreground"> ({e.label})</span> : null}
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Generated files (metadata only) */}
          {plan.generatedApp ? (
            <Section
              icon={<FileCode2 className="size-4" />}
              title="Generated files (metadata)"
              description="File metadata only — no source bodies or raw model output are included."
            >
              <ul className="divide-y divide-border/50">
                {plan.generatedApp.files.map((f) => (
                  <li key={f.path} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm">{f.path}</p>
                      <p className="truncate text-xs text-muted-foreground">{f.purpose}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                      {f.language ? <Badge variant="outline">{f.language}</Badge> : null}
                      {typeof f.bytes === "number" ? <span>{f.bytes} B</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {/* Security notes */}
          <Section icon={<ShieldCheck className="size-4" />} title="Security notes">
            <ul className="space-y-3">
              {plan.securityNotes.map((s, i) => (
                <li
                  key={`${s.area}-${i}`}
                  className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={severityVariant(s.severity)} className="uppercase">
                      {s.severity}
                    </Badge>
                    <span className="text-sm font-semibold">{s.area}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
                  <p className="mt-1 text-xs">
                    <span className="font-semibold">Recommendation:</span> {s.recommendation}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          {/* Security tools (Loupe) */}
          {plan.generatedApp?.securityTools?.length ? (
            <Section
              icon={<ShieldCheck className="size-4" />}
              title="Security tools"
              description="Tool status is reported honestly; 'planned' means not executed."
            >
              <ul className="space-y-2">
                {plan.generatedApp.securityTools.map((t) => (
                  <li
                    key={t.name}
                    className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{t.name}</span>
                      <Badge variant={toolStatusVariant(t.status)} className="uppercase">
                        {t.status}
                      </Badge>
                    </div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                      {t.notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {/* Benchmark */}
          <Section
            icon={<Gauge className="size-4" />}
            title="Benchmark sample"
            description={bench.note}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary" className="font-mono">
                {bench.modelName}
              </Badge>
              <Badge variant="outline" className="uppercase">
                {bench.benchmarkMode}
              </Badge>
              {bench.winner ? (
                <Badge variant="default" className="bg-success text-background">
                  winner: {bench.winner}
                </Badge>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {bench.runs.map((run) => (
                <div
                  key={run.strategy}
                  className="rounded-lg border border-border/60 bg-elevated/40 p-3"
                >
                  <p className="font-mono text-sm font-semibold">{run.strategy}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {run.totalTokens.toLocaleString()} tok · {run.latencyMs} ms
                  </p>
                  <dl className="mt-2 space-y-1 text-xs">
                    {(
                      [
                        ["overall", run.score.overall],
                        ["stack accuracy", run.score.stackAccuracy],
                        ["graph completeness", run.score.graphCompleteness],
                        ["security awareness", run.score.securityAwareness],
                        ["token efficiency", run.score.tokenEfficiency],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-mono">{pct(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground">{bench.summary}</p>
          </Section>
        </div>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Plan B demo integration · static fixtures · no secrets · the browser never calls
          OpenRouter
        </footer>
      </div>
    </main>
  );
}

export default PlanbDemo;
