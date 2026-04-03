import { Link } from "react-router-dom";
import { ChefHat, X } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FooterLink {
  label: string;
  to?: string; // internal React Router link
  href?: string; // external anchor link (smooth scroll or external URL)
  placeholder?: boolean; // "coming soon" placeholder pages
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

// ─── Link data ────────────────────────────────────────────────────────────────
const columns: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "testimonies", href: "#testimonials" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    heading: "Company & Legal",
    links: [
      { label: "About", to: "/about", placeholder: true },
      { label: "Blog", to: "/blog", placeholder: true },
      { label: "Press", to: "/press", placeholder: true },
      { label: "Privacy Policy", to: "/privacy", placeholder: true },
      { label: "Terms of Service", to: "/terms", placeholder: true },
    ],
  },

  {
    heading: "Contact",
    links: [
      {
        label: "Email: hello@kitchensync.gmail",
        href: "mailto:hello@kitchensync.gmail",
      },
      { label: "Phone: +250 766 888 ", href: "tel:+250788888" },
    ],
  },
];

// ─── Social links ─────────────────────────────────────────────────────────────
const socials = [
  { icon: X, href: "https://twitter.com", label: "Twitter / X" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function FooterSection() {
  return (
    <footer
      className="border-t py-16"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 w-fit">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <span
                className="font-display text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                KitchenSync
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Cook smarter every day.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4
                className="font-semibold text-sm mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => {
                  const baseClass =
                    "transition-colors hover:opacity-100 opacity-70";
                  const style = { color: "var(--text-secondary)" };

                  // Smooth-scroll anchor (Features, Pricing)
                  if (link.href) {
                    return (
                      <li key={link.label}>
                        <a href={link.href} className={baseClass} style={style}>
                          {link.label}
                        </a>
                      </li>
                    );
                  }

                  // Internal React Router link (placeholder pages)
                  if (link.to) {
                    return (
                      <li key={link.label}>
                        <Link to={link.to} className={baseClass} style={style}>
                          {link.label}
                        </Link>
                      </li>
                    );
                  }

                  return null;
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-12 pt-6 border-t text-center text-sm"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          © 2026 KitchenSync. Built with ❤️ for home cooks everywhere.
        </div>
      </div>
    </footer>
  );
}
