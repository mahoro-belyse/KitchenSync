import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { getSelectedPlan } from "@/lib/app-params";

const getStrength = (
  pw: string,
): { label: string; color: string; width: string } => {
  if (pw.length === 0) return { label: "", color: "transparent", width: "0%" };
  if (pw.length < 6)
    return { label: "Weak", color: "var(--danger)", width: "33%" };
  if (pw.length < 10)
    return { label: "Fair", color: "var(--warning)", width: "66%" };
  return { label: "Strong", color: "var(--success)", width: "100%" };
};

export default function SignupPage() {
  const navigate = useNavigate();
  const plan = getSelectedPlan(); // reads ?plan= URL param

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Left visual panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, #C84F28 100%)",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
          alt="Kitchen"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-white" />
          <span className="font-display text-xl font-bold text-white">
            KitchenSync
          </span>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur rounded-2xl p-6 text-white">
          <p className="font-display text-lg italic">
            "Meal planning used to take me an hour every Sunday. Now it takes 10
            minutes."
          </p>
          <p className="text-sm mt-3 opacity-80">— Amara T.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-md space-y-6"
        >
          <motion.div variants={staggerItem}>
            <h1
              className="font-display text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Create your account
            </h1>
            {plan !== "free" && (
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: "var(--accent)" }}
              >
                You're signing up for the{" "}
                {plan.charAt(0).toUpperCase() + plan.slice(1)} plan 🎉
              </p>
            )}
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Free forever. No credit card required.
            </p>
          </motion.div>

          <motion.form
            variants={staggerItem}
            onSubmit={handleSignup}
            className="space-y-4"
          >
            <div>
              <Label style={{ color: "var(--text-secondary)" }}>
                Full Name
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="mt-1.5"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
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
            <div>
              <Label style={{ color: "var(--text-secondary)" }}>Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="pr-10"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Password strength bar */}
              {password && (
                <div className="mt-1.5">
                  <div
                    className="h-1 rounded-full"
                    style={{ backgroundColor: "var(--bg-surface)" }}
                  >
                    <div
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: strength.width,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label style={{ color: "var(--text-secondary)" }}>
                Confirm Password
              </Label>
              <Input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </motion.form>

          <motion.div variants={staggerItem} className="relative">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full border-t"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div className="relative flex justify-center text-xs">
              <span
                className="px-2"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-muted)",
                }}
              >
                or continue with
              </span>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Button
              variant="outline"
              onClick={handleGoogle}
              className="w-full"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--text-primary)",
              }}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4 mr-2"
              />
              Continue with Google
            </Button>
          </motion.div>

          <motion.p
            variants={staggerItem}
            className="text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Log in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
