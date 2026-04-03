import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { fadeUp } from "@/lib/motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: window.location.origin + "/reset-password" },
    );

    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <motion.div {...fadeUp} className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <ChefHat className="w-6 h-6" style={{ color: "var(--accent)" }} />
          <span
            className="font-display font-bold"
            style={{ color: "var(--accent)" }}
          >
            KitchenSync
          </span>
        </div>
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Reset your password
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div
            className="rounded-xl p-4 text-sm"
            style={{
              backgroundColor: "var(--success-soft)",
              color: "var(--success)",
            }}
          >
            ✅ Check your inbox. We sent a reset link to{" "}
            <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label style={{ color: "var(--text-secondary)" }}>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1.5"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="block text-center text-sm hover:underline"
          style={{ color: "var(--accent)" }}
        >
          ← Back to login
        </Link>
      </motion.div>
    </div>
  );
}
