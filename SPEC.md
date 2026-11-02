# CampusTech — Project Specification & Modernization Plan

## 1. Overview
CampusTech is a mobile-first campus lost-and-found web application designed to help university students and faculty find, report, and return misplaced personal belongings. Users can browse, search, and filter lost or found items, publish listings with details and photos, view contact info (locked to authenticated users), record item returns, and flag inappropriate images for administrative moderation.

## 2. Stack (Before and After)

### Before (Legacy)
- **Language & Runtime:** Vanilla JavaScript (ES Modules), HTML5, CSS3.
- **Framework:** None (Zero-framework / Vanilla DOM manipulation with template literals).
- **Styling:** Plain CSS with CSS Custom Properties (`style.css`, `admin.css`) and responsive media queries.
- **Fonts:** Plus Jakarta Sans, Smooch Sans, Space Mono via Google Fonts.
- **Dependencies:** Loaded via CDN (`@supabase/supabase-js@2.45.4`, `@tensorflow-models/blazeface@0.0.7`).
- **Build / Tooling:** None (no `package.json`, bundler, linter, or TypeScript).
- **Backend:** Supabase (PostgreSQL 15+, Auth, Storage bucket `item-images`, RLS).
- **Hosting Configs:** Vercel (`vercel.json`) & Firebase Hosting (`firebase.json`).

### After (Modernized)
- **Language & Runtime:** TypeScript (Strict), React 19 / React DOM.
- **Build Tool:** Vite 6 with `@vitejs/plugin-react`.
- **Styling:** Tailwind CSS v4 / PostCSS with unified design tokens (theme variables for light/dark mode, accent `#f0642f`).
- **UI Components:** shadcn/ui components built on Radix UI primitives.
- **Forms & Validation:** React Hook Form + Zod schema validation.
- **Notifications:** Sonner toast manager.
- **Routing:** Hash-based router maintaining 100% route compatibility (`#/browse`, `#/login`, `#/mine`, `#/reports`, `#item=<id>`).
- **Fonts:** Standardized on `Plus Jakarta Sans` as the primary sans font.
- **State & Auth:** React Context (`AuthProvider`) wrapping typed Supabase client with safe demo mode fallback.
- **Code Quality:** ESLint with TypeScript ESLint, Prettier, strict compile checks (`tsc --noEmit`).

## 3. Project Structure (Target)

```text
CampusTech/
├── .env.example                 # Example environment variables with documentation
├── .gitignore                   # Git ignore for node_modules, dist, env, OS files
├── eslint.config.js             # Modern flat ESLint configuration
├── index.html                   # HTML entry point with viewport, theme color, root mount
├── package.json                 # Project dependencies, scripts, metadata
├── postcss.config.js            # PostCSS configuration for Tailwind
├── README.md                    # Project documentation
├── SPEC.md                      # Project architecture and technical specification
├── tsconfig.json                # TypeScript project configuration with @/* path alias
├── tsconfig.node.json           # Vite node configuration
├── vite.config.ts               # Vite configuration with @ path alias and build settings
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Root layout, routing switch, and notification providers
│   ├── index.css                # Tailwind imports and design system theme variables
│   ├── types/
│   │   └── index.ts             # Item, Profile, Return, Report, and Filter type definitions
│   ├── lib/
│   │   ├── utils.ts             # shadcn cn() utility and formatting helpers
│   │   ├── supabase.ts          # Typed Supabase client with safe fallback config
│   │   └── api.ts               # Robust, typed CRUD actions and image processing
│   ├── context/
│   │   └── AuthContext.tsx      # Auth state, session management, and admin verification
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (button, card, dialog, sheet, etc.)
│   │   ├── layout/              # Topbar, BottomNav, DemoBanner
│   │   ├── items/               # ItemCard, ItemGrid, ItemDetailSheet, PostFormSheet
│   │   ├── filters/             # SearchBox, TypeFilter, CategoryChips
│   │   └── admin/               # ReportRow, AdminEditSheet, AdminLoginSheet
│   └── pages/
│       ├── BrowsePage.tsx       # Main feed with hero, filters, grid, and load more
│       ├── LoginPage.tsx        # Signal matrix animation, Google OAuth, Admin login
│       ├── MinePage.tsx         # User's submitted posts feed
│       └── ReportsPage.tsx      # Admin moderation reports dashboard
└── supabase/                    # Schema and SQL migrations
```

