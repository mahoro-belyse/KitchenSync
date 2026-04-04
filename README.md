# 🍳 KitchenSync

> **Cook smarter, waste less, eat better.**

KitchenSync is a production-ready, full-stack SaaS kitchen management platform. It helps home cooks manage their pantry inventory, build a personal recipe collection, plan weekly meals, and auto-generate smart grocery lists — all in one beautifully designed app.

---
## 🌐 Live Demo

[View Live Preview](https://kitchen-sync.netlify.app/)

---

## ✨ What It Does

| Feature | Description |
|---|---|
| **Smart Pantry Tracker** | Log ingredients with quantities, units, categories, and expiry dates. Get low-stock and expiry warnings automatically. |
| **Personal Recipe Book** | Save recipes with full ingredient lists, prep times, servings, cuisine type, and images. |
| **Instant Pantry Check** | One tap tells you if you have everything to cook a recipe right now. Missing something? It generates the exact shopping list. |
| **Weekly Meal Planner** | Plan Breakfast, Lunch, Dinner, and Snacks for every day of the week with a beautiful calendar view. |
| **Smart Grocery List** | Auto-generated from your pantry gaps. Check items off as you shop. Share or copy the list in one tap. |
| **Dark / Light Mode** | Full theme support — warm light mode and elegant dark mode, persisted across sessions. |
| **Authentication** | Email/password signup & login, Google OAuth, password reset flow, and protected routes. |
| **Responsive Design** | Fully responsive across mobile (320px) and desktop (1440px+) with a dedicated mobile bottom nav. |

---

## 🗂️ Project Structure

```
kitchensync/
├── public/
│   └── favicon.ico
├── src/
│   ├── App.tsx                        # Main router with lazy loading & route guards
│   ├── main.tsx                       # React entry point with BrowserRouter
│   ├── index.css                      # Tailwind v4 tokens, CSS variables, dark mode
│   │
│   ├── context/
│   │   └── AuthContext.tsx            # Supabase auth state (user, session, loading, signOut)
│   │
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client (persistSession, detectSessionInUrl)
│   │   ├── motion.ts                  # Reusable Framer Motion variants
│   │   ├── pantryCheck.ts             # Core pantry comparison logic + emoji + category detection
│   │   ├── app-params.ts              # URL param utilities (?plan=pro)
│   │   └── utils.ts                   # cn() class merger + isIframe check
│   │
│   ├── types/
│   │   └── index.ts                   # All TypeScript interfaces (Profile, Recipe, InventoryItem…)
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── PantryPage.tsx
│   │   ├── RecipesPage.tsx
│   │   ├── CheckPage.tsx              # "Can I Cook It?" page
│   │   ├── MealPlanPage.tsx
│   │   ├── GroceryPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── PlaceholderPage.tsx        # About, Blog, Press, Privacy, Terms, Cookies
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.tsx     # Redirects unauthenticated users → /login
│   │   │   └── PublicOnlyRoute.tsx    # Redirects authenticated users → /dashboard
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # Authenticated layout wrapper + page transitions
│   │   │   ├── Sidebar.tsx            # Desktop sidebar with collapsible nav
│   │   │   ├── Topbar.tsx             # Top bar with search, theme toggle, avatar
│   │   │   ├── MobileNav.tsx          # Bottom tab bar for mobile
│   │   │   └── ThemeToggle.tsx        # Light / Dark / System theme cycling
│   │   │
│   │   ├── landing/
│   │   │   ├── LandingNavbar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   └── FooterSection.tsx
│   │   │
│   │   ├── pantry/
│   │   │   ├── InventoryCard.tsx      # Individual pantry item card
│   │   │   └── InventoryForm.tsx      # Add / edit pantry item drawer
│   │   │
│   │   ├── recipes/
│   │   │   ├── RecipeCard.tsx         # Recipe card with readiness score
│   │   │   └── RecipeForm.tsx         # Add recipe modal with dynamic ingredients
│   │   │
│   │   ├── check/
│   │   │   └── PantryCheckModal.tsx   # Pantry check result + grocery add
│   │   │
│   │   └── ui/
│   │       ├── AppLoadingScreen.tsx   # Full-screen auth loading state
│   │       ├── PageHeader.tsx         # Shared page title + action slot
│   │       └── EmptyState.tsx         # Empty list state with CTA
│   │
│   └── hooks/                         # (future custom hooks)
│
├── .env                               # Supabase keys (not committed)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🛠️ Languages & Frameworks

| Layer | Technology |
|---|---|
| **Language** | TypeScript (strict mode, zero `any`) |
| **Framework** | React 18 + Vite |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Animations** | Framer Motion |
| **Routing** | React Router v6 (lazy-loaded routes) |
| **Backend / Database** | Supabase (PostgreSQL + Row Level Security) |
| **Authentication** | Supabase Auth (email/password + Google OAuth) |
| **File Storage** | Supabase Storage (avatar uploads) |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast) |
| **Confetti** | canvas-confetti |
| **Fonts** | Playfair Display · DM Sans · JetBrains Mono (Google Fonts) |

---

## ⚡ Challenges & How We Solved Them

### Challenge 1 — Migrating from Base.com to Supabase

**The problem:** The original app was built on Base.com, a managed backend platform with its own proprietary SDK (`base44`). Every data operation (`base44.entities.Recipe.list()`, `base44.auth.me()`, `base44.auth.logout()`) was tightly coupled to their API. Migrating meant replacing every single data call, the entire authentication system, file storage, and even the routing guards — without breaking the running app.

**How we solved it:** We performed a file-by-file migration, mapping every Base.com concept to its Supabase equivalent:

| Base.com | Supabase |
|---|---|
| `base44.auth.me()` | `supabase.auth.getSession()` + `onAuthStateChange` |
| `base44.auth.logout()` | `supabase.auth.signOut()` |
| `base44.entities.X.list()` | `supabase.from('table').select('*').eq('user_id', uid)` |
| `base44.entities.X.create()` | `supabase.from('table').insert({...})` |
| `base44.entities.X.delete(id)` | `supabase.from('table').delete().eq('id', id)` |
| Auth redirect guards | `ProtectedRoute` + `PublicOnlyRoute` components using `useAuth()` |

We also replaced `moment.js` with native `Intl` APIs and `Date` arithmetic, and removed `@tanstack/react-query` entirely since Supabase hooks handle state natively.

---

### Challenge 2 — CSS Variable Conflict Between Tailwind v4 and shadcn/ui

**The problem:** After migrating to Tailwind CSS v4, all buttons, badges, and colored elements were rendering as invisible or unstyled on screen. The root cause: shadcn/ui components define CSS variables as raw HSL numbers without the `hsl()` wrapper (e.g. `--accent: 16 77% 57%`), which is correct for their internal usage pattern `hsl(var(--accent))`. But our components used `style={{ backgroundColor: 'var(--accent)' }}` directly — which resolved to the raw string `"16 77% 57%"`, not a valid CSS color value.

Tailwind v4 also moved from `tailwind.config.js` to an `@theme {}` block in CSS, introducing `--color-*` prefixed tokens that overlapped with shadcn's unprefixed tokens.

**How we solved it:** We structured `index.css` in a deliberate layered order within a single `:root` block:

1. **shadcn raw HSL vars first** — `--accent: 16 77% 57%` (no wrapper, for shadcn internal use)
2. **KitchenSync semantic vars last** — `--accent: hsl(16 77% 57%)` (full color value, for direct component use)

Because CSS custom properties follow "last definition wins" within the same selector block, our full-`hsl()` values always override the raw-number versions. shadcn components still work because they wrap with `hsl()` themselves. Dark mode overrides follow the same two-layer pattern inside `.dark {}`. This required zero `!important` flags and no component changes.

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/mahoro-belyse/kitchensync.git
cd kitchensync
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full schema SQL (creates all tables, RLS policies, and the auth trigger)
3. Go to **Storage** → create a public bucket named `avatars`
4. (Optional) Go to **Authentication → Providers** → enable Google OAuth

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You'll find both values in your Supabase project under **Settings → API**.

### 4. Install shadcn/ui components

```bash
npx shadcn@latest add button input label textarea select dialog drawer sheet checkbox progress badge avatar skeleton tabs toast sonner
```

### 5. Run the development server

```bash
npm run dev
```

App runs at **http://localhost:5173**

### 6. Build for production

```bash
npm run build
npm run preview
```

---

## 👤 Author

**Developed by:** Mahoro belyse

**Year:** 2026

**Location:** Kigali, Rwanda 🇷🇼

---


*Built with ❤️ for home cooks everywhere.*
