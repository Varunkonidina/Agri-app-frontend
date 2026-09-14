import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import PageTransition from "../components/PageTransition";
import AnimatedNumber from "../components/AnimatedNumber";
import ProbBar from "../components/ProbBar";
import NeuralField from "../components/NeuralField";

const FIELDS = [
  { key: "N", label: "Nitrogen (N)", unit: "kg/ha", default: 90, min: 0, max: 140, step: 1 },
  { key: "P", label: "Phosphorus (P)", unit: "kg/ha", default: 42, min: 5, max: 145, step: 1 },
  { key: "K", label: "Potassium (K)", unit: "kg/ha", default: 43, min: 5, max: 205, step: 1 },
  { key: "temperature", label: "Temperature", unit: "°C", default: 20.9, min: 8, max: 44, step: 0.1 },
  { key: "humidity", label: "Humidity", unit: "%", default: 82.0, min: 14, max: 100, step: 0.1 },
  { key: "ph", label: "Soil pH", unit: "", default: 6.5, min: 3.5, max: 10, step: 0.05 },
  { key: "rainfall", label: "Rainfall", unit: "mm", default: 202.9, min: 20, max: 300, step: 0.5 },
];

export default function CropAdvisor() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, f.default]))
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    api
      .cropRecommend(values)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const maxProb = result ? result.top_predictions[0].probability : 1;

  return (
    <PageTransition>
      <div className="page-head" style={{ "--accent": "var(--crop)" }}>
        
        <div>
          <h2>Crop Advisor</h2>
           <NeuralField className="hero-field" height={520} nodeCount={100} />
          <p>
            An in-context transformer compares your field's soil chemistry and climate against
            a reference set of labelled fields to recommend a crop.
          </p>
        </div>
        <span className="page-tag">TabPFN-style · 22 crops</span>
      </div>

      <div className="panel panel-split">
       
        <div className="panel-section">
          
          <div className="section-title">Field conditions</div>
          
          <form onSubmit={submit}>
            
            <div className="field-grid">
              {FIELDS.map((f) => (
                <div className="field" key={f.key}>
                  <label htmlFor={f.key}>
                    {f.label} {f.unit && <span className="unit">{f.unit}</span>}
                  </label>
                  <input
                    id={f.key}
                    type="number"
                    step={f.step}
                    min={f.min}
                    max={f.max}
                    value={values[f.key]}
                    onChange={(e) => update(f.key, parseFloat(e.target.value))}
                    required
                  />
                </div>
              ))}
            </div>
            <div className="actions">
              <motion.button
                className="btn"
                type="submit"
                style={{ background: "var(--crop)", borderColor: "var(--crop)" }}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
              >
                {loading ? <span className="spinner" /> : "Recommend a crop"}
              </motion.button>
            </div>
            {error && <div className="error-msg">{error}</div>}
          </form>
        </div>

        <div className="panel-section">
          <div className="section-title">Recommendation</div>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                className="readout-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Enter field conditions and run the advisor to see the top-matching crops.
              </motion.div>
            ) : (
              <motion.div
                key={result.recommended_crop}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="big-readout" style={{ "--accent": "var(--crop)" }}>
                  <span className="label">Best match</span>
                  <span className="value" style={{ textTransform: "capitalize" }}>
                    {result.recommended_crop}
                  </span>
                </div>
                <div className="sub-readout">
                  <span className="label">Model confidence</span>
                  <span className="value">
                    <AnimatedNumber value={result.confidence * 100} decimals={1} suffix="%" />
                  </span>
                </div>

                <div style={{ marginTop: 22 }}>
                  <div className="section-title" style={{ marginBottom: 12 }}>
                    Top candidates
                  </div>
                  <div className="prob-list">
                    {result.top_predictions.map((p, i) => (
                      <ProbBar
                        key={p.crop}
                        name={p.crop}
                        probability={p.probability}
                        maxProb={maxProb}
                        accent="var(--crop)"
                        top={i === 0}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
