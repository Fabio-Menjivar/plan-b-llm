import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Send,
  Bitcoin,
  Boxes,
  Code2,
  Monitor,
  Hammer,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Github,
  BookOpen,
  Terminal,
  Bot,
  Check,
  Circle,
  Cpu,
  Database,
  Scale,
  Palette,
  Loader2,
  Sun,
  Moon,
  Zap,
  Info,
} from "lucide-react";
import { FundWithLightningModal } from "@/components/FundWithLightningModal";
import { CodeIdeView } from "@/components/CodeIdeView";
import { GITHUB_REPOS } from "@/lib/links";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plan ₿uilder — Build Bitcoin apps with AI" },
      { name: "description", content: "An LLM-powered developer tool to design, architect, and ship Bitcoin applications." },
      { property: "og:title", content: "Plan ₿uilder" },
      { property: "og:description", content: "LLM-powered IDE for building Bitcoin apps." },
    ],
  }),
  component: PlanBuilder,
});

type Msg = { id: string; role: "user" | "assistant"; text: string };

const MODELS = [
  "gpt-5.4-pro",
  "claude-sonnet-4.5",
  "gemini-3-pro",
  "plan-b-local-7b",
];

function PlanBuilder() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const [tab, setTab] = useState<"architecture" | "code" | "preview">("architecture");
  const [building, setBuilding] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m0",
      role: "assistant",
      text: "gm. I'm optimized for Plan B Resources and curated GitHub repos. Describe the Bitcoin app you want to build — wallet, Lightning service, ordinals tool, mempool dashboard… anything.",
    },
  ]);

  // settings
  const [modality, setModality] = useState<"auto" | "ama">("auto");
  const [reqs, setReqs] = useState({ ux: true, db: true, legal: false });
  const [githubOpen, setGithubOpen] = useState(false);

  // theme + sats
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sats, setSats] = useState(50000);
  const [satsPulse, setSatsPulse] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [theme]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const t = input.trim();
    if (!t) return;
    const u: Msg = { id: crypto.randomUUID(), role: "user", text: t };
    setMessages((m) => [...m, u]);
    setInput("");
    // deduct sats — pay per prompt
    setSats((s) => Math.max(0, s - 15));
    setSatsPulse(true);
    setTimeout(() => setSatsPulse(false), 600);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `Drafting an architecture for "${t}". I'll scaffold the modules, suggest a Lightning integration path, and surface relevant Plan B references. Hit BUILD when you're ready.`,
        },
      ]);
    }, 600);
  }

  function triggerBuild() {
    setBuilding(true);
    setTab("preview");
    setTimeout(() => setBuilding(false), 1800);
  }

  function handleDepositComplete(amount: number) {
    setSats((s) => s + amount);
  }

  return (
    <TooltipProvider delayDuration={200}>
    <div className="relative flex h-screen w-full flex-col overflow-hidden text-foreground">
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/60 px-3 backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-md border border-border/70 bg-panel/70 text-muted-foreground transition hover:border-bitcoin/50 hover:text-bitcoin"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-bitcoin text-bitcoin-foreground shadow-glow">
              <Bitcoin className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-xs font-semibold tracking-tight sm:text-sm">
                Plan <span className="text-bitcoin">₿</span>uilder
              </div>
              <div className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
                bitcoin · dev · ide
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <Badge icon={<BookOpen className="h-3 w-3" />} label="Plan B Resources" />
            <GitHubReposDropdown open={githubOpen} onOpenChange={setGithubOpen} />
          </div>

          {/* Sats balance + fund */}
          <div className="flex items-center gap-1.5">
            <div className="group relative">
              <motion.div
                animate={satsPulse ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1 rounded-full border border-bitcoin/40 bg-bitcoin/10 px-2 py-1 font-mono text-[10px] text-bitcoin sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs"
              >
                <Zap className="h-3 w-3 fill-bitcoin sm:h-3.5 sm:w-3.5" />
                <span className="tabular-nums font-semibold">{sats.toLocaleString()}</span>
                <span className="hidden text-bitcoin/70 sm:inline">sats</span>
                <Info className="ml-0.5 hidden h-3 w-3 opacity-60 sm:block" />
              </motion.div>
              <div className="pointer-events-none absolute right-0 top-full z-40 mt-2 w-60 rounded-md border border-border bg-popover px-3 py-2 text-[11px] text-popover-foreground opacity-0 shadow-xl transition group-hover:opacity-100">
                <div className="font-semibold text-bitcoin">Pay per prompt & compute</div>
                <div className="mt-1 text-muted-foreground">
                  Each prompt deducts sats based on tokens and compute consumed. Top up anytime over Lightning.
                </div>
              </div>
              <AnimatePresence>
                {satsPulse && (
                  <motion.div
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute -bottom-4 right-2 font-mono text-[10px] font-bold text-bitcoin"
                  >
                    −15
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() => setFundOpen(true)}
              aria-label="Fund with Lightning"
              className="rounded-md border border-bitcoin/40 bg-[#F7931A]/10 px-2 py-1 font-mono text-[10px] font-semibold text-[#F7931A] transition hover:border-bitcoin/60 hover:bg-[#F7931A]/20 sm:px-2.5 sm:py-1.5 sm:text-[11px]"
            >
              Fund
            </button>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-md border border-border/70 bg-panel/70 text-muted-foreground transition hover:border-bitcoin/50 hover:text-bitcoin"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.span
                  key="moon"
                  initial={{ y: -16, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 16, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 grid place-items-center"
                >
                  <Moon className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ y: -16, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 16, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 grid place-items-center"
                >
                  <Sun className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Main split — stacked on mobile, side-by-side on desktop */}
      <main className="flex w-full flex-1 flex-col overflow-y-auto pt-14 md:flex-row md:overflow-hidden">
        {/* Chat panel */}
        <section className="flex h-[50vh] min-h-[280px] w-full shrink-0 flex-col border-b border-border/60 md:h-auto md:min-h-0 md:w-[55%] md:shrink md:border-b-0 md:border-r">
          {/* Chat header */}
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-panel/40 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-bitcoin" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
                conversation
              </span>
            </div>
            {/* Model select */}
            <div className="relative min-w-0">
              <button
                onClick={() => setModelOpen((v) => !v)}
                className="flex max-w-[160px] items-center gap-1.5 truncate rounded-md border border-border/70 bg-elevated px-2 py-1.5 font-mono text-[10px] hover:border-bitcoin/50 sm:max-w-none sm:gap-2 sm:px-3 sm:text-xs"
              >
                <Bot className="h-3.5 w-3.5 shrink-0 text-bitcoin" />
                <span className="truncate">{model}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition ${modelOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {modelOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 z-30 mt-1.5 w-56 overflow-hidden rounded-md border border-border bg-popover shadow-xl"
                  >
                    {MODELS.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setModel(m);
                          setModelOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 font-mono text-xs transition hover:bg-accent ${
                          m === model ? "text-bitcoin" : ""
                        }`}
                      >
                        {m}
                        {m === model && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-4 sm:gap-5">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 sm:gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-semibold sm:h-8 sm:w-8 ${
                      m.role === "user"
                        ? "bg-elevated text-foreground"
                        : "bg-bitcoin text-bitcoin-foreground"
                    }`}
                  >
                    {m.role === "user" ? "you" : <Bitcoin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed sm:max-w-[80%] sm:px-3.5 sm:py-2.5 ${
                      m.role === "user"
                        ? "border border-border/70 bg-panel"
                        : "border border-bitcoin/15 bg-bitcoin/[0.06]"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sticky input */}
          <div className="sticky bottom-0 border-t border-border/60 bg-background/80 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-end gap-1.5 rounded-xl border border-border bg-panel p-1.5 focus-within:border-bitcoin/60 focus-within:shadow-glow sm:gap-2 sm:p-2">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Describe your Bitcoin app…"
                  className="max-h-32 min-h-[32px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground sm:max-h-40 sm:min-h-[36px] sm:py-2"
                />
                <button
                  onClick={send}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-bitcoin text-bitcoin-foreground transition hover:bg-bitcoin-glow disabled:opacity-50"
                  disabled={!input.trim()}
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground sm:mt-2 sm:text-[10px]">
                <span className="truncate">↵ send · ⇧↵ newline</span>
                <span className="ml-2 hidden truncate sm:inline">context: Plan B + GitHub</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right panel: preview / arch / code */}
        <section className="flex min-h-[45vh] w-full min-w-0 flex-1 flex-col md:min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-panel/40 px-2 py-2 sm:px-3">
            <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto rounded-lg border border-border/70 bg-elevated p-0.5 sm:gap-1 sm:p-1">
              <TabBtn active={tab === "architecture"} onClick={() => setTab("architecture")} icon={<Boxes className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}>
                Architecture
              </TabBtn>
              <TabBtn active={tab === "code"} onClick={() => setTab("code")} icon={<Code2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}>
                Code
              </TabBtn>
              <TabBtn active={tab === "preview"} onClick={() => setTab("preview")} icon={<Monitor className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}>
                Preview
              </TabBtn>
            </div>
            <button
              onClick={triggerBuild}
              disabled={building}
              className="group flex shrink-0 items-center gap-1.5 rounded-md bg-bitcoin px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-bitcoin-foreground shadow-glow transition hover:bg-bitcoin-glow disabled:opacity-70 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
            >
              {building ? <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" /> : <Hammer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              {building ? "Building…" : "Build"}
            </button>
          </div>

          <div className="relative min-h-[320px] flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {tab === "architecture" && (
                <motion.div
                  key="arch"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-auto p-3 sm:p-6"
                >
                  <ArchitectureView />
                </motion.div>
              )}
              {tab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 p-2 sm:p-4"
                >
                  <CodeIdeView />
                </motion.div>
              )}
              {tab === "preview" && (
                <motion.div
                  key="prev"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 p-2 sm:p-4"
                >
                  <PreviewView building={building} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-40 flex w-full max-w-full flex-col border-r border-border bg-panel sm:w-[320px] sm:max-w-[85vw]"
            >
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-4 w-4 text-bitcoin" />
                  <span className="font-mono text-sm">Working Options</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <SectionLabel>Modalities</SectionLabel>
                <div className="mt-2">
                  <ModalitySwitch value={modality} onChange={setModality} />
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {modality === "auto"
                      ? "Let the agent decide flow automatically."
                      : "Ask clarifying questions before building."}
                  </p>
                </div>

                <SectionLabel className="mt-6">Project Requirements</SectionLabel>
                <div className="mt-2 space-y-1.5">
                  <Check3 icon={<Palette className="h-3.5 w-3.5" />} label="UX" tooltip="Ensures responsive design and accessibility standards." checked={reqs.ux} onChange={(v) => setReqs({ ...reqs, ux: v })} />
                  <Check3 icon={<Database className="h-3.5 w-3.5" />} label="DB" tooltip="Checks database schema and data integrity." checked={reqs.db} onChange={(v) => setReqs({ ...reqs, db: v })} />
                  <Check3 icon={<Scale className="h-3.5 w-3.5" />} label="Legal" tooltip="Verifies open-source licenses and compliance." checked={reqs.legal} onChange={(v) => setReqs({ ...reqs, legal: v })} />
                </div>

                <SectionLabel className="mt-6">Integrations</SectionLabel>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <DrawerExternalLink icon={<Terminal className="h-4 w-4" />} label="CLI Client" href="#" />
                  <DrawerExternalLink icon={<Bot className="h-4 w-4" />} label="Redirect Bot" href="#" />
                  <DrawerLink icon={<Github className="h-4 w-4" />} label="GitHub" />
                  <DrawerLink icon={<BookOpen className="h-4 w-4" />} label="Plan B Docs" />
                </div>

                <SectionLabel className="mt-6">Status</SectionLabel>
                <div className="mt-2 rounded-md border border-border/70 bg-elevated p-3 font-mono text-[11px] text-muted-foreground">
                  <div className="flex justify-between"><span>node</span><span className="text-success">synced</span></div>
                  <div className="flex justify-between"><span>height</span><span className="text-foreground">901,204</span></div>
                  <div className="flex justify-between"><span>peers</span><span className="text-foreground">12</span></div>
                </div>
              </div>

              <div className="border-t border-border/60 p-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                v0.1 · running on regtest
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <FundWithLightningModal
        open={fundOpen}
        onOpenChange={setFundOpen}
        onDepositComplete={handleDepositComplete}
      />
    </div>
    </TooltipProvider>
  );
}

/* ───────── Subcomponents ───────── */

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-bitcoin/30 bg-bitcoin/10 px-2.5 py-1 font-mono text-[11px] text-bitcoin">
      {icon}
      {label}
    </span>
  );
}

function GitHubReposDropdown({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="inline-flex items-center gap-1.5 rounded-full border border-bitcoin/30 bg-bitcoin/10 px-2.5 py-1 font-mono text-[11px] text-bitcoin transition hover:border-bitcoin/50 hover:bg-bitcoin/15"
      >
        <Github className="h-3 w-3" />
        GitHub Repos
        <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-md border border-border bg-popover shadow-xl"
          >
            <a
              href={GITHUB_REPOS.frontend}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 font-mono text-xs transition hover:bg-accent"
              onClick={() => onOpenChange(false)}
            >
              Frontend Repo
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
            <a
              href={GITHUB_REPOS.backend}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border-t border-border/60 px-3 py-2.5 font-mono text-xs transition hover:bg-accent"
              onClick={() => onOpenChange(false)}
            >
              Backend Repo
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalitySwitch({
  value,
  onChange,
}: {
  value: "auto" | "ama";
  onChange: (v: "auto" | "ama") => void;
}) {
  return (
    <div className="relative flex rounded-full border border-border/70 bg-[#121212] p-1">
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-bitcoin shadow-glow"
        animate={{ left: value === "auto" ? 4 : "calc(50%)" }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      />
      <button
        type="button"
        onClick={() => onChange("auto")}
        className={`relative z-10 flex-1 rounded-full py-2 text-center font-mono text-xs transition ${
          value === "auto" ? "font-semibold text-bitcoin-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Auto
      </button>
      <button
        type="button"
        onClick={() => onChange("ama")}
        className={`relative z-10 flex-1 rounded-full py-2 text-center font-mono text-xs transition ${
          value === "ama" ? "font-semibold text-bitcoin-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        AMA Before
      </button>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 font-mono text-[10px] transition sm:gap-1.5 sm:px-3 sm:text-xs ${
        active ? "bg-bitcoin text-bitcoin-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}

function Check3({
  icon,
  label,
  tooltip,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const labelEl = (
    <span className="cursor-help text-sm underline decoration-transparent decoration-dotted underline-offset-4 transition hover:decoration-muted-foreground/50">
      {label}
    </span>
  );

  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-accent"
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded border transition ${
          checked ? "border-bitcoin bg-bitcoin text-bitcoin-foreground" : "border-border bg-elevated"
        }`}
      >
        {checked ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2 opacity-0" />}
      </span>
      <span className="text-muted-foreground">{icon}</span>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{labelEl}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="max-w-[220px] border border-border bg-[#27272A] px-3 py-2 text-[11px] leading-snug text-foreground shadow-xl"
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      ) : (
        labelEl
      )}
    </button>
  );
}

function DrawerExternalLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-md border border-border/70 bg-elevated px-3 py-2.5 text-left text-sm transition hover:border-bitcoin/40 hover:text-bitcoin"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

function DrawerLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 rounded-md border border-border/70 bg-elevated px-3 py-2.5 text-left text-sm transition hover:border-bitcoin/40 hover:text-bitcoin">
      {icon}
      {label}
    </button>
  );
}

/* Architecture diagram (static-but-pretty) */
function ArchitectureView() {
  const nodes = [
    { id: "ui", label: "UI / React", x: 50, y: 10, group: "client" },
    { id: "api", label: "API Gateway", x: 50, y: 35, group: "edge" },
    { id: "ln", label: "Lightning Node", x: 15, y: 65, group: "btc" },
    { id: "btc", label: "Bitcoin Core", x: 50, y: 65, group: "btc" },
    { id: "idx", label: "Indexer", x: 85, y: 65, group: "btc" },
    { id: "db", label: "Postgres", x: 50, y: 90, group: "data" },
  ];
  const edges: [string, string][] = [
    ["ui", "api"],
    ["api", "ln"],
    ["api", "btc"],
    ["api", "idx"],
    ["ln", "db"],
    ["btc", "db"],
    ["idx", "db"],
  ];
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            project graph
          </div>
          <h2 className="mt-1 text-lg font-semibold">lightning-tip-jar</h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <Cpu className="h-3.5 w-3.5" /> 6 nodes · 7 edges
        </div>
      </div>

      <div className="relative h-[280px] overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_1px_1px,theme(colors.border)_1px,transparent_0)] [background-size:18px_18px] sm:h-[380px] md:h-[460px]">
        <svg className="absolute inset-0 h-full w-full">
          {edges.map(([a, b], i) => {
            const A = map[a], B = map[b];
            return (
              <line
                key={i}
                x1={`${A.x}%`} y1={`${A.y}%`}
                x2={`${B.x}%`} y2={`${B.y}%`}
                stroke="var(--bitcoin)"
                strokeOpacity="0.35"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>
        {nodes.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div className="flex min-w-[140px] items-center gap-2 rounded-lg border border-bitcoin/30 bg-panel/90 px-3 py-2 shadow-lg backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-bitcoin shadow-glow" />
              <span className="font-mono text-xs">{n.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { k: "Stack", v: "TS · React · Fastify" },
          { k: "Chain", v: "Bitcoin · LN" },
          { k: "Deploy", v: "Docker · Fly.io" },
        ].map((c) => (
          <div key={c.k} className="rounded-lg border border-border/70 bg-panel/60 px-3 py-2.5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.k}</div>
            <div className="mt-0.5 text-sm">{c.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewView({ building }: { building: boolean }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-elevated">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border/70 bg-panel px-3 py-2">
        <span className="h-3 w-3 rounded-full bg-destructive/70" />
        <span className="h-3 w-3 rounded-full bg-bitcoin/80" />
        <span className="h-3 w-3 rounded-full bg-success/70" />
        <div className="ml-3 flex-1 rounded-md border border-border bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground">
          https://lightning-tip-jar.local
        </div>
      </div>

      <div className="relative flex-1 overflow-auto bg-background">
        {building ? (
          <div className="grid h-full place-items-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-bitcoin" />
              <div className="font-mono text-xs uppercase tracking-widest">compiling · linking · deploying</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md p-8">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-bitcoin text-bitcoin-foreground shadow-glow">
              <Bitcoin className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">Lightning Tip Jar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Send a few sats. Powered by LNURL-pay.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-panel p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                amount
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">2,100</span>
                <span className="text-sm text-muted-foreground">sats</span>
              </div>
              <button className="mt-4 w-full rounded-lg bg-bitcoin py-2.5 font-mono text-sm font-semibold text-bitcoin-foreground hover:bg-bitcoin-glow">
                ⚡ Pay invoice
              </button>
            </div>
            <div className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
              built with Plan ₿uilder
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
