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
