import { useState } from "react";
import api from "../lib/api";

const FIELDS = [
  { key: "N", label: "Nitrogen (N)", unit: "kg/ha", default: 90, min: 0, max: 140, step: 1 },
  { key: "P", label: "Phosphorus (P)", unit: "kg/ha", default: 42, min: 5, max: 145, step: 1 },
  { key: "K", label: "Potassium (K)", unit: "kg/ha", default: 43, min: 5, max: 205, step: 1 },
  { key: "temperature", label: "Temperature", unit: "°C", default: 20.9, min: 8, max: 44, step: 0.1 },
  { key: "humidity", label: "Humidity", unit: "%", default: 82.0, min: 14, max: 100, step: 0.1 },
  { key: "ph", label: "Soil pH", unit: "", default: 6.5, min: 3.5, max: 10, step: 0.05 },
  { key: "rainfall", label: "Rainfall", unit: "mm", default: 202.5, min: 20, max: 300, step: 0.5 },
];

export default function CropAdvisor() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, f.default]))
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, v) =>
    setValues((prev) => ({ ...prev, [key]: v }));

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
    <>
      <div className="page-head" style={{ "--accent": "var(--crop)" }}>
        <div>
          <h2>Crop Advisor</h2>
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
                    onChange={(e) =>
                      update(f.key, parseFloat(e.target.value))
                    }
                    required
                  />
                </div>
              ))}
            </div>

            <div className="actions">
              <button
                className="btn"
                type="submit"
                style={{
                  background: "var(--crop)",
                  borderColor: "var(--crop)",
                }}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  "Recommend a crop"
                )}
              </button>
            </div>

            {error && <div className="error-msg">{error}</div>}
          </form>
        </div>

        <div className="panel-section">
          <div className="section-title">Recommendation</div>

          {!result ? (
            <div className="readout-empty">
              Enter field conditions and run the advisor to see the top-matching crops.
            </div>
          ) : (
            <>
              <div
                className="big-readout"
                style={{ "--accent": "var(--crop)" }}
              >
                <span className="label">Best match</span>
                <span
                  className="value"
                  style={{ textTransform: "capitalize" }}
                >
                  {result.recommended_crop}
                </span>
              </div>

              <div className="sub-readout">
                <span className="label">Model confidence</span>
                <span className="value">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{ marginTop: 22 }}>
                <div
                  className="section-title"
                  style={{ marginBottom: 12 }}
                >
                  Top candidates
                </div>

                <div className="prob-list">
                  {result.top_predictions.map((p, i) => (
                    <div className="prob-row" key={p.crop}>
                      <span className={"name" + (i === 0 ? " top" : "")}>
                        {p.crop}
                      </span>

                      <span className="prob-track">
                        <span
                          className="prob-fill"
                          style={{
                            width: `${(p.probability / maxProb) * 100}%`,
                            background: "var(--crop)",
                          }}
                        />
                      </span>

                      <span className="pct">
                        {(p.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
