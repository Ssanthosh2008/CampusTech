# CampusTech

> The campus signal for lost and found. A modern, mobile-first web application for finding, reporting, and returning misplaced belongings on campus.

Developed by **Pughal Jeyaprakash**.

---

## ⚡ Tech Stack

- **Framework & Runtime:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Build Tool:** [Vite 6](https://vitejs.dev/) with `@vitejs/plugin-react`
- **Styling & Tokens:** [Tailwind CSS](https://tailwindcss.com/) with custom design tokens for light & dark mode
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) primitives (Card, Sheet, Dialog, Button, Badge, Input, Select, ToggleGroup, Sonner, AlertDialog)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL 15+, Supabase Auth with Google OAuth, Storage bucket `item-images`)
- **Icons:** [lucide-react](https://lucide.dev/)

---

## 🚀 Features

- **Hash-based Routing:** 100% static hosting compatibility with deep links:
  - `#/browse` — Main feed with live search, item type filter (All, Lost, Found, Returned), category chips, and 20-item pagination.
  - `#/login` — Animated signal matrix auth screen, Google OAuth sign-in, and admin password login.
  - `#/mine` — Manage items you posted, mark items as returned, or delete listings.
  - `#/reports` — Admin moderation feed to review reported images, inspect flagged posts, and take action.
  - `#item=<id>` — Deep link directly opens the detail sheet for any item.
- **Privacy First:** Contact details are private and only revealed to signed-in users.
- **Image Upload & Moderation:** Image uploads to Supabase storage bucket `item-images`, with non-blocking face detection and image reporting for admins.
- **Safe Fallbacks & Demo Mode:** Works out of the box even without environment variables set, with safe demo mode fallbacks when Supabase credentials are missing.
- **Dark Mode Support:** Automatic dark mode via `prefers-color-scheme: dark` and Tailwind dark mode class.
- **Mobile-First Design:** Fixed bottom navigation bar with elevated FAB, safe-area padding for modern mobile notches and home bars, and horizontal scroll hints.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Pughal/CampusTech.git
cd CampusTech

# Install dependencies
npm install
```

### Environment Variables

The project includes built-in public fallbacks for the Supabase instance so you can run and build the project immediately with zero configuration. To connect your own Supabase project:

1. Copy the `.env.example` file:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your Supabase project credentials:
   ```ini
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Development

```bash
npm run dev
```

Opens the local development server at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Performs strict TypeScript type-checking (`tsc -b`) and produces optimized static assets in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting & Formatting

```bash
npm run lint      # Run ESLint across all TypeScript and React files
npm run format    # Format all files with Prettier
```

---

## 📂 Project Structure

```text
CampusTech/
├── .env.example                 # Example environment variables
├── .gitignore                   # Ignored files (dist, node_modules, etc.)
├── components.json              # shadcn/ui configuration
├── eslint.config.js             # ESLint flat config
├── index.html                   # HTML entry point with viewport and fonts
├── package.json                 # Dependencies and npm scripts
├── postcss.config.js            # PostCSS configuration for Tailwind
├── README.md                    # Project documentation
├── SPEC.md                      # Architecture specification and decisions log
├── tailwind.config.js           # Tailwind theme and brand tokens
├── tsconfig.json                # TypeScript project configuration
├── vite.config.ts               # Vite configuration with @/* path alias
├── src/
│   ├── main.tsx                 # React DOM root render
│   ├── App.tsx                  # App layout, router switch, global alerts
│   ├── index.css                # Design system tokens and styles
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces and schema types
│   ├── lib/
│   │   ├── config.ts            # Environment config with safe fallbacks
│   │   ├── supabase.ts          # Initialized Supabase client
│   │   ├── api.ts               # Typed Supabase API functions
│   │   └── utils.ts             # shadcn helper utilities
│   ├── context/
│   │   ├── AuthContext.tsx      # Auth state, session, and role management
│   │   └── HashRouterContext.tsx# Hash-based routing context
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Topbar, BottomNav, DemoBanner, Layout
│   │   ├── items/               # ItemCard, ItemGrid, ItemDetailSheet, PostFormSheet, ReturnFormSheet
│   │   ├── filters/             # BrowseFilters, HeroSection
│   │   └── admin/               # AdminLoginSheet, AdminEditSheet
│   └── pages/
│       ├── BrowsePage.tsx       # Browse lost and found items
│       ├── LoginPage.tsx        # Sign-in and admin login view
│       ├── MinePage.tsx         # User's items dashboard
│       └── ReportsPage.tsx      # Admin image moderation reports
└── supabase/
    └── 20261101000000_contact_privacy.sql # Migration for contact privacy RLS/RPC
```

---

## 🔒 Security & Privacy Notice

- **Contact Info Protection:** The public `listItems` query intentionally omits the `contact` field. Contact information is only retrieved through `getItemContact` when an authenticated session exists.
- **BlazeFace Detection:** Client-side face detection runs with a non-blocking timeout fallback to ensure image uploads succeed even when external CDN weights are unreachable.
- **SQL Migration:** Run `supabase/20261101000000_contact_privacy.sql` in your Supabase SQL editor to enforce row-level contact privacy on the database layer.

---

## 🚢 Deployment

CampusTech compiles to purely static files in `dist/`.

- **Vercel:** Configure the project's **Output Directory** to `dist` and **Build Command** to `npm run build`.
- **Static Hosts (GitHub Pages, Cloudflare Pages, Netlify):** Deploy the `dist/` folder directly. Hash-based routing ensures routes work on any static file server without URL rewrites.
