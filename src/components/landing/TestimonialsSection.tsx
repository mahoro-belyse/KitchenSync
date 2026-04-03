import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const testimonials: Testimonial[] = [
  {
    name: 'Sarah K.',
    role: 'Meal prep enthusiast',
    quote:
      'KitchenSync completely changed how I grocery shop. I used to waste so much food. Now everything I buy gets used.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
  },
  {
    name: 'Marcus D.',
    role: 'Home chef',
    quote:
      "The 'Can I Cook It?' feature is genius. I open the fridge, check the app, and I know exactly what I can make for dinner.",
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
  },
  {
    name: 'Amara T.',
    role: 'Family of 5',
    quote:
      'Meal planning used to take me an hour every Sunday. Now it takes 10 minutes and the grocery list writes itself.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TestimonialsSection() {
  return (
    <section
      className="py-24"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="font-display text-4xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Trusted by home cooks everywhere.
          </h2>
        </motion.div>

        {/* ── Testimonial cards ── */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              whileHover={{
                rotate: 1,
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl p-6 shadow-sm"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Avatar + name row */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>

              {/* Stars */}
              <p className="text-sm mb-3">⭐⭐⭐⭐⭐</p>

              {/* Quote */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                "{t.quote}"
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
