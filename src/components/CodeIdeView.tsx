import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  PanelLeft,
  Search,
  Settings,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type FileId =
  | "src/main.rs"
  | "src/bolt_core.rs"
  | "src/rust_agent.rs"
  | "bolt_protocol.md"
  | "main.vors.md";

type ActivityPanel = "files" | "search" | "git" | "settings";

const DEFAULT_FILE: FileId = "src/bolt_core.rs";
const LINE_COUNT = 15;

const FILE_LANGUAGE: Record<FileId, string> = {
  "src/main.rs": "Rust",
  "src/bolt_core.rs": "Rust",
  "src/rust_agent.rs": "Rust",
  "bolt_protocol.md": "Markdown",
  "main.vors.md": "Markdown",
};

function CodeLine({ children }: { children: React.ReactNode }) {
  return <div className="whitespace-pre">{children}</div>;
}

const FILE_LINES: Record<FileId, React.ReactNode[]> = {
  "src/bolt_core.rs": [
    <CodeLine key="1"><span className="ide-cmt">{"// Boltz reverse submarine swap core"}</span></CodeLine>,
    <CodeLine key="2"><span className="ide-kw">use</span> <span className="ide-var">boltz</span><span className="ide-punct">::</span><span className="ide-type">SwapClient</span><span className="ide-punct">;</span></CodeLine>,
    <CodeLine key="3">&nbsp;</CodeLine>,
    <CodeLine key="4"><span className="ide-kw">pub struct</span> <span className="ide-type">BoltCore</span> <span className="ide-punct">{"{"}</span></CodeLine>,
    <CodeLine key="5">{"    "}<span className="ide-var">client</span><span className="ide-punct">:</span> <span className="ide-type">SwapClient</span><span className="ide-punct">,</span></CodeLine>,
    <CodeLine key="6"><span className="ide-punct">{"}"}</span></CodeLine>,
    <CodeLine key="7">&nbsp;</CodeLine>,
    <CodeLine key="8"><span className="ide-kw">impl</span> <span className="ide-type">BoltCore</span> <span className="ide-punct">{"{"}</span></CodeLine>,
    <CodeLine key="9">{"    "}<span className="ide-kw">pub fn</span> <span className="ide-fn">create_invoice</span><span className="ide-punct">(</span><span className="ide-kw">&amp;</span><span className="ide-var">self</span><span className="ide-punct">,</span> <span className="ide-var">sats</span><span className="ide-punct">:</span> <span className="ide-type">u64</span><span className="ide-punct">)</span> <span className="ide-punct">{"->"}</span> <span className="ide-type">String</span> <span className="ide-punct">{"{"}</span></CodeLine>,
    <CodeLine key="10">{"        "}<span className="ide-kw">let</span> <span className="ide-var">swap</span> <span className="ide-punct">=</span> <span className="ide-var">self</span><span className="ide-punct">.</span><span className="ide-var">client</span><span className="ide-punct">.</span><span className="ide-fn">reverse_swap</span><span className="ide-punct">(</span><span className="ide-var">sats</span><span className="ide-punct">);</span></CodeLine>,
    <CodeLine key="11">{"        "}<span className="ide-kw">return</span> <span className="ide-var">swap</span><span className="ide-punct">.</span><span className="ide-var">invoice</span><span className="ide-punct">;</span></CodeLine>,
    <CodeLine key="12">{"    "}<span className="ide-punct">{"}"}</span></CodeLine>,
    <CodeLine key="13"><span className="ide-punct">{"}"}</span></CodeLine>,
    <CodeLine key="14">&nbsp;</CodeLine>,
    <CodeLine key="15"><span className="ide-cmt">{"// export bridge -> TypeScript agent"}</span></CodeLine>,
  ],
  "src/main.rs": [
    <CodeLine key="1"><span className="ide-cmt">{"// Plan B Builder entrypoint"}</span></CodeLine>,
    <CodeLine key="2"><span className="ide-kw">mod</span> <span className="ide-var">bolt_core</span><span className="ide-punct">;</span></CodeLine>,
    <CodeLine key="3"><span className="ide-kw">mod</span> <span className="ide-var">rust_agent</span><span className="ide-punct">;</span></CodeLine>,
    <CodeLine key="4">&nbsp;</CodeLine>,
    <CodeLine key="5"><span className="ide-kw">use</span> <span className="ide-var">bolt_core</span><span className="ide-punct">::</span><span className="ide-type">BoltCore</span><span className="ide-punct">;</span></CodeLine>,
    <CodeLine key="6"><span className="ide-kw">use</span> <span className="ide-var">rust_agent</span><span className="ide-punct">::</span><span className="ide-type">PlanAgent</span><span className="ide-punct">;</span></CodeLine>,
    <CodeLine key="7">&nbsp;</CodeLine>,
    <CodeLine key="8"><span className="ide-kw">fn</span> <span className="ide-fn">main</span><span className="ide-punct">()</span> <span className="ide-punct">{"{"}</span></CodeLine>,
    <CodeLine key="9">{"    "}<span className="ide-kw">let</span> <span className="ide-var">core</span> <span className="ide-punct">=</span> <span className="ide-type">BoltCore</span><span className="ide-punct">::</span><span className="ide-fn">init</span><span className="ide-punct">();</span></CodeLine>,
    <CodeLine key="10">{"    "}<span className="ide-kw">let</span> <span className="ide-var">agent</span> <span className="ide-punct">=</span> <span className="ide-type">PlanAgent</span><span className="ide-punct">::</span><span className="ide-fn">boot</span><span className="ide-punct">();</span></CodeLine>,
    <CodeLine key="11">{"    "}<span className="ide-kw">let</span> <span className="ide-var">invoice</span> <span className="ide-punct">=</span> <span className="ide-var">core</span><span className="ide-punct">.</span><span className="ide-fn">create_invoice</span><span className="ide-punct">(</span><span className="ide-num">50000</span><span className="ide-punct">);</span></CodeLine>,
    <CodeLine key="12">{"    "}<span className="ide-var">agent</span><span className="ide-punct">.</span><span className="ide-fn">run</span><span className="ide-punct">(</span><span className="ide-var">invoice</span><span className="ide-punct">);</span></CodeLine>,
    <CodeLine key="13"><span className="ide-punct">{"}"}</span></CodeLine>,
    <CodeLine key="14">&nbsp;</CodeLine>,
    <CodeLine key="15"><span className="ide-cmt">{"// pay-per-prompt sats billing loop"}</span></CodeLine>,
  ],
  "src/rust_agent.rs": [
    <CodeLine key="1"><span className="ide-cmt">{"// LLM agent orchestration layer"}</span></CodeLine>,
    <CodeLine key="2"><span className="ide-kw">export async function</span> <span className="ide-fn">runAgent</span><span className="ide-punct">(</span><span className="ide-var">prompt</span><span className="ide-punct">:</span> <span className="ide-type">string</span><span className="ide-punct">)</span> <span className="ide-punct">{"{"}</span></CodeLine>,
    <CodeLine key="3">{"  "}<span className="ide-kw">const</span> <span className="ide-var">cost</span> <span className="ide-punct">=</span> <span className="ide-num">15</span><span className="ide-punct">;</span></CodeLine>,
    <CodeLine key="4">{"  "}<span className="ide-kw">let</span> <span className="ide-var">balance</span> <span className="ide-punct">=</span> <span className="ide-fn">deductSats</span><span className="ide-punct">(</span><span className="ide-var">cost</span><span className="ide-punct">);</span></CodeLine>,
    <CodeLine key="5">{"  "}<span className="ide-kw">return</span> <span className="ide-fn">generateArchitecture</span><span className="ide-punct">(</span><span className="ide-var">prompt</span><span className="ide-punct">,</span> <span className="ide-var">balance</span><span className="ide-punct">);</span></CodeLine>,
    <CodeLine key="6"><span className="ide-punct">{"}"}</span></CodeLine>,
    <CodeLine key="7">&nbsp;</CodeLine>,
    <CodeLine key="8"><span className="ide-kw">pub struct</span> <span className="ide-type">PlanAgent</span> <span className="ide-punct">{"{"}</span></CodeLine>,
    <CodeLine key="9">{"    "}<span className="ide-var">model</span><span className="ide-punct">:</span> <span className="ide-type">String</span><span className="ide-punct">,</span></CodeLine>,
    <CodeLine key="10"><span className="ide-punct">{"}"}</span></CodeLine>,
    <CodeLine key="11">&nbsp;</CodeLine>,
    <CodeLine key="12"><span className="ide-kw">impl</span> <span className="ide-type">PlanAgent</span> <span className="ide-punct">{"{"}</span></CodeLine>,
    <CodeLine key="13">{"    "}<span className="ide-kw">pub fn</span> <span className="ide-fn">run</span><span className="ide-punct">(</span><span className="ide-kw">&amp;</span><span className="ide-var">self</span><span className="ide-punct">,</span> <span className="ide-var">ctx</span><span className="ide-punct">:</span> <span className="ide-type">String</span><span className="ide-punct">)</span> <span className="ide-punct">{"{"}</span> <span className="ide-cmt">{"/* ... */"}</span> <span className="ide-punct">{"}"}</span></CodeLine>,
    <CodeLine key="14"><span className="ide-punct">{"}"}</span></CodeLine>,
    <CodeLine key="15"><span className="ide-cmt">{"// bridges Rust core + TS UI"}</span></CodeLine>,
  ],
  "bolt_protocol.md": [
    <CodeLine key="1"><span className="ide-md">{"# Boltz Reverse Submarine Swap"}</span></CodeLine>,
    <CodeLine key="2"><span className="ide-md">{"## Flow"}</span></CodeLine>,
    <CodeLine key="3"><span className="ide-md">{"1. User connects MetaMask (EVM)"}</span></CodeLine>,
    <CodeLine key="4"><span className="ide-md">{"2. Generate Lightning invoice via Boltz"}</span></CodeLine>,
    <CodeLine key="5"><span className="ide-md">{"3. Pay invoice -> status: Pending Payment"}</span></CodeLine>,
    <CodeLine key="6"><span className="ide-md">{"4. Swap settles -> status: Paid"}</span></CodeLine>,
    <CodeLine key="7"><span className="ide-md">{"5. Claim on-chain -> status: Claimed"}</span></CodeLine>,
    <CodeLine key="8">&nbsp;</CodeLine>,
    <CodeLine key="9"><span className="ide-md">{"```typescript"}</span></CodeLine>,
    <CodeLine key="10"><span className="ide-kw">export</span> <span className="ide-kw">function</span> <span className="ide-fn">fundAccount</span><span className="ide-punct">(</span><span className="ide-var">sats</span><span className="ide-punct">:</span> <span className="ide-type">number</span><span className="ide-punct">)</span> <span className="ide-punct">{"{"}</span></CodeLine>,
    <CodeLine key="11">{"  "}<span className="ide-kw">return</span> <span className="ide-fn">boltz</span><span className="ide-punct">.</span><span className="ide-fn">createReverseSwap</span><span className="ide-punct">({"{"}</span> <span className="ide-var">amount</span><span className="ide-punct">:</span> <span className="ide-var">sats</span> <span className="ide-punct">{"});"}</span></CodeLine>,
    <CodeLine key="12"><span className="ide-md">{"```"}</span></CodeLine>,
    <CodeLine key="13">&nbsp;</CodeLine>,
    <CodeLine key="14"><span className="ide-md">{"- Invoice prefix: `lnbc100u1...`"}</span></CodeLine>,
    <CodeLine key="15"><span className="ide-md">{"- Wallet: `0x71C...3a90`"}</span></CodeLine>,
  ],
  "main.vors.md": [
    <CodeLine key="1"><span className="ide-md">{"# main.vors — Verifiable Output Rust Spec"}</span></CodeLine>,
    <CodeLine key="2">&nbsp;</CodeLine>,
    <CodeLine key="3"><span className="ide-md">{"## Objectives"}</span></CodeLine>,
    <CodeLine key="4"><span className="ide-md">{"- Strict Bitcoin palette (#F7931A)"}</span></CodeLine>,
    <CodeLine key="5"><span className="ide-md">{"- Pay-per-use LLM compute in sats"}</span></CodeLine>,
    <CodeLine key="6"><span className="ide-md">{"- Boltz EVM billing integration"}</span></CodeLine>,
    <CodeLine key="7">&nbsp;</CodeLine>,
    <CodeLine key="8"><span className="ide-md">{"```rust"}</span></CodeLine>,
    <CodeLine key="9"><span className="ide-kw">let</span> <span className="ide-var">agent</span> <span className="ide-punct">=</span> <span className="ide-type">PlanAgent</span><span className="ide-punct">::</span><span className="ide-fn">boot</span><span className="ide-punct">();</span></CodeLine>,
    <CodeLine key="10"><span className="ide-kw">let</span> <span className="ide-var">output</span> <span className="ide-punct">=</span> <span className="ide-var">agent</span><span className="ide-punct">.</span><span className="ide-fn">generate</span><span className="ide-punct">(</span><span className="ide-str">"lightning-tip-jar"</span><span className="ide-punct">);</span></CodeLine>,
    <CodeLine key="11"><span className="ide-kw">return</span> <span className="ide-var">output</span><span className="ide-punct">;</span></CodeLine>,
    <CodeLine key="12"><span className="ide-md">{"```"}</span></CodeLine>,
    <CodeLine key="13">&nbsp;</CodeLine>,
    <CodeLine key="14"><span className="ide-md">{"## Components"}</span></CodeLine>,
    <CodeLine key="15"><span className="ide-md">{"`src/` · `components/` · `bolt_core.rs`"}</span></CodeLine>,
  ],
};

type TreeNode =
  | { kind: "folder"; name: string; children: TreeNode[] }
  | { kind: "file"; id: FileId; name: string };

const FILE_TREE: TreeNode[] = [
  {
    kind: "folder",
    name: "src",
    children: [
      { kind: "file", id: "src/main.rs", name: "main.rs" },
      { kind: "file", id: "src/bolt_core.rs", name: "bolt_core.rs" },
      { kind: "file", id: "src/rust_agent.rs", name: "rust_agent.rs" },
    ],
  },
  { kind: "folder", name: "components", children: [] },
  { kind: "file", id: "bolt_protocol.md", name: "bolt_protocol.md" },
  { kind: "file", id: "main.vors.md", name: "main.vors.md" },
];

function fileIcon(name: string) {
  if (name.endsWith(".md")) return <FileText className="h-3.5 w-3.5 shrink-0 text-[#F7931A]" />;
  return <FileCode className="h-3.5 w-3.5 shrink-0 text-[#61afef]" />;
}

function TreeItem({
  node,
  depth,
  expanded,
  onToggleFolder,
  activeFile,
  onOpenFile,
}: {
  node: TreeNode;
  depth: number;
  expanded: Record<string, boolean>;
  onToggleFolder: (name: string) => void;
  activeFile: FileId;
  onOpenFile: (id: FileId) => void;
}) {
  if (node.kind === "folder") {
    const isOpen = expanded[node.name] ?? true;
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggleFolder(node.name)}
          className="flex w-full items-center gap-1 rounded px-2 py-1 text-left font-mono text-[11px] text-foreground/90 hover:bg-foreground/5"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          {isOpen ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#F7931A]/80" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-[#F7931A]/80" />
          )}
          <span>{node.name}</span>
        </button>
        {isOpen &&
          node.children.map((child) => (
            <TreeItem
              key={child.kind === "file" ? child.id : child.name}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggleFolder={onToggleFolder}
              activeFile={activeFile}
              onOpenFile={onOpenFile}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenFile(node.id)}
      className={cn(
        "flex w-full items-center gap-1.5 rounded py-1 pr-2 text-left font-mono text-[11px] hover:bg-foreground/5",
        activeFile === node.id ? "bg-[#F7931A]/15 text-[#F7931A]" : "text-foreground/80",
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      {fileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function CodeIdeView() {
  const [activeFile, setActiveFile] = useState<FileId>(DEFAULT_FILE);
  const [openTabs, setOpenTabs] = useState<FileId[]>([DEFAULT_FILE]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    components: false,
  });
  const [activityPanel, setActivityPanel] = useState<ActivityPanel>("files");
  const [explorerOpen, setExplorerOpen] = useState(false);

  function openFile(id: FileId) {
    setActiveFile(id);
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
    setExplorerOpen(false);
  }

  function closeTab(id: FileId, e: React.MouseEvent) {
    e.stopPropagation();
    setOpenTabs((tabs) => {
      const next = tabs.filter((t) => t !== id);
      if (next.length === 0) {
        setActiveFile(DEFAULT_FILE);
        return [DEFAULT_FILE];
      }
      if (activeFile === id) {
        const idx = tabs.indexOf(id);
        setActiveFile(next[Math.min(idx, next.length - 1)]);
      }
      return next;
    });
  }

  function toggleFolder(name: string) {
    setExpandedFolders((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  const tabLabel = (id: FileId) => id.split("/").pop() ?? id;
  const lines = FILE_LINES[activeFile];

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-border">
      <div className="relative flex min-h-0 flex-1">
        {/* Activity bar */}
        <div
          className="hidden w-11 shrink-0 flex-col items-center gap-3 border-r border-border/60 py-3 sm:flex"
          style={{ backgroundColor: "var(--ide-activity)" }}
        >
          {(
            [
              { id: "files" as const, icon: PanelLeft, label: "Explorer" },
              { id: "search" as const, icon: Search, label: "Search" },
              { id: "git" as const, icon: GitBranch, label: "Source Control" },
              { id: "settings" as const, icon: Settings, label: "Settings" },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              onClick={() => {
                setActivityPanel(id);
                if (id === "files") setExplorerOpen(true);
              }}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-md transition",
                activityPanel === id
                  ? "border-l-2 border-[#F7931A] bg-foreground/5 text-[#F7931A]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Explorer sidebar — hidden on mobile unless toggled */}
        <div
          className={cn(
            "z-30 shrink-0 flex-col border-r border-border/60",
            "absolute inset-y-0 left-0 w-[220px] shadow-xl sm:relative sm:flex",
            explorerOpen ? "flex" : "hidden sm:flex",
          )}
          style={{ backgroundColor: "var(--ide-sidebar)" }}
        >
          <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Explorer
            </span>
            <button
              type="button"
              aria-label="Close explorer"
              onClick={() => setExplorerOpen(false)}
              className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-foreground/5 sm:hidden"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {FILE_TREE.map((node) => (
              <TreeItem
                key={node.kind === "file" ? node.id : node.name}
                node={node}
                depth={0}
                expanded={expandedFolders}
                onToggleFolder={toggleFolder}
                activeFile={activeFile}
                onOpenFile={openFile}
              />
            ))}
          </div>
        </div>

        {/* Mobile explorer backdrop */}
        {explorerOpen && (
          <button
            type="button"
            aria-label="Close explorer overlay"
            className="absolute inset-0 z-10 bg-black/40 sm:hidden"
            onClick={() => setExplorerOpen(false)}
          />
        )}

        {/* Editor column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile explorer toggle + tab bar */}
          <div
            className="flex items-center gap-1 overflow-x-auto border-b border-border/60 px-1"
            style={{ backgroundColor: "var(--ide-tab-bar)" }}
          >
            <button
              type="button"
              aria-label="Toggle explorer"
              onClick={() => setExplorerOpen((v) => !v)}
              className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded text-muted-foreground hover:bg-foreground/5 sm:hidden"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            {openTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFile(tab)}
                className={cn(
                  "group flex max-w-[140px] shrink-0 items-center gap-1.5 border-r border-border/30 px-3 py-2 font-mono text-[11px]",
                  activeFile === tab
                    ? "border-t-2 border-t-[#F7931A] bg-[var(--ide-editor)] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5",
                )}
                style={activeFile === tab ? { backgroundColor: "var(--ide-editor)" } : undefined}
              >
                {fileIcon(tabLabel(tab) ?? "")}
                <span className="truncate">{tabLabel(tab)}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => closeTab(tab, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") closeTab(tab, e as unknown as React.MouseEvent);
                  }}
                  className="ml-0.5 rounded p-0.5 opacity-0 transition hover:bg-foreground/10 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>

          {/* Code window */}
          <div className="flex min-h-0 flex-1 overflow-auto" style={{ backgroundColor: "var(--ide-editor)" }}>
            <div
              className="select-none border-r border-border/30 px-3 py-3 text-right font-mono text-[11px] leading-6"
              style={{ color: "var(--ide-line-number)" }}
            >
              {Array.from({ length: LINE_COUNT }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            <pre className="flex-1 overflow-x-auto p-3 font-mono text-[12px] leading-6 sm:text-[13px]">
              <code>{lines}</code>
            </pre>
          </div>

          {/* Status bar */}
          <div
            className="flex items-center justify-between border-t border-border/40 px-3 py-1 font-mono text-[10px] text-white"
            style={{ backgroundColor: "var(--ide-status)" }}
          >
            <span>
              {FILE_LANGUAGE[activeFile]} · UTF-8 · LF
            </span>
            <span>Ln {LINE_COUNT}, Col 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
