import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.22 },
  },
};

/** Simple opacity fade. Used for overlays, tooltips, and subtle reveals. */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Parent container that staggers its children.
 * Pair with staggerItem on each child element.
 *
 * @example
 *   <motion.ul variants={staggerContainer} initial="initial" animate="animate">
 *     {items.map(item => <motion.li variants={staggerItem} />)}
 *   </motion.ul>
 */
export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

/** Child item for use inside a staggerContainer parent. */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

/** Slides in from the right. Used for drawers and side panels. */
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: { duration: 0.25 },
  },
};

/** Scales up from 0.92 and fades in. Used for modals and result cards. */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.96 },
};
