# Plan ₿uilder

**Plan ₿uilder** is an LLM-powered IDE built specifically for designing, architecting, and shipping Bitcoin applications. Describe your app in natural language, explore architecture graphs and generated code, preview the UI, and pay for AI compute with sats — all inside a developer-first workspace tuned for the Bitcoin stack.

Built for hackathons and rapid prototyping on **Plan B Resources**, with curated GitHub repos, Lightning-native billing, and a strict Bitcoin visual identity.

---

## Key Features

- **Deep Dark Mode UI** — Slate charcoal panels (`#27272A`, `#121212`) with Bitcoin Orange (`#F7931A`) accents throughout the interface.
- **Split IDE Layout** — Conversational AI chat on the left; Architecture, Code, and Preview tabs on the right for a full build loop.
- **Pay-Per-Use AI** — Every prompt deducts sats from your balance. Top up anytime via the Lightning funding flow.
- **Boltz Reverse Submarine Swap (Demo)** — Connect MetaMask, generate a Lightning invoice, and simulate the Boltz deposit path from EVM to sats balance.
- **Project Settings Sidebar** — Modality toggle (Auto vs AMA Before), requirement checklists (UX, DB, Legal), and integration shortcuts.
- **Mobile Responsive** — Stacked layout on small screens, full-width settings drawer, and touch-friendly controls.

---

## Tech Stack

- [TanStack Start](https://tanstack.com/start) + [Vite](https://vitejs.dev/)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Lucide React](https://lucide.dev/) icons

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open the URL shown in your terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

---

## Usage

1. **Chat** — Describe the Bitcoin app you want to build (e.g. Lightning tip jar, mempool dashboard, ordinals tool).
2. **Architecture / Code / Preview** — Review the generated project graph, TypeScript scaffold, and live preview.
3. **Fund** — Click **Fund** in the header to open the Lightning modal, generate an invoice, and simulate payment to refill your sats balance.
4. **Settings** — Open the hamburger menu to switch modality, toggle project requirements, and access integrations.

---

## License

MIT — see repository license file for details.
