import { Link } from "react-router-dom";
import { CloudRain, Sprout, FlaskConical, TrendingUp } from "lucide-react";

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

export default function Home({ apiUp }) {
  return (
    <>
      <div className="hero">
        <h2>Four models, one field console.</h2>
        <p>
          This console serves a deep-learning framework for weather forecasting and precision
          agricultural decision support — trained models wired directly to a live inference
          API. Pick an instrument to run it against your own numbers.
        </p>
        {apiUp === false && (
          <div className="error-msg" style={{ maxWidth: 480 }}>
            The inference API isn't reachable right now. Start the FastAPI backend (see
            backend/README.md) and refresh.
          </div>
        )}
      </div>

      <div className="tool-grid">
        {TOOLS.map(({ to, icon: Icon, accent, model, title, desc }) => (
          <Link key={to} to={to} className="tool-card" style={{ "--accent": `var(${accent})` }}>
            <Icon size={19} strokeWidth={1.8} color={`var(${accent})`} />
            <div className="tool-model">{model}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
