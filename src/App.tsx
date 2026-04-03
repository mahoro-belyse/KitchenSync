import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/auth/PublicOnlyRoute";

// ─── Lazy-loaded pages (spec Part 0 — REQUIRED on every route) ───────────────
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPassword = lazy(() => import("@/pages/ResetPasswordPage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const PantryPage = lazy(() => import("@/pages/PantryPage"));
const RecipesPage = lazy(() => import("@/pages/RecipesPage"));
const CheckPage = lazy(() => import("@/pages/CheckPage"));
const MealPlanPage = lazy(() => import("@/pages/MealPlanPage"));
const GroceryPage = lazy(() => import("@/pages/GroceryPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const PlaceholderPage = lazy(() => import("@/pages/PlaceholderPage"));

// ─── AppShell (authenticated layout wrapper) ─────────────────────────────────
const AppShell = lazy(() => import("@/components/layout/AppShell"));

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    // AuthProvider must wrap Routes so ProtectedRoute can call useAuth()
    // BrowserRouter is in main.tsx — wrapping AuthProvider there
    <AuthProvider>
      <Suspense fallback={<AppLoadingScreen />}>
        <Routes>
          {/* ── PUBLIC ROUTES ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Footer placeholder pages ── */}
          <Route
            path="/changelog"
            element={<PlaceholderPage title="Changelog" />}
          />
          <Route
            path="/roadmap"
            element={<PlaceholderPage title="Roadmap" />}
          />
          <Route path="/about" element={<PlaceholderPage title="About" />} />
          <Route path="/blog" element={<PlaceholderPage title="Blog" />} />
          <Route
            path="/careers"
            element={<PlaceholderPage title="Careers" />}
          />
          <Route path="/press" element={<PlaceholderPage title="Press" />} />
          <Route
            path="/privacy"
            element={<PlaceholderPage title="Privacy Policy" />}
          />
          <Route
            path="/terms"
            element={<PlaceholderPage title="Terms of Service" />}
          />
          <Route
            path="/cookies"
            element={<PlaceholderPage title="Cookie Policy" />}
          />

          {/* ── PUBLIC-ONLY (redirect to /dashboard if already logged in) ── */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />

          {/* ── PRIVATE ROUTES (redirect to /login if logged out) ── */}
          {/*
            All private pages share the AppShell layout (Sidebar + Topbar + MobileNav).
            ProtectedRoute wraps AppShell so the whole shell is protected, not just
            individual pages. This also means the shell itself only mounts when authed.
          */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pantry" element={<PantryPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/check" element={<CheckPage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
            <Route path="/grocery" element={<GroceryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/:tab" element={<SettingsPage />} />
          </Route>

          {/* ── CATCH-ALL → 404 ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Toast notifications — outside Routes so they render on all pages */}
      <Toaster richColors position="bottom-right" />
    </AuthProvider>
  );
}
