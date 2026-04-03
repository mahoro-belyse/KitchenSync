import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <section className="min-h-screen flex items-center relative overflow-hidden">
        {/* ── Dot grid texture only — no colour wash ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.5,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* ── Left column ── */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* Pill badge */}
            <motion.div variants={staggerItem}>
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                ✨ Smart Kitchen Management
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1]"
              style={{ color: "var(--color-foreground)" }}
            >
              Cook Smarter, Waste Less, Eat Better.
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={staggerItem}
              className="text-lg max-w-lg"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              KitchenSync connects your pantry, recipes, and grocery list into
              one beautiful system. Know exactly what you can cook — right now.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="px-8 h-12 text-base text-white hover:scale-105 transition-transform"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                <Link to="/signup">
                  Start for Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12 text-base"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                }}
                onClick={() => setDemoOpen(true)}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.p
              variants={staggerItem}
              className="text-sm"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              ⭐⭐⭐⭐⭐ Loved by 12,000+ home cooks
            </motion.p>
          </motion.div>

          {/* ── Right column — floating mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Decorative blobs — inline filter:blur always works,
                unlike Tailwind's blur-3xl which needs a config in v4 */}
            <div
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
              style={{
                backgroundColor: "var(--color-accent-soft)",
                opacity: 0.6,
                filter: "blur(72px)",
              }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full pointer-events-none"
              style={{
                backgroundColor: "var(--color-success-soft)",
                opacity: 0.7,
                filter: "blur(72px)",
              }}
            />

            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div
                className="rounded-2xl border shadow-2xl overflow-hidden"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-card)",
                }}
              >
                {/* Browser chrome dots */}
                <div
                  className="flex items-center gap-2 px-4 py-3 border-b"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-secondary)",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: "var(--color-danger)",
                      opacity: 0.7,
                    }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: "var(--color-warning)",
                      opacity: 0.7,
                    }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: "var(--color-success)",
                      opacity: 0.7,
                    }}
                  />
                </div>
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
                  alt="Kitchen overhead view"
                  className="w-full h-64 object-cover"
                />
              </div>
            </motion.div>

            {/* Notification chip 1 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className="absolute -top-4 -right-4"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="px-4 py-2 rounded-xl shadow-lg text-sm font-medium"
                style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              >
                🥬 Spinach added to pantry
              </motion.div>
            </motion.div>

            {/* Notification chip 2 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              className="absolute top-1/2 -left-8"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="px-4 py-2 rounded-xl shadow-lg text-sm font-medium"
                style={{
                  backgroundColor: "var(--color-success-soft)",
                  border: "1px solid var(--color-success)",
                  color: "var(--color-success)",
                }}
              >
                ✅ You can cook Pasta Primavera!
              </motion.div>
            </motion.div>

            {/* Notification chip 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              className="absolute -bottom-4 right-8"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
                className="px-4 py-2 rounded-xl shadow-lg text-sm font-medium"
                style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              >
                🛒 3 items added to grocery list
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Demo Modal ── */}
      <AnimatePresence>
        {demoOpen && (
          <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl">
              <div
                className="flex items-center justify-between px-5 py-3 border-b"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-secondary)",
                }}
              >
                <span
                  className="font-display text-base font-semibold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  KitchenSync — Product Demo
                </span>
                <button
                  onClick={() => setDemoOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:opacity-70"
                  style={{ color: "var(--color-muted-foreground)" }}
                  aria-label="Close demo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className="w-full aspect-video"
                style={{ backgroundColor: "var(--color-background)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"
                  alt="KitchenSync demo preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className="flex items-center justify-between px-5 py-4 border-t"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-secondary)",
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Ready to try it yourself?
                </p>
                <Button
                  asChild
                  className="text-white"
                  style={{ backgroundColor: "var(--color-accent)" }}
                  onClick={() => setDemoOpen(false)}
                >
                  <Link to="/signup">
                    Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
