import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CloudRain, Sprout, FlaskConical, TrendingUp, Radio } from "lucide-react";
import api from "./lib/api";
import Home from "./pages/Home";
import WeatherStation from "./pages/WeatherStation";
import CropAdvisor from "./pages/CropAdvisor";
import FertilizerAdvisor from "./pages/FertilizerAdvisor";
import YieldEstimator from "./pages/YieldEstimator";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: Radio, exact: true },
  { to: "/weather", label: "Weather Station", icon: CloudRain, accent: "--weather" },
  { to: "/crop", label: "Crop Advisor", icon: Sprout, accent: "--crop" },
  { to: "/fertilizer", label: "Fertilizer Advisor", icon: FlaskConical, accent: "--fertilizer" },
  { to: "/yield", label: "Yield Estimator", icon: TrendingUp, accent: "--yield" },
];

export default function App() {
  const [apiUp, setApiUp] = useState(null);
  const location = useLocation();

  useEffect(() => {
    api
      .health()
      .then(() => setApiUp(true))
      .catch(() => setApiUp(false));
  }, []);

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          <motion.div
            className="brand-mark"
            initial={{ rotate: -8, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Aɪ
          </motion.div>
          <h1>AgriIntel</h1>
          <span>Weather &amp; precision agriculture models, served live</span>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact, accent }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
              style={accent ? { "--accent": `var(${accent})` } : undefined}
            >
              {({ isActive }) => (
                <>
                  <span className="dot" style={accent ? { "--accent": `var(${accent})` } : undefined} />
                  <Icon size={15} strokeWidth={2} />
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="nav-active-underline"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="rail-foot">
          <div className="status-line">
            {apiUp === null ? (
              <span className="spinner" />
            ) : (
              <motion.span
                className={"status-dot" + (apiUp ? "" : " down")}
                animate={apiUp ? { scale: [1, 1.35, 1] } : {}}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {apiUp === null ? "Checking inference API…" : apiUp ? "Inference API online" : "Inference API unreachable"}
          </div>
          <div style={{ marginTop: 8 }}>
            <code>TimeMixer · TabPFN · TabNet · TabM</code>
          </div>
        </div>
      </aside>

      <main className="main">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home apiUp={apiUp} />} />
            <Route path="/weather" element={<WeatherStation />} />
            <Route path="/crop" element={<CropAdvisor />} />
            <Route path="/fertilizer" element={<FertilizerAdvisor />} />
            <Route path="/yield" element={<YieldEstimator />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
