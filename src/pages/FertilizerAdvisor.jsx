import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import PageTransition from "../components/PageTransition";
import AnimatedNumber from "../components/AnimatedNumber";
import ProbBar from "../components/ProbBar";
import NeuralField from "../components/NeuralField";

const NUMERIC_FIELDS = [
  { key: "Soil_pH", label: "Soil pH", default: 6.07, step: 0.01 },
  { key: "Soil_Moisture", label: "Soil moisture", unit: "%", default: 34.98, step: 0.1 },
  { key: "Organic_Carbon", label: "Organic carbon", unit: "%", default: 0.32, step: 0.01 },
  { key: "Electrical_Conductivity", label: "EC", unit: "dS/m", default: 1.87, step: 0.01 },
  { key: "Nitrogen_Level", label: "Nitrogen", unit: "kg/ha", default: 61, step: 1 },
  { key: "Phosphorus_Level", label: "Phosphorus", unit: "kg/ha", default: 44, step: 1 },
  { key: "Potassium_Level", label: "Potassium", unit: "kg/ha", default: 84, step: 1 },
  { key: "Temperature", label: "Temperature", unit: "°C", default: 19.84, step: 0.1 },
  { key: "Humidity", label: "Humidity", unit: "%", default: 83.31, step: 0.1 },
  { key: "Rainfall", label: "Rainfall", unit: "mm", default: 1693.22, step: 1 },
  { key: "Fertilizer_Used_Last_Season", label: "Fertilizer used last season", unit: "kg/ha", default: 297.15, step: 1 },
  { key: "Yield_Last_Season", label: "Yield last season", unit: "t/ha", default: 1.19, step: 0.01 },
];

const CATEGORICAL_KEYS = [
  "Soil_Type",
  "Crop_Type",
  "Crop_Growth_Stage",
  "Season",
  "Irrigation_Type",
  "Previous_Crop",
  "Region",
];

export default function FertilizerAdvisor() {
  const [options, setOptions] = useState(null);
  const [values, setValues] = useState(() =>
    Object.fromEntries(NUMERIC_FIELDS.map((f) => [f.key, f.default]))
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .fertilizerOptions()
      .then((res) => {
        setOptions(res);
        const defaults = {};
        for (const key of CATEGORICAL_KEYS) {
          defaults[key] = res.categorical_options[key][0];
        }
        setValues((prev) => ({ ...defaults, ...prev }));
      })
      .catch((e) => setError(e.message));
  }, []);

  const update = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    api
      .fertilizerRecommend(values)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const maxProb = result ? result.top_predictions[0].probability : 1;

  return (
    <PageTransition>
      <div className="page-head" style={{ "--accent": "var(--fertilizer)" }}>
        <div>
          <h2>Fertilizer Advisor</h2>
           <NeuralField className="hero-field" height={520} nodeCount={100} />
          <p>
            A multi-step TabNet model weighs soil chemistry against crop stage, irrigation and
            season to recommend a treatment.
          </p>
        </div>
        <span className="page-tag">TabNet · 7 treatments</span>
      </div>

      <div className="panel panel-split">
        <div className="panel-section">
          <div className="section-title">Soil &amp; field profile</div>

          {!options ? (
            <p className="hint-msg">Loading field option list…</p>
          ) : (
            <form onSubmit={submit}>
              <div className="field-grid">
                {CATEGORICAL_KEYS.map((key) => (
                  <div className="field" key={key}>
                    <label htmlFor={key}>{key.replace(/_/g, " ")}</label>
                    <select id={key} value={values[key] || ""} onChange={(e) => update(key, e.target.value)}>
                      {options.categorical_options[key].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="field-grid" style={{ marginTop: 16 }}>
                {NUMERIC_FIELDS.map((f) => (
                  <div className="field" key={f.key}>
                    <label htmlFor={f.key}>
                      {f.label} {f.unit && <span className="unit">{f.unit}</span>}
                    </label>
                    <input
                      id={f.key}
                      type="number"
                      step={f.step}
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
                  style={{ background: "var(--fertilizer)", borderColor: "var(--fertilizer)" }}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                >
                  {loading ? <span className="spinner" /> : "Recommend fertilizer"}
                </motion.button>
              </div>
              {error && <div className="error-msg">{error}</div>}
            </form>
          )}
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
                Fill in the field profile and run the advisor to see the recommended treatment.
              </motion.div>
            ) : (
              <motion.div
                key={result.recommended_fertilizer}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="big-readout" style={{ "--accent": "var(--fertilizer)" }}>
                  <span className="label">Recommended</span>
                  <span className="value">{result.recommended_fertilizer}</span>
                </div>
                <div className="sub-readout">
                  <span className="label">Model confidence</span>
                  <span className="value">
                    <AnimatedNumber value={result.confidence * 100} decimals={1} suffix="%" />
                  </span>
                </div>

                <div style={{ marginTop: 22 }}>
                  <div className="section-title" style={{ marginBottom: 12 }}>
                    All candidates
                  </div>
                  <div className="prob-list">
                    {result.top_predictions.map((p, i) => (
                      <ProbBar
                        key={p.fertilizer}
                        name={p.fertilizer}
                        probability={p.probability}
                        maxProb={maxProb}
                        accent="var(--fertilizer)"
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
