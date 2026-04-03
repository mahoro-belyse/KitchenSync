import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChefHat,
  Users,
  Heart,
  Globe,
  BookOpen,
  Newspaper,
  Shield,
  FileText,
  Cookie,
  Megaphone,
  MapPin,
  Mail,
  X,
  Rss,
  Info,
  CheckCircle,
  Calendar,
  Clock,
  Tag,
} from "lucide-react";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";

// ─── Shared wrapper ───────────────────────────────────────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Sticky mini-nav */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <ChefHat className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="font-display font-bold text-base"
              style={{ color: "var(--accent)" }}
            >
              KitchenSync
            </span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      {children}

      {/* Footer */}
      <footer
        className="border-t mt-24 py-10"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © 2025 KitchenSync. Built with ❤️ for home cooks everywhere.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: "Privacy", to: "/privacy" },
              { label: "Terms", to: "/terms" },
              { label: "Cookies", to: "/cookies" },
            ].map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-sm hover:underline transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Hero header ──────────────────────────────────────────────────────────────
function PageHero({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center"
    >
      <motion.div variants={staggerItem} className="flex justify-center mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "var(--accent-soft)" }}
        >
          <Icon className="w-7 h-7" style={{ color: "var(--accent)" }} />
        </div>
      </motion.div>
      <motion.p
        variants={staggerItem}
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: "var(--accent)" }}
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        variants={staggerItem}
        className="font-display text-4xl sm:text-5xl font-bold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </motion.h1>
      <motion.p
        variants={staggerItem}
        className="text-lg max-w-2xl mx-auto"
        style={{ color: "var(--text-secondary)" }}
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}

function Hr() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
    </div>
  );
}

// ─── Legal section block ──────────────────────────────────────────────────────
function LegalBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className="mb-10"
    >
      <h2
        className="font-display text-xl font-bold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      <div
        className="text-base leading-relaxed space-y-3"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </motion.section>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
