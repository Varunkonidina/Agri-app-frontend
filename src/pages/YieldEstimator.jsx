import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import PageTransition from "../components/PageTransition";
import AnimatedNumber from "../components/AnimatedNumber";
import NeuralField from "../components/NeuralField";
export default function YieldEstimator() {
  const [options, setOptions] = useState(null);
  const [values, setValues] = useState({
    State_Name: "",
    District_Name: "",
    Season: "",
    Crop: "",
    Crop_Year: "",
    Area: 1200,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .yieldOptions()
      .then((res) => {
        setOptions(res);
        const firstState = res.states[0];
        setValues((prev) => ({
          ...prev,
          State_Name: firstState,
          District_Name: res.districts_by_state[firstState][0],
          Season: res.seasons[0],
          Crop: res.crops[0],
          Crop_Year: res.max_trained_year,
        }));
      })
      .catch((e) => setError(e.message));
  }, []);

  const districts = useMemo(() => {
    if (!options || !values.State_Name) return [];
    return options.districts_by_state[values.State_Name] || [];
  }, [options, values.State_Name]);

  const update = (key, v) =>
    setValues((prev) => {
      const next = { ...prev, [key]: v };
      if (key === "State_Name") {
        next.District_Name = options.districts_by_state[v][0];
      }
      return next;
    });

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    api
      .yieldPredict(values)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <PageTransition>
      <div className="page-head" style={{ "--accent": "var(--yield)" }}>
        <div>
          <h2>Yield Estimator</h2>
           <NeuralField className="hero-field" height={520} nodeCount={100} />
          <p>
            A TabM ensemble estimates per-hectare yield from location, season, crop and
            cultivated area, then scales it to total expected production.
          </p>
        </div>
        <span className="page-tag">TabM · regression</span>
      </div>

      <div className="panel panel-split">
        <div className="panel-section">
          <div className="section-title">Plot details</div>

          {!options ? (
            <p className="hint-msg">Loading district catalogue…</p>
          ) : (
            <form onSubmit={submit}>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="state">State</label>
                  <select id="state" value={values.State_Name} onChange={(e) => update("State_Name", e.target.value)}>
                    {options.states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="district">District</label>
                  <select id="district" value={values.District_Name} onChange={(e) => update("District_Name", e.target.value)}>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="season">Season</label>
                  <select id="season" value={values.Season} onChange={(e) => update("Season", e.target.value)}>
                    {options.seasons.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="crop">Crop</label>
                  <select id="crop" value={values.Crop} onChange={(e) => update("Crop", e.target.value)}>
                    {options.crops.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="year">
                    Crop year <span className="unit">yyyy</span>
                  </label>
                  <input
                    id="year"
                    type="number"
                    min={options.min_trained_year}
                    max={options.max_trained_year}
                    value={values.Crop_Year}
                    onChange={(e) => update("Crop_Year", parseInt(e.target.value, 10))}
                    required
                  />
                  <span className="field-note">
                    Model was trained on {options.min_trained_year}–{options.max_trained_year}. Years
                    outside that range are evaluated at the nearest trained year.
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="area">
                    Cultivated area <span className="unit">ha</span>
                  </label>
                  <input
                    id="area"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={values.Area}
                    onChange={(e) => update("Area", parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="actions">
                <motion.button
                  className="btn"
                  type="submit"
                  style={{ background: "var(--yield)", borderColor: "var(--yield)" }}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                >
                  {loading ? <span className="spinner" /> : "Estimate yield"}
                </motion.button>
              </div>
              {error && <div className="error-msg">{error}</div>}
            </form>
          )}
        </div>

        <div className="panel-section">
          <div className="section-title">Estimate</div>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                className="readout-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Choose a plot's location, season and crop to estimate its yield.
              </motion.div>
            ) : (
              <motion.div
                key={result.predicted_yield + "-" + result.effective_crop_year}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="big-readout" style={{ "--accent": "var(--yield)" }}>
                  <span className="label">Predicted yield</span>
                  <span className="value">
                    <AnimatedNumber value={result.predicted_yield} decimals={2} />
                    <span className="unit">tonnes / ha</span>
                  </span>
                </div>
                <div className="sub-readout">
                  <span className="label">Estimated total production ({values.Area} ha)</span>
                  <span className="value">
                    <AnimatedNumber value={result.estimated_production} decimals={0} suffix=" tonnes" />
                  </span>
                </div>
                {result.year_out_of_range && (
                  <div
                    className="error-msg"
                    style={{ marginTop: 14, color: "var(--ink-soft)", borderColor: "var(--line-strong)", background: "var(--paper)" }}
                  >
                    {values.Crop_Year} is outside the model's trained range, so this estimate was
                    computed using {result.effective_crop_year} instead.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
