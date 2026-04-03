import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

interface Plan {
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  cta: string;
  planParam: string;
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "Up to 30 pantry items",
      "10 recipes",
      "Basic grocery list",
      "1 week meal plan",
    ],
    cta: "Get Started Free",
    planParam: "free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$6",
    period: "/month",
    badge: "Most Popular",
    features: [
      "Unlimited everything",
      "Smart meal suggestions",
      "Nutrition tracking",
      "Recipe import from URL",
      "Priority support",
    ],
    cta: "Start Pro Free Trial",
    planParam: "pro",
    highlighted: true,
  },
  {
    name: "Family",
    price: "$12",
    period: "/month",
    features: [
      "Everything in Pro",
      "Up to 6 accounts",
      "Shared pantry",
      "Family grocery lists",
      "Collaborative meal planning",
    ],
    cta: "Get Family Plan",
    planParam: "family",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="font-display text-4xl font-bold"
            style={{ color: "var(--color-foreground)" }}
          >
            Simple, transparent pricing.
          </h2>
          <p
            className="mt-3"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Start free. Upgrade when you're ready.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 items-center"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={staggerItem}
              whileHover={
                !plan.highlighted
                  ? { y: -4, transition: { duration: 0.2 } }
                  : {}
              }
              className="rounded-2xl p-8 relative"
              style={
                plan.highlighted
                  ? {
                      backgroundColor: "var(--color-card)",
                      border: "2px solid hsl(16 77% 57%)",
                      boxShadow:
                        "0 0 0 4px var(--color-accent-soft), 0 20px 40px -12px rgba(0,0,0,0.25)",
                      transform: "scale(1.05)",
                    }
                  : {
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }
              }
            >
              {/* Badge */}
              {plan.badge && (
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
                  style={{ backgroundColor: "hsl(16 77% 57%)" }}
                >
                  {plan.badge}
                </span>
              )}

              {/* Plan name */}
              <h3
                className="font-display text-xl font-bold"
                style={{ color: "var(--color-foreground)" }}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mt-4 mb-6 flex items-baseline gap-1">
                <span
                  className="font-mono text-4xl font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {plan.price}
                </span>
                <span style={{ color: "var(--color-muted-foreground)" }}>
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: "var(--color-success)" }}
                    />
                    <span style={{ color: "var(--color-muted-foreground)" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.highlighted ? (
                <Button
                  asChild
                  className="w-full font-semibold text-white"
                  style={{
                    backgroundColor: "hsl(16 77% 57%)",
                    border: "none",
                  }}
                >
                  <Link to={`/signup?plan=${plan.planParam}`}>{plan.cta}</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-semibold"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                    backgroundColor: "transparent",
                  }}
                >
                  <Link to={`/signup?plan=${plan.planParam}`}>{plan.cta}</Link>
                </Button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