function AboutPage() {
  const stats = [
    { value: "12,000+", label: "Home cooks" },
    { value: "340k+", label: "Meals planned" },
    { value: "4.9 ★", label: "Avg rating" },
    { value: "2023", label: "Founded" },
  ];
  const values = [
    {
      icon: Heart,
      title: "Less waste, more flavour",
      desc: "Every ingredient deserves to be used. We build tools that make that effortless.",
    },
    {
      icon: Users,
      title: "Made for real kitchens",
      desc: "Not Michelin-starred restaurants — the everyday kitchens of real families.",
    },
    {
      icon: Globe,
      title: "Accessible everywhere",
      desc: "Great food is universal. KitchenSync works for every culture and cuisine.",
    },
  ];
  const team = [
    {
      name: "Amara Osei",
      role: "Co-founder & CEO",
      initials: "AO",
      bio: "Former chef turned product builder. Passionate about reducing food waste.",
    },
    {
      name: "Luca Ferretti",
      role: "Co-founder & CTO",
      initials: "LF",
      bio: "Full-stack engineer who believes great software should feel invisible.",
    },
    {
      name: "Priya Nair",
      role: "Head of Design",
      initials: "PN",
      bio: "Obsessed with the intersection of beauty and utility in everyday tools.",
    },
  ];

  return (
    <PageShell>
      <PageHero
        icon={Users}
        eyebrow="Our Story"
        title="We're on a mission to end food waste"
        subtitle="KitchenSync started because we were tired of throwing away good food. We built the tool we always wanted — and 12,000 other cooks wanted it too."
      />
      <Hr />

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-2 sm:grid-cols-4 gap-5"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={staggerItem}
            className="text-center rounded-2xl p-6"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="font-display text-3xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              {s.value}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <Hr />

      {/* Values */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.h2
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="font-display text-2xl font-bold text-center mb-10"
          style={{ color: "var(--text-primary)" }}
        >
          What we believe
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-5"
        >
          {values.map((v) => (
            <motion.div
              key={v.title}
              variants={staggerItem}
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--accent-soft)" }}
              >
                <v.icon
                  className="w-5 h-5"
                  style={{ color: "var(--accent)" }}
                />
              </div>
              <h3
                className="font-display font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {v.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {v.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Hr />

      {/* Team */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.h2
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="font-display text-2xl font-bold text-center mb-10"
          style={{ color: "var(--text-primary)" }}
        >
          The team
        </motion.h2>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-5"
        >
          {team.map((m) => (
            <motion.div
              key={m.name}
              variants={staggerItem}
              className="rounded-2xl p-6 text-center"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-display text-lg font-bold text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {m.initials}
              </div>
              <h3
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {m.name}
              </h3>
              <p className="text-xs mb-3" style={{ color: "var(--accent)" }}>
                {m.role}
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {m.bio}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 pb-16 text-center">
        <div
          className="rounded-2xl p-10"
          style={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, hsl(16 77% 45%) 100%)",
          }}
        >
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Join us in the kitchen
          </h2>
          <p className="text-white/80 mb-6">
            Free forever. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white transition-transform hover:scale-105"
            style={{ color: "var(--accent)" }}
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

// ─── BLOG ─────────────────────────────────────────────────────────────────────
function BlogPage() {
  const featured = {
    title:
      "The science of meal planning: how batching reduces decision fatigue",
    excerpt:
      "Every decision you make depletes a finite cognitive resource. We explore why planning your meals in advance doesn't just save time — it saves mental energy for the things that matter.",
    date: "Dec 12, 2024",
    readTime: "8 min read",
    category: "Food Science",
  };
  const posts = [
    {
      title:
        "Why 40% of food bought in the US is thrown away — and what you can do",
      date: "Nov 28, 2024",
      readTime: "6 min",
      category: "Food Waste",
    },
    {
      title: "The pantry method: 5 staples that unlock 50 different meals",
      date: "Nov 15, 2024",
      readTime: "5 min",
      category: "Cooking Tips",
    },
    {
      title: "How KitchenSync calculates what you can cook — under the hood",
      date: "Nov 1, 2024",
      readTime: "4 min",
      category: "Product",
    },
    {
      title:
        "Seasonal cooking for beginners: why in-season produce saves money",
      date: "Oct 20, 2024",
      readTime: "7 min",
      category: "Guides",
    },
    {
      title: "KitchenSync 2.0: everything that's new",
      date: "Oct 5, 2024",
      readTime: "3 min",
      category: "Product",
    },
    {
      title: "The psychology of grocery shopping: why we always buy too much",
      date: "Sep 22, 2024",
      readTime: "5 min",
      category: "Food Science",
    },
  ];
  const categories = [
    "All",
    "Food Science",
    "Food Waste",
    "Cooking Tips",
    "Product",
    "Guides",
  ];

  return (
    <PageShell>
      <PageHero
        icon={BookOpen}
        eyebrow="The KitchenSync Blog"
        title="Stories from the kitchen"
        subtitle="Food science, cooking tips, product updates, and everything in between."
      />

      {/* Category pills */}
      <div className="max-w-5xl mx-auto px-6 pb-8 flex gap-2 overflow-x-auto">
        {categories.map((c, i) => (
          <button
            key={c}
            className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
            style={{
              backgroundColor: i === 0 ? "var(--accent)" : "var(--bg-surface)",
              color: i === 0 ? "#fff" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <Hr />

      {/* Featured */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto px-6 py-12"
      >
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            ✦ Featured
          </span>
          <h2
            className="font-display text-2xl sm:text-3xl font-bold mb-3 leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {featured.title}
          </h2>
          <p
            className="text-base leading-relaxed mb-5"
            style={{ color: "var(--text-secondary)" }}
          >
            {featured.excerpt}
          </p>
          <div
            className="flex items-center gap-4 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {featured.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {featured.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {featured.category}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Post grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto px-6 pb-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {posts.map((post) => (
          <motion.div
            key={post.title}
            variants={staggerItem}
            className="rounded-2xl p-5 group cursor-pointer transition-shadow hover:shadow-md"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3"
              style={{
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-muted)",
              }}
            >
              {post.category}
            </span>
            <h3
              className="font-display font-semibold leading-snug mb-3 group-hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {post.title}
            </h3>
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </PageShell>
  );
}

// ─── PRESS ────────────────────────────────────────────────────────────────────
function PressPage() {
  const coverage = [
    {
      outlet: "TechCrunch",
      logo: "TC",
      date: "Oct 2024",
      quote:
        '"KitchenSync is the budgeting app for your pantry that we\'ve all been waiting for"',
    },
    {
      outlet: "Product Hunt",
      logo: "PH",
      date: "Sep 2024",
      quote:
        '"#1 Product of the Day — beautifully designed and actually useful"',
    },
    {
      outlet: "The Verge",
      logo: "TV",
      date: "Aug 2024",
      quote: '"Finally, a kitchen app that doesn\'t feel like homework"',
    },
    {
      outlet: "Fast Company",
      logo: "FC",
      date: "Jul 2024",
      quote: '"The startup tackling food waste one pantry at a time"',
    },
  ];
  const facts = [
    "12,000+ active users across 40 countries",
    "Average user reduces food waste by 31%",
    "Over 340,000 meals planned since launch",
    "Raised $1.2M pre-seed in 2023",
    "Founded in 2023, headquartered in Kigali, Rwanda",
  ];

  return (
    <PageShell>
      <PageHero
        icon={Newspaper}
        eyebrow="Press & Media"
        title="KitchenSync in the news"
        subtitle="For press enquiries, interviews, or brand assets — reach out to press@kitchensync.app"
      />
      <Hr />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-2 gap-5"
      >
        {coverage.map((item) => (
          <motion.div
            key={item.outlet}
            variants={staggerItem}
            className="rounded-2xl p-6 flex gap-4"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {item.logo}
            </div>
            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "var(--accent)" }}
              >
                {item.outlet} · {item.date}
              </p>
              <p
                className="font-display text-sm font-semibold leading-snug italic"
                style={{ color: "var(--text-primary)" }}
              >
                {item.quote}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Hr />

      <div className="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-2 gap-10">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2
            className="font-display text-xl font-bold mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            Fast facts
          </h2>
          <ul className="space-y-3">
            {facts.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <CheckCircle
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: "var(--success)" }}
                />{" "}
                {f}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2
            className="font-display text-xl font-bold mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            Media contact
          </h2>
          <div
            className="rounded-2xl p-6 space-y-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {[
              { icon: Mail, text: "press@kitchensync.app" },
              { icon: X, text: "@KitchenSyncApp" },
              { icon: MapPin, text: "Kigali, Rwanda" },
            ].map((c) => (
              <div
                key={c.text}
                className="flex items-center gap-2.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <c.icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--accent)" }}
                />{" "}
                {c.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}

// ─── PRIVACY POLICY ───────────────────────────────────────────────────────────
function PrivacyPage() {
  return (
    <PageShell>
      <PageHero
        icon={Shield}
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="We take your privacy seriously. Here's exactly what we collect, why, and how you can control it."
      />
      <Hr />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p
          className="text-sm mb-10 pb-6 border-b"
          style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
        >
          Last updated:{" "}
          <strong style={{ color: "var(--text-secondary)" }}>
            December 1, 2024
          </strong>
        </p>
        <LegalBlock title="1. Information we collect">
          <p>
            We collect information you provide when creating an account: your
            name, email address, and password. We also collect the content you
            enter — pantry items, recipes, meal plans, and grocery lists.
          </p>
          <p>
            We automatically collect usage data including your IP address,
            browser type, pages visited, and actions taken. This helps us
            improve the product and diagnose issues.
          </p>
        </LegalBlock>
        <LegalBlock title="2. How we use your information">
          <p>
            Your data is used solely to provide and improve KitchenSync. We use
            it to authenticate your account, sync your data across devices, and
            send transactional emails.
          </p>
          <p>
            We do not sell your personal data. We do not use your data for
            advertising. We do not share your data with partners for their own
            marketing.
          </p>
        </LegalBlock>
        <LegalBlock title="3. Data storage and security">
          <p>
            Your data is stored on Supabase-managed PostgreSQL databases hosted
            on AWS infrastructure in the EU (Frankfurt). All data is encrypted
            at rest (AES-256) and in transit (TLS 1.3).
          </p>
          <p>
            We follow industry-standard security practices including regular
            audits, least-privilege access controls, and automated threat
            detection.
          </p>
        </LegalBlock>
        <LegalBlock title="4. Your rights">
          <p>
            You have the right to access, correct, and delete your data, and to
            export it in a machine-readable format. Email
            privacy@kitchensync.app to exercise these rights. We'll respond
            within 30 days.
          </p>
        </LegalBlock>
        <LegalBlock title="5. Cookies">
          <p>
            We use only essential cookies for authentication and functional
            cookies for preferences. We do not use tracking or advertising
            cookies. See our Cookie Policy for full details.
          </p>
        </LegalBlock>
        <LegalBlock title="6. Contact">
          <p>
            For privacy-related questions, contact us at privacy@kitchensync.app
            or: KitchenSync Inc., Kigali, Rwanda.
          </p>
        </LegalBlock>
      </div>
    </PageShell>
  );
}

// ─── TERMS OF SERVICE ─────────────────────────────────────────────────────────
function TermsPage() {
  return (
    <PageShell>
      <PageHero
        icon={FileText}
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="By using KitchenSync, you agree to these terms. Written in plain English — no lawyer needed."
      />
      <Hr />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p
          className="text-sm mb-10 pb-6 border-b"
          style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
        >
          Last updated:{" "}
          <strong style={{ color: "var(--text-secondary)" }}>
            December 1, 2024
          </strong>
        </p>
        <LegalBlock title="1. Acceptance of terms">
          <p>
            By creating an account or using KitchenSync ("the Service"), you
            agree to these Terms. If you don't agree, please don't use the
            Service.
          </p>
        </LegalBlock>
        <LegalBlock title="2. Your account">
          <p>
            You're responsible for keeping your credentials secure. You must be
            at least 13 years old to use KitchenSync. You own the content you
            create — recipes, pantry items, and meal plans are yours.
          </p>
        </LegalBlock>
        <LegalBlock title="3. Acceptable use">
          <p>
            You agree not to use KitchenSync to violate laws, infringe
            intellectual property rights, transmit malware, or attempt to gain
            unauthorised access to our systems.
          </p>
        </LegalBlock>
        <LegalBlock title="4. Free and paid plans">
          <p>
            KitchenSync offers a free plan and paid plans (Pro, Family). Paid
            plans are billed monthly or annually and can be cancelled at any
            time. Cancellation takes effect at the end of your billing period.
          </p>
          <p>
            We may change pricing with 30 days' notice. Price changes won't
            affect your current billing period.
          </p>
        </LegalBlock>
        <LegalBlock title="5. Termination">
          <p>
            You can delete your account at any time from Settings → Account &
            Security. We may suspend accounts that violate these terms.
          </p>
        </LegalBlock>
        <LegalBlock title="6. Limitation of liability">
          <p>
            KitchenSync is provided "as is". Our liability is limited to the
            amount you paid us in the preceding 12 months.
          </p>
        </LegalBlock>
        <LegalBlock title="7. Changes to these terms">
          <p>
            We may update these terms with 14 days' notice before material
            changes take effect. Continued use means you accept the updated
            terms.
          </p>
        </LegalBlock>
        <LegalBlock title="8. Contact">
          <p>Questions? Email legal@kitchensync.app.</p>
        </LegalBlock>
      </div>
    </PageShell>
  );
}

// ─── COOKIE POLICY ────────────────────────────────────────────────────────────
function CookiesPage() {
  const cookies = [
    {
      name: "sb-access-token",
      purpose: "Supabase authentication session",
      duration: "Session",
      type: "Essential",
    },
    {
      name: "sb-refresh-token",
      purpose: "Supabase token refresh",
      duration: "6 months",
      type: "Essential",
    },
    {
      name: "theme",
      purpose: "Light/dark mode preference",
      duration: "Persistent",
      type: "Functional",
    },
    {
      name: "sidebar-collapsed",
      purpose: "Sidebar open/closed state",
      duration: "Persistent",
      type: "Functional",
    },
  ];

  return (
    <PageShell>
      <PageHero
        icon={Cookie}
        eyebrow="Legal"
        title="Cookie Policy"
        subtitle="We keep cookies minimal. Here's every single one we use and exactly why."
      />
      <Hr />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p
          className="text-sm mb-10 pb-6 border-b"
          style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
        >
          Last updated:{" "}
          <strong style={{ color: "var(--text-secondary)" }}>
            December 1, 2024
          </strong>
        </p>
        <LegalBlock title="What are cookies?">
          <p>
            Cookies are small text files stored on your device by your browser.
            They help websites remember information about your visit — like
            whether you're logged in.
          </p>
        </LegalBlock>
        <LegalBlock title="What we do NOT use">
          <ul className="space-y-2 ml-4 list-disc">
            <li>Advertising or tracking cookies</li>
            <li>Third-party analytics (Google Analytics, Mixpanel, etc.)</li>
            <li>Social media tracking pixels</li>
          </ul>
        </LegalBlock>
        <LegalBlock title="Cookies we use">
          <p>Only essential and functional cookies — listed in full below.</p>
        </LegalBlock>

        {/* Cookie table */}
        <div
          className="mb-10 rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg-surface)" }}>
              <tr>
                {["Name", "Purpose", "Duration", "Type"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-semibold"
                    style={{
                      color: "var(--text-secondary)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "var(--bg-card)" }}>
              {cookies.map((row, i) => (
                <tr
                  key={row.name}
                  style={{
                    borderBottom:
                      i < cookies.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <td
                    className="px-4 py-3 font-mono text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {row.name}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {row.purpose}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {row.duration}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor:
                          row.type === "Essential"
                            ? "var(--accent-soft)"
                            : "var(--bg-surface)",
                        color:
                          row.type === "Essential"
                            ? "var(--accent)"
                            : "var(--text-muted)",
                      }}
                    >
                      {row.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <LegalBlock title="Managing cookies">
          <p>
            You can control cookies through your browser settings. Disabling
            essential cookies will prevent you from staying logged in.
            Functional cookies can be cleared without affecting app access.
          </p>
        </LegalBlock>
        <LegalBlock title="Contact">
          <p>Questions? Email privacy@kitchensync.app.</p>
        </LegalBlock>
      </div>
    </PageShell>
  );
}

// ─── COMING SOON (Changelog, Roadmap, Careers) ────────────────────────────────
function ComingSoonPage({
  title,
  icon: Icon,
  desc,
}: {
  title: string;
  icon: React.ElementType;
  desc: string;
}) {
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={staggerItem}
            className="flex justify-center mb-5"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-soft)" }}
            >
              <Icon className="w-7 h-7" style={{ color: "var(--accent)" }} />
            </div>
          </motion.div>
          <motion.h1
            variants={staggerItem}
            className="font-display text-4xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </motion.h1>
          <motion.p
            variants={staggerItem}
            className="text-lg mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {desc}
          </motion.p>
          <motion.p
            variants={staggerItem}
            className="text-base mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            This page is coming soon.
          </motion.p>
          <motion.button
            variants={staggerItem}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-primary)",
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </motion.button>
        </motion.div>
      </div>
    </PageShell>
  );
}

// ─── Page map ─────────────────────────────────────────────────────────────────
const PAGE_MAP: Record<string, React.ComponentType> = {
  about: AboutPage,
  blog: BlogPage,
  press: PressPage,
  privacy: PrivacyPage,
  terms: TermsPage,
  cookies: CookiesPage,
  changelog: () => (
    <ComingSoonPage
      title="Changelog"
      icon={Rss}
      desc="A full history of every feature we've shipped."
    />
  ),
  roadmap: () => (
    <ComingSoonPage
      title="Roadmap"
      icon={MapPin}
      desc="Where KitchenSync is headed next."
    />
  ),
  careers: () => (
    <ComingSoonPage
      title="Careers"
      icon={Megaphone}
      desc="We're hiring! Check back soon for open roles."
    />
  ),
};

// ─── Default export ───────────────────────────────────────────────────────────
export default function PlaceholderPage({ title }: { title: string }) {
  // Convert title → lookup key
  // "Privacy Policy" → "privacy", "Terms of Service" → "terms", "Cookie Policy" → "cookies"
  const key = title
    .toLowerCase()
    .replace(" policy", "")
    .replace(" of service", "")
    .trim()
    .replace(/\s+/g, "-");

  const Component = PAGE_MAP[key];

  if (Component) return <Component />;

  return (
    <ComingSoonPage title={title} icon={Info} desc="This page is on its way." />
  );
}
