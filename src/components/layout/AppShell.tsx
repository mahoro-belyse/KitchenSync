import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Topbar from "@/components/layout/Topbar";
import { fadeUp } from "@/lib/motion";

export default function AppShell() {
  const location = useLocation();

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* ── Sidebar — desktop only (hidden on mobile) ── */}
      <Sidebar />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* ── Topbar — all screen sizes ── */}
        <Topbar />

        {/* ── Page content with fadeUp transition on route change ── */}
        <main
          className="flex-1 pb-20 lg:pb-0"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/*
              AnimatePresence mode="wait" ensures the exiting page fully
              animates out before the entering page animates in.
              key={location.pathname} triggers a new animation on every
              route change.
            */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={fadeUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tab bar — mobile only (hidden on desktop) ── */}
      <MobileNav />
    </div>
  );
}
