import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";
import { useAuth } from "@/context/AuthContext";

export default function CTASection() {
  const { user, loading } = useAuth();

  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, hsl(16 77% 57%) 0%, hsl(35 80% 50%) 100%)",
        }}
      />

      <motion.div
        variants={fadeUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="relative max-w-3xl mx-auto px-4 text-center"
      >
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          Ready to take control of your kitchen?
        </h2>

        <Button
          asChild
          size="lg"
          className="h-14 px-10 text-lg font-semibold mt-6
            bg-white hover:bg-white/90 hover:scale-105 transition-transform
            text-[hsl(16,77%,45%)]
            dark:bg-white dark:text-[hsl(16,77%,40%)] dark:hover:bg-white/90"
        >
          {!loading && user ? (
            <Link to="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          ) : (
            <Link to="/signup">
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
        </Button>

        <p className="text-white/70 mt-4 text-sm">
          No credit card required. Free forever.
        </p>
      </motion.div>
    </section>
  );
}
