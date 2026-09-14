import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CloudRain, Sprout, FlaskConical, TrendingUp } from "lucide-react";
import PageTransition from "../components/PageTransition";
import NeuralField from "../components/NeuralField";
import TiltCard from "../components/TiltCard";

const TOOLS = [
  {
    to: "/weather",
    icon: CloudRain,
    accent: "--weather",
    model: "TimeMixer · sequence model",
    title: "Weather Station",
    desc: "Projects the next 7 days of temperature, humidity, pressure, wind and rainfall from a 30-day observation window.",
  },
  {
    to: "/crop",
    icon: Sprout,
    accent: "--crop",
    model: "TabPFN-style transformer",
    title: "Crop Advisor",
    desc: "Reads soil N-P-K, pH, and local climate to recommend which of 22 crops is best suited to a field.",
  },
  {
    to: "/fertilizer",
    icon: FlaskConical,
    accent: "--fertilizer",
    model: "Multi-step TabNet",
    title: "Fertilizer Advisor",
    desc: "Combines soil chemistry with crop stage and irrigation regime to recommend one of 7 fertilizer treatments.",
  },
  {
    to: "/yield",
    icon: TrendingUp,
    accent: "--yield",
    model: "TabM ensemble",
    title: "Yield Estimator",
    desc: "Estimates per-hectare yield and total production from district, season, crop and cultivated area.",
  },
];

const gridVariants = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home({ apiUp }) {
  return (
    <PageTransition>
      <div className="hero">
        <NeuralField className="hero-field" height={520} nodeCount={100} />
        <div className="hero-content">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Four models, one field console.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            This console serves a deep-learning framework for weather forecasting and precision
            agricultural decision support — trained models wired directly to a live inference
            API. Pick an instrument to run it against your own numbers.
          </motion.p>
          {apiUp === false && (
            <div className="error-msg" style={{ maxWidth: 480, marginTop: 16 }}>
              The inference API isn't reachable right now. Start the FastAPI backend (see
              backend/README.md) and refresh.
            </div>
          )}
        </div>
      </div>

      <motion.div className="tool-grid" variants={gridVariants} initial="initial" animate="animate">
        {TOOLS.map(({ to, icon: Icon, accent, model, title, desc }) => (
          <motion.div key={to} variants={cardVariants}>
            <TiltCard maxTilt={7} className="tool-tilt">
              <Link to={to} className="tool-card" style={{ "--accent": `var(${accent})` }}>
                <Icon size={19} strokeWidth={1.8} color={`var(${accent})`} />
                <div className="tool-model">{model}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </PageTransition>
  );
}
