import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { staggerItem } from "@/lib/motion";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate("/");
  };

  // Scroll listener — blur/opaque navbar after 80px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Don't render auth buttons until we know the auth state
  const isAuthed = !loading && !!user;
  const isGuest = !loading && !user;

  return (
    <>
      {/* ── Desktop / scroll-aware navbar ── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={
          scrolled
            ? {
                backgroundColor:
                  "color-mix(in srgb, var(--bg-primary) 85%, transparent)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid var(--border)",
              }
            : { backgroundColor: "transparent" }
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-display text-lg font-bold"
              style={{ color: "var(--accent)" }}
            >
              KitchenSync
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition-colors relative group"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
              >
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: "var(--accent)" }}
                />
              </a>
            ))}
          </nav>

          {/* Right side: theme toggle + auth buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* ── Authenticated: Dashboard + Logout ── */}
            {isAuthed && (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden md:inline-flex"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="hidden md:inline-flex"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Log out
                </Button>
              </>
            )}

            {/* ── Guest: Log in + Get Started ── */}
            {isGuest && (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden md:inline-flex"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Link to="/login">Log in</Link>
                </Button>

                <Button
                  asChild
                  className="hidden md:inline-flex text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <Link to="/signup">
                    Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-primary)" }}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile full-screen menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--text-primary)" }}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Staggered nav links */}
            <div className="flex flex-col items-center gap-6 pt-12 flex-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  custom={i}
                  style={{
                    color: "var(--text-primary)",
                    transitionDelay: `${i * 0.07}s`,
                  }}
                  onClick={() => setMenuOpen(false)}
                  className="text-2xl font-display font-bold hover:opacity-70 transition-opacity"
                >
                  {link.label}
                </motion.a>
              ))}

              {/* Mobile auth buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-3 w-full px-8 mt-4"
              >
                {/* ── Mobile authenticated ── */}
                {isAuthed && (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="w-full text-white"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      style={{
                        borderColor: "var(--border-strong)",
                        color: "var(--text-primary)",
                      }}
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </>
                )}

                {/* ── Mobile guest ── */}
                {isGuest && (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full"
                      style={{
                        borderColor: "var(--border-strong)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        Log in
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="lg"
                      className="w-full text-white"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      <Link to="/signup" onClick={() => setMenuOpen(false)}>
                        Get Started Free
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
