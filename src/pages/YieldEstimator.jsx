import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const CURRENT_YEAR = new Date().getFullYear();

export default function YieldEstimator() {
  const [options, setOptions] = useState(null);
  const [values, setValues] = useState({
    State_Name: "Andhra Pradesh",
    District_Name: "SPSR NELLORE",
    Season: "Whole Year",
    Crop: "Rice",
    Crop_Year: CURRENT_YEAR,
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
    <>
      <div className="page-head" style={{ "--accent": "var(--yield)" }}>
        <div>
          <h2>Yield Estimator</h2>
          <p>
            A TabM ensemble estimates per-hectare yield from location, season,
            crop and cultivated area, then scales it to total expected production.
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
                  <select
                    id="state"
                    value={values.State_Name}
                    onChange={(e) =>
                      update("State_Name", e.target.value)
                    }
                  >
                    {options.states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="district">District</label>
                  <select
                    id="district"
                    value={values.District_Name}
                    onChange={(e) =>
                      update("District_Name", e.target.value)
                    }
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="season">Season</label>
                  <select
                    id="season"
                    value={values.Season}
                    onChange={(e) =>
                      update("Season", e.target.value)
                    }
                  >
                    {options.seasons.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="crop">Crop</label>
                  <select
                    id="crop"
                    value={values.Crop}
                    onChange={(e) =>
                      update("Crop", e.target.value)
                    }
                  >
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
                    value={values.Crop_Year}
                    onChange={(e) =>
                      update(
                        "Crop_Year",
                        parseInt(e.target.value, 10)
                      )
                    }
                    required
                  />
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
                    onChange={(e) =>
                      update(
                        "Area",
                        parseFloat(e.target.value)
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="actions">
                <button
                  className="btn"
                  type="submit"
                  style={{
                    background: "var(--yield)",
                    borderColor: "var(--yield)",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner" />
                  ) : (
                    "Estimate yield"
                  )}
                </button>
              </div>

              {error && <div className="error-msg">{error}</div>}
            </form>
          )}
        </div>

        <div className="panel-section">
          <div className="section-title">Estimate</div>

          {!result ? (
            <div className="readout-empty">
              Choose a plot's location, season and crop to estimate its yield.
            </div>
          ) : (
            <>
              <div
                className="big-readout"
                style={{ "--accent": "var(--yield)" }}
              >
                <span className="label">Predicted yield</span>
                <span className="value">
                  {result.predicted_yield.toFixed(2)}
                  <span className="unit">tonnes / ha</span>
                </span>
              </div>

              <div className="sub-readout">
                <span className="label">
                  Estimated total production ({values.Area} ha)
                </span>
                <span className="value">
                  {result.estimated_production.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  tonnes
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

