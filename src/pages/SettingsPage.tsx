import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Palette,
  Shield,
  Settings,
  Upload,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/ui/PageHeader";
import { fadeUp } from "@/lib/motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Profile } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
  "Nut-Free",
] as const;

type ThemeOption = "light" | "dark" | "system";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [fullName, setFullName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeOption>(
    () => (localStorage.getItem("theme") as ThemeOption) || "system",
  );

  // Password & delete state
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [changingPw, setChangingPw] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");

  // ─── Fetch profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        const p = data as Profile;
        setProfile(p);
        setFullName(p.full_name ?? "");
        setBio(p.bio ?? "");
        setDietary(p.dietary_preferences ?? []);
        setAvatarUrl(p.avatar_url ?? null);
      }
      setProfileLoading(false);
    };

    fetchProfile();
  }, [user]);

  // ─── Loading guard ─────────────────────────────────────────────────────────
  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-center text-lg text-muted">Loading Settings...</p>
      </div>
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const toggleDietary = (option: string) => {
    setDietary((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option],
    );
  };

  const applyTheme = (t: ThemeOption) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    const root = document.documentElement;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (t === "dark" || (t === "system" && systemDark)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        dietary_preferences: dietary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) toast.error("Failed to save. Please try again.");
    else toast.success("Profile updated!");

    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { data, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload avatar.");
      return;
    }

    const publicUrl = supabase.storage.from("avatars").getPublicUrl(data.path)
      .data.publicUrl;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) toast.error("Avatar uploaded but profile update failed.");
    else {
      setAvatarUrl(publicUrl);
      toast.success("Avatar updated!");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8)
      return toast.error("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match.");
    setChangingPw(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error("Failed to update password.");
    else {
      toast.success("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
    }

    setChangingPw(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const initials = (fullName || user?.email || "U").charAt(0).toUpperCase();

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar / Tab bar ──
            Mobile: 4-column grid so all tabs always fit.
            lg+:    vertical sidebar column.
        */}
        <nav className="grid grid-cols-4 gap-1 lg:grid-cols-none lg:flex lg:flex-col lg:w-56 lg:shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="
                  flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-medium
                  transition-colors
                  lg:flex-row lg:gap-2 lg:px-4 lg:py-2.5 lg:text-sm lg:whitespace-nowrap
                "
                style={{
                  backgroundColor: active
                    ? "var(--accent-soft)"
                    : "transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate w-full text-center lg:text-left lg:w-auto">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Tab content ── */}
        <motion.div {...fadeUp} className="flex-1 min-w-0 max-w-xl space-y-6">
          {/* ── Profile tab ── */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Avatar row */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center font-display text-2xl font-bold text-white"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow"
                    style={{ backgroundColor: "var(--accent)" }}
                    aria-label="Change avatar"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                <div className="min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {fullName || "Your Name"}
                  </p>
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Full name */}
              <div>
                <Label style={{ color: "var(--text-secondary)" }}>
                  Full Name
                </Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Bio */}
              <div>
                <Label style={{ color: "var(--text-secondary)" }}>Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  className="mt-1.5 resize-none"
                  rows={3}
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {bio.length}/160
                </p>
              </div>

              <Button
                onClick={saveProfile}
                disabled={saving}
                className="w-full sm:w-auto text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}

          {/* ── Preferences tab ── */}
          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div>
                <Label
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Dietary Preferences
                </Label>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Select all that apply — used to personalise recipe
                  suggestions.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((opt) => {
                  const active = dietary.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleDietary(opt)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: active
                          ? "var(--accent)"
                          : "transparent",
                        color: active ? "#fff" : "var(--text-secondary)",
                        border: active
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="w-full sm:w-auto text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          )}

          {/* ── Appearance tab ── */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <Label
                className="text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Theme
              </Label>
              {/* FIX: wrap on very small screens instead of overflowing */}
              <div className="flex flex-wrap gap-2">
                {(["light", "dark", "system"] as ThemeOption[]).map((t) => {
                  const active = theme === t;
                  return (
                    <button
                      key={t}
                      onClick={() => applyTheme(t)}
                      className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors"
                      style={{
                        backgroundColor: active
                          ? "var(--accent)"
                          : "var(--bg-surface)",
                        color: active ? "#fff" : "var(--text-secondary)",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Account tab ── */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Password */}
              <div
                className="rounded-2xl p-5 sm:p-6 space-y-4"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-2">
                  <KeyRound
                    className="w-4 h-4 shrink-0"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <h3
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Change Password
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label style={{ color: "var(--text-secondary)" }}>
                      New Password
                    </Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="mt-1.5"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: "var(--text-secondary)" }}>
                      Confirm Password
                    </Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="mt-1.5"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPw || !newPassword || !confirmPassword}
                    className="w-full sm:w-auto text-white"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {changingPw ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div
                className="rounded-2xl p-5 sm:p-6 space-y-3"
                style={{
                  backgroundColor: "var(--danger-soft)",
                  border: "1px solid var(--danger)",
                }}
              >
                <h3
                  className="font-semibold"
                  style={{ color: "var(--danger)" }}
                >
                  Danger Zone
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Type <strong>DELETE</strong> below to permanently delete your
                  account.
                </p>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="mt-1"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--danger)",
                    color: "var(--text-primary)",
                  }}
                />
                <Button
                  variant="outline"
                  disabled={deleteConfirm !== "DELETE"}
                  onClick={async () => {
                    await handleSignOut();
                    toast.success(
                      "Signed out. Contact support to complete account deletion.",
                    );
                  }}
                  className="w-full sm:w-auto"
                  style={{
                    borderColor: "var(--danger)",
                    color: "var(--danger)",
                    opacity: deleteConfirm !== "DELETE" ? 0.4 : 1,
                  }}
                >
                  Delete My Account
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full sm:w-auto"
                style={{
                  borderColor: "var(--border-strong)",
                  color: "var(--danger)",
                }}
              >
                Log Out
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
