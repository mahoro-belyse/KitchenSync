import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step {
  num: string;
  title: string;
  description: string;
  image: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const steps: Step[] = [
  {
    num: '01',
    title: 'Stock your pantry',
    description:
      'Add what you have at home — ingredient name, amount, and unit. Takes 2 minutes.',
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
  },
  {
    num: '02',
    title: 'Build your recipe book',
    description:
      'Add recipes with all their ingredients. Your personal cookbook, always with you.',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80',
  },
  {
    num: '03',
    title: 'Know what to cook',
    description:
      "Hit 'Check Pantry' on any recipe. Get an instant green light to cook — or an exact shopping list if you're missing something.",
    image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&q=80',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24"
      style={{ backgroundColor: 'var(--bg-surface)' }}
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
            From pantry to plate in 3 steps.
          </h2>
        </motion.div>

        {/* ── Steps (zigzag layout) ── */}
        <div className="space-y-20">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <motion.div
                key={step.num}
                variants={fadeUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* ── Text block ── */}
                <div className={isEven ? 'lg:order-2' : ''}>
                  {/* Large step number */}
                  <span
                    className="font-display text-7xl font-bold select-none"
                    style={{ color: 'var(--accent)', opacity: 0.15 }}
                  >
                    {step.num}
                  </span>

                  <h3
                    className="font-display text-2xl font-bold -mt-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="mt-3 text-lg leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {step.description}
                  </p>
                </div>

                {/* ── Image block ── */}
                <div
                  className={`rounded-2xl overflow-hidden shadow-xl ${isEven ? 'lg:order-1' : ''}`}
                >
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
