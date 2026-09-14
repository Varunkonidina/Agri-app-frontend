import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

export default function ProbBar({ name, probability, maxProb, accent, top, index = 0 }) {
  const pct = maxProb > 0 ? (probability / maxProb) * 100 : 0;
  return (
    <div className="prob-row">
      <span className={"name" + (top ? " top" : "")}>{name}</span>
      <span className="prob-track">
        <motion.span
          className="prob-fill"
          style={{ background: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
      <span className="pct">
        <AnimatedNumber value={probability * 100} decimals={1} suffix="%" />
      </span>
    </div>
  );
}
