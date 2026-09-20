import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import PageTransition from "../components/PageTransition";
import AnimatedNumber from "../components/AnimatedNumber";

export default function YieldEstimator() {
  const [options, setOptions] = useState(null);
  const [values, setValues] = useState({
    State_Name: "",
    District_Name: "",
    Season: "",
    Crop: "",
    Area: 1200,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .yieldOptions()
      .then((res) => {
        console.log("Yield options:", res);

        const districtsByState =
          res.districts_by_state || res.districts || {};

        const firstState = res.states?.[0] || "";
        const firstDistrict =
          districtsByState[firstState]?.[0] || "";

        const firstSeason = res.seasons?.[0] || "";
        const firstCrop = res.crops?.[0] || "";

        setOptions({
          ...res,
          districts_by_state: districtsByState,
        });

        setValues((prev) => ({
          ...prev,
          State_Name: firstState,
          District_Name: firstDistrict,
          Season: firstSeason,
          Crop: firstCrop,
        }));
      })
      .catch((e) => {
        console.error("Yield options error:", e);
        setError(e.message);
      });
  }, []);

  const districts = useMemo(() => {
    if (!options || !values.State_Name) {
      return [];
    }

    return (
      options.districts_by_state?.[values.State_Name] || []
    );
  }, [options, values.State_Name]);

  const update = (key, v) => {
    setValues((prev) => {
      const next = {
        ...prev,
        [key]: v,
      };

      if (key === "State_Name") {
        next.District_Name =
          options?.districts_by_state?.[v]?.[0] || "";
      }

      return next;
    });

    setResult(null);
    setError(null);
  };

  const submit = (e) => {
    e.preventDefault();

    if (
      !values.State_Name ||
      !values.District_Name ||
      !values.Season ||
      !values.Crop ||
      !values.Area ||
      values.Area <= 0
    ) {
      setError("Please provide valid yield estimation inputs.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      State_Name: values.State_Name,
      District_Name: values.District_Name,
      Season: values.Season,
      Crop: values.Crop,
      Area: values.Area,
    };

    console.log("Yield request:", payload);

    api
      .yieldPredict(payload)
      .then((res) => {
        console.log("Yield response:", res);
        setResult(res);
      })
      .catch((err) => {
        console.error("Yield prediction error:", err);
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to estimate yield."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <PageTransition>
      <div
        className="page-head"
        style={{ "--accent": "var(--yield)" }}
      >
        <div>
          <h2>Yield Estimator</h2>

          <p>
            A TabM ensemble estimates per-hectare yield from
            location, season, crop and cultivated area, then scales
            it to total expected production.
          </p>
        </div>

        <span className="page-tag">TabM · regression</span>
      </div>

      <div className="panel panel-split">
        <div className="panel-section">
          <div className="section-title">Plot details</div>

          {!options ? (
            <p className="hint-msg">
              Loading district catalogue…
            </p>
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
                    {options.states?.map((s) => (
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
                    disabled={!districts.length}
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
                    {options.seasons?.map((s) => (
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
                    {options.crops?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="area">
                    Cultivated area{" "}
                    <span className="unit">ha</span>
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
                        e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value)
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="actions">
                <motion.button
                  className="btn"
                  type="submit"
                  style={{
                    background: "var(--yield)",
                    borderColor: "var(--yield)",
                  }}
                  disabled={
                    loading ||
                    !values.State_Name ||
                    !values.District_Name ||
                    !values.Season ||
                    !values.Crop ||
                    !values.Area
                  }
                  whileHover={{
                    scale: loading ? 1 : 1.03,
                  }}
                  whileTap={{
                    scale: loading ? 1 : 0.97,
                  }}
                >
                  {loading ? (
                    <span className="spinner" />
                  ) : (
                    "Estimate yield"
                  )}
                </motion.button>
              </div>

              {error && (
                <div className="error-msg">
                  {typeof error === "string"
                    ? error
                    : JSON.stringify(error)}
                </div>
              )}
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
                Choose a plot's location, season and crop to
                estimate its yield.
              </motion.div>
            ) : (
              <motion.div
                key={
                  result.predicted_yield +
                  "-" +
                  values.District_Name
                }
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div
                  className="big-readout"
                  style={{
                    "--accent": "var(--yield)",
                  }}
                >
                  <span className="label">
                    Predicted yield
                  </span>

                  <span className="value">
                    <AnimatedNumber
                      value={result.predicted_yield}
                      decimals={2}
                    />

                    <span className="unit">
                      tonnes / ha
                    </span>
                  </span>
                </div>

                <div className="sub-readout">
                  <span className="label">
                    Estimated total production ({values.Area} ha)
                  </span>

                  <span className="value">
                    <AnimatedNumber
                      value={result.estimated_production}
                      decimals={0}
                      suffix=" tonnes"
                    />
                  </span>
                </div>

                <p
                  className="hint-msg"
                  style={{ marginTop: 12 }}
                >
                  Crop year is fixed internally to 2020 for the
                  existing trained TabM model.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}