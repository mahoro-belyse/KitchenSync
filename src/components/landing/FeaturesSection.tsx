import { motion } from "framer-motion";
import {
  Package,
  BookOpen,
  ChefHat,
  CalendarDays,
  ShoppingCart,
  SunMoon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string | null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const features: Feature[] = [
  {
    icon: Package,
    title: "Smart Pantry Tracker",
    description:
      "Log what you have. We track quantities, units, and expiry so nothing goes to waste.",
    image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80",
  },
  {
    icon: BookOpen,
    title: "Personal Recipe Collection",
    description:
      "Store your favorite recipes with ingredients, prep times, and serving sizes — all searchable.",
    image:
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80",
  },
  {
    icon: ChefHat,
    title: "Instant Pantry Check",
    description:
      "One tap tells you if you have all the ingredients. If not, we generate the shopping list automatically.",
    image:
      "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=80",
  },
  {
    icon: CalendarDays,
    title: "Weekly Meal Planner",
    description:
      "Plan your breakfasts, lunches, and dinners for the week. Drag and drop, effortlessly.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
  },
  {
    icon: ShoppingCart,
    title: "Intelligent Grocery Lists",
    description:
      "Auto-generated from your meal plan and pantry gaps. Check items off as you shop.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
  },
  {
    icon: SunMoon,
    title: "Beautiful in Any Light",
    description:
      "Switch between a warm light theme and an elegant dark mode. Your eyes will thank you.",
    image: null,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[--bg-card]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section header ── */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            Everything You Need
          </span>
          <h2 className="font-display text-4xl font-bold mt-3 text-[--text-primary]">
            Your kitchen, finally organized.
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-[--text-secondary]">
            Six powerful features that work together seamlessly.
          </p>
        </motion.div>

        {/* ── Feature cards grid ── */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="group rounded-2xl border bg-[--bg-card] p-6 transition-shadow hover:shadow-lg cursor-default"
                style={{ borderColor: "var(--border)" }}
              >
                {/* Icon badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--accent-soft)" }}
                >
                  <Icon
                    className="w-6 h-6"
                    style={{ color: "var(--accent)" }}
                  />
                </div>

                {/* Text */}
                <h3 className="font-display text-lg font-semibold mb-2 text-[--text-primary]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[--text-secondary]">
                  {feature.description}
                </p>

                {/* Optional image */}
                {feature.image && (
                  <div className="mt-4 rounded-xl overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
