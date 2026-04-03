import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // null if logged out, User if logged in

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-md w-full text-center space-y-6"
      >
        {/* ── Empty plate image (spec Part 16.8) ── */}
        <motion.div
          variants={staggerItem}
          className="mx-auto w-48 h-48 rounded-2xl overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1495546968767-f0573cca821e?w=600&q=80"
            alt="Empty plate"
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>

        {/* ── 404 number ── */}
        <motion.h1
          variants={staggerItem}
          className="font-display font-bold"
          style={{
            fontSize: "clamp(5rem, 20vw, 8rem)",
            lineHeight: 1,
            color: "var(--accent)",
            opacity: 0.25,
          }}
        >
          404
        </motion.h1>

        {/* ── Heading + subtext ── */}
        <motion.div variants={staggerItem} className="space-y-2 -mt-4">
          <h2
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            This page doesn't exist
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Looks like this recipe is missing from our book.
          </p>
        </motion.div>

        {/* ── Action buttons ── */}
        <motion.div
          variants={staggerItem}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
        >
          {/* ← Go Back */}
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-primary)",
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          {/* Go to Home */}
          <Button
            asChild
            variant="outline"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-primary)",
            }}
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Link>
          </Button>

          {/* Go to Dashboard — only shown if user is logged in (spec Part 16.8) */}
          {user && (
            <Button
              asChild
              className="text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Link to="/dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
