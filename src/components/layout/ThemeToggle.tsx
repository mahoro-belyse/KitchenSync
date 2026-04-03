import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = "light" | "dark" | "system";

// ─── Constants ────────────────────────────────────────────────────────────────
const THEMES: Theme[] = ["light", "dark", "system"];

const ICONS: Record<Theme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const LABELS: Record<Theme, string> = {
  light: "Light mode",
  dark: "Dark mode",
  system: "System theme",
};

// ─── Helper — apply theme to <html> element ───────────────────────────────────
const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (theme === "dark" || (theme === "system" && systemDark)) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    return (THEMES.includes(stored as Theme) ? stored : "system") as Theme;
  });

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Also react to OS-level preference changes when theme === 'system'
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = (): void => {
    const idx = THEMES.indexOf(theme);
    setTheme(THEMES[(idx + 1) % THEMES.length]);
  };

  const Icon = ICONS[theme];

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg transition-colors"
      style={{ color: "var(--text-muted)" }}
      title={LABELS[theme]}
      aria-label={LABELS[theme]}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.backgroundColor = "var(--bg-surface)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