## 4. Routes & Pages
- `#/browse` (Default): Main feed with hero section, live search, type filter (All/Lost/Found/Returned), category chips, item grid, and pagination.
- `#/login`: Authentication view with 81-dot animated signal matrix, Google OAuth trigger, Admin login sheet trigger, and guest continuation.
- `#/mine`: "My Posts" dashboard displaying the current user's active and returned listings.
- `#/reports`: Admin moderation dashboard to review image reports, inspect flagged items, dismiss false reports, or delete posts.
- `#item=<id>`: Deep link parameter opening the item detail bottom sheet / modal.

## 5. Data Model & Environment Variables

### Database Entities (Supabase / PostgreSQL)
- **`public.profiles`**: `id` (uuid, PK), `full_name` (text), `email` (text), `avatar_url` (text), `is_admin` (boolean), `created_at` (timestamptz).
- **`public.items`**: `id` (uuid, PK), `user_id` (uuid), `type` ('lost' | 'found'), `title` (text <=100), `description` (text <=1000), `category` (text), `location` (text), `item_date` (date), `image_url` (text), `status` ('open' | 'returned'), `contact` (text, protected), `created_at` (timestamptz).
- **`public.item_contacts`**: `item_id` (uuid, PK), `contact` (text <=120).
- **`public.returns`**: `id` (uuid, PK), `item_id` (uuid, unique), `recorded_by` (uuid), `returned_to_name` (text), `returned_to_contact` (text), `returned_on` (date), `handover_location` (text), `verification_notes` (text), `created_at` (timestamptz).
- **`public.reports`**: `id` (uuid, PK), `item_id` (uuid), `reporter_id` (uuid), `reason` (text), `created_at` (timestamptz).
- **Storage:** `item-images` bucket for JPEG, PNG, WEBP files up to 5 MB.

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project API URL (defaults to `https://fcubaxsmyfaokfdvcxsj.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/publishable key (defaults to `sb_publishable_LcCHuv7Zj-_VH9lnBsVDAQ_aw3yCSaI`).
- Default values ensure the app builds and runs without any `.env` file present, while allowing custom deployment environments.

## 6. How to Run
- Development: `npm run dev` (starts Vite dev server at `http://localhost:5173`).
- Production Build: `npm run build` (type-checks with `tsc` and bundles into `dist/`).
- Lint: `npm run lint`.
- Format: `npm run format`.
- Preview: `npm run preview`.

## 7. Known Bugs & Security Issues (To Be Fixed in Phase 2 & Ported)
1. **Broken BlazeFace Model Fetch (High):** tfhub.dev URL 404s, blocking all photo uploads. Fix: non-blocking face detection with graceful fallback.
2. **Unauthenticated Contact Data Leak (High):** `listItems` returned `contact` to anonymous users. Fix: omit `contact` in public list queries; fetch only when viewing details as authenticated user.
3. **Database Migration for Contact Privacy (High):** Add `20261101000000_contact_privacy.sql` to enforce authenticated-only contact access.
4. **Malformed Reports Profiles Join (Med):** Syntax `profiles:reporter_id` aliased column instead of joining `profiles(email)`. Fix: use `profiles:reporter_id(email)`.
5. **Reports View In-Memory Pagination Deadlock (Med):** Reports action failed if item wasn't in top 20. Fix: fetch item directly by ID; add dismiss report action.
6. **"My Posts" In-Memory Limitation (Med):** Only filtered loaded 20 items. Fix: query Supabase directly with `.eq('user_id', user.id)`.
7. **"My Posts" Card Event Propagation (Low):** Admin buttons triggered card detail open. Fix: stop event propagation on action buttons.
8. **Date UTC Desync (Low):** `toISOString().slice(0, 10)` caused date input desync in timezones ahead/behind UTC. Fix: use local calendar date.
9. **No Photo Removal Option (Low):** Form had no button to deselect an image. Fix: add clear photo button.
10. **Popup Positioning Shift on Desktop (High):** Item detail and admin password popups rendered shifted off-center and clipped on desktop. Fix: detailed root cause documented below; resolved using Portal dialogs and proper centering.

### Popup Positioning Root Cause
In the legacy vanilla application, the item detail popup and the admin password popup rendered shifted off the left edge or distorted on desktop viewports. Investigation of `css/style.css` and `css/admin.css` revealed the following compounded root causes:

1. **Conflicting Inset Constraints (`left: 0; right: 0` vs `left: 50%; right: auto`):**
   The base mobile sheet rule in `style.css` set:
   `.sheet-panel { position: absolute; bottom: 0; left: 0; right: 0; }`
   In the desktop media query (`@media(min-width:640px)`), `left: 50%; right: auto;` was introduced alongside `width: min(620px, calc(100% - 40px))`. When combined with utility-generated stylesheets or responsive cascades, if `right: auto` was overridden or not cleared (e.g. `inset-x-0` specifying both `left: 0` and `right: 0`), the element was constrained between `left: 50%` and `right: 0`, stretching across the right half of the screen and pulling the modal off center.

2. **Inverted Vertical Centering (`bottom: 50%; transform: translate(-50%, 50%)`):**
   Standard modal centering positions an element with `top: 50%; left: 50%; transform: translate(-50%, -50%)`. The legacy stylesheet instead anchored the bottom of the panel with `bottom: 50%` and applied a positive vertical translation `translateY(+50%)`. In CSS coordinate geometry, a positive Y translation shifts an element downwards towards the viewport bottom. For tall modal content (such as item details with images, metadata, and buttons, or forms with `max-height: 88vh`), this inverted translation pushed the lower portion of the modal below the viewport boundary, causing extreme clipping and scrollbar misalignment.

3. **Keyframe Transforms Overriding Layout Translations:**
   `css/style.css` included global CSS keyframes such as:
   `@keyframes travel { 0% { transform: translate(0); } ... }`
   In CSS, `transform` is a singular property. Any active animation or keyframe affecting an element or inheriting transform properties completely overrides `transform: translate(-50%, 50%)`. Once the `-50%` horizontal translation was wiped out by a keyframe setting `transform: translate(0)`, `left: 50%` positioned the left edge of the popup at the horizontal center of the screen, throwing the entire popup off to the side.

4. **Parent Transforms Nullifying `position: fixed`:**
   Per CSS specification, any ancestor element with a CSS `transform`, `filter`, or `perspective` creates a new containing block for `position: fixed` elements. Whenever modals were triggered from within animated page sections (such as `.login` containing the animated `.signal` matrix), fixed coordinates were calculated relative to that transformed section rather than the viewport window.

5. **Modern Fix in React + shadcn/ui:**
   In the modern stack, all dialogs and sheets utilize `@base-ui/react` dialog primitives with portal rendering (`<SheetPortal>` / `<DialogPortal>`) directly to `document.body`, completely isolating them from parent transforms. Furthermore, desktop popups are explicitly styled with `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` and `sm:inset-x-auto sm:right-auto sm:bottom-auto`, guaranteeing pixel-perfect centering on all screen sizes.

## 8. UI Migration Map to shadcn/ui

| Legacy Element | Location | Modern shadcn/ui Equivalent |
|---|---|---|
| Bottom Sheet / Modal Dialog | `#sheet`, `.sheet-panel` | `Sheet` (mobile) / `Dialog` (desktop) |
| Item Card | `<article class="card">` | `Card`, `CardContent`, `CardHeader` |
| Filter Segmented Buttons | `.segmented` | `ToggleGroup` / `Tabs` |
| Category Filter Chips | `.chip` | `Badge` (clickable with outline/default variant) |
| Search Input | `.search-box input` | `Input` with `lucide-react` Search icon |
| Create Post Form | `#post-form` | `Form`, `FormField`, `Input`, `Textarea`, `Select` |
| Category Dropdown | `select[name=category]` | `Select`, `SelectTrigger`, `SelectContent` |
| Date Picker | `input[type=date]` | `Calendar` + `Popover` or native date with theme styling |
| Action Buttons | `.button`, `.button.accent` | `Button` with variants (`default`, `secondary`, `destructive`, `outline`) |
| Alert Banner | `#toast` | `Sonner` toast notifications |
| User Initial Avatar | `#user-avatar` | `Avatar`, `AvatarFallback` |
| Status / Type Badges | `.badge`, `.badge.lost` | `Badge` with theme variants |
| Confirm Prompt | `confirm(...)` | `AlertDialog` |

## 9. Phased Fix & Migration Plan
- **Step 1:** Add project specification (`SPEC.md`) [COMPLETED].
- **Step 2:** Apply fixes to existing vanilla code in isolated commits [COMPLETED].
- **Step 3:** Setup project tooling (Vite, React, TypeScript, Tailwind, shadcn/ui, ESLint, Prettier) [COMPLETED].
- **Step 4:** Port the application to typed React components with full feature parity and bug fixes [COMPLETED].
- **Step 5:** Cleanup legacy code, finalize documentation, and verify builds [COMPLETED].

## 10. Autonomous Decisions Log
1. **Branch Management:** All modernization work strictly isolated to branch `modernize`. `main` branch remains untouched.
2. **Hosting Configurations:** `vercel.json` and `firebase.json` left untouched per hard rule #2.
3. **Database Credentials:** Hardcoded credentials retained as fallbacks in `src/lib/config.ts` and `src/lib/supabase.ts` so zero-configuration builds succeed immediately without requiring manual `.env` setup.
4. **SQL Migrations:** Migration `20261101000000_contact_privacy.sql` created as a file only; no database execution performed.
5. **BlazeFace Fallback:** Face detection wrapped in an async timeout (2.5s) with try/catch. If weights fail or timeout, the photo upload continues gracefully with a console warning instead of blocking the user from submitting a post.
6. **Date Formatting:** Replaced UTC `toISOString().slice(0, 10)` with local timezone calendar date `new Date().toLocaleDateString('en-CA')` (YYYY-MM-DD format).
7. **Font Consolidation:** Kept `Plus Jakarta Sans` as the unified typography token across all components, discarding conflicting `Smooch Sans` and `Space Mono` fonts for visual coherence.
8. **Theme Consistency & Light-Only Mode:** Switched to a dedicated light-only theme per user instructions. Removed `@media (prefers-color-scheme: dark)` and `.dark` blocks, set `<meta name="color-scheme" content="light">`, and standardized on the warm `#f0642f` orange accent on creamy surfaces across all platforms.
9. **Component Primitives & Popup Centering:** Implemented modern accessible dialogs, sheets, alerts, cards, and buttons using shadcn/ui and `@base-ui/react` primitives. Explicitly resolved desktop popup centering issues by applying `sm:inset-x-auto sm:right-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2`, clearing mobile `inset-x-0` constraints.
10. **Global Delete Confirmation:** Replaced browser `confirm()` dialogs with custom shadcn `AlertDialog` components for item deletion and admin image removal.
11. **Mobile Safe Area & Chip Hints:** Implemented `calc(4rem + env(safe-area-inset-bottom))` for the mobile bottom nav bar and elevated FAB, along with a right-edge gradient fade indicator for horizontally scrolling category chips.
