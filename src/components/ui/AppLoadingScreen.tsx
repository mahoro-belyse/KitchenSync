import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';

// ─── AppLoadingScreen ─────────────────────────────────────────────────────────
// Shown while Supabase resolves the initial auth state on first page load.
// Displayed by ProtectedRoute and PublicOnlyRoute while loading=true.
// Also used as the Suspense fallback for lazy-loaded routes.

export function AppLoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-3"
      >
        <ChefHat className="w-10 h-10" style={{ color: 'var(--accent)' }} />
        <span
          className="font-display text-xl"
          style={{ color: 'var(--text-primary)' }}
        >
          KitchenSync
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading your kitchen...
        </span>
      </motion.div>
    </div>
  );
}
