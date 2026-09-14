import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Animates a numeric readout from its previous value to a new one whenever
 * `value` changes, instead of snapping instantly - used for confidence
 * scores, predicted yield, etc.
 */
export default function AnimatedNumber({ value, decimals = 1, suffix = "", prefix = "" }) {
  const motionVal = useMotionValue(value ?? 0);
  const spring = useSpring(motionVal, { stiffness: 90, damping: 20, mass: 0.6 });
  const display = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    motionVal.set(value ?? 0);
  }, [value, motionVal]);

  return <motion.span>{display}</motion.span>;
}
