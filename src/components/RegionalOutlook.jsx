import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";

const METRICS = [
  { key: "T2M", label: "Temp", unit: "°C" },
  { key: "RH2M", label: "Humidity", unit: "%" },
  { key: "PS", label: "Pressure", unit: "hPa" },
  { key: "WS10M", label: "Wind", unit: "m/s" },
  { key: "PRECTOTCORR", label: "Precip", unit: "mm" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function RegionalOutlook() {
  const [options, setOptions] = useState(null);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [date, setDate] = useState(todayISO());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .weatherLocations()
      .then((res) => {
        setOptions(res);
        const firstState = res.states[0];
        setState(firstState);
        setDistrict(res.districts_by_state[firstState][0]);
      })
      .catch((e) => setError(e.message));
  }, []);

  const districts = useMemo(() => {
    if (!options || !state) return [];
    return options.districts_by_state[state] || [];
  }, [options, state]);

  const onStateChange = (v) => {
    setState(v);
    setDistrict(options.districts_by_state[v][0]);
  };

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    api
      .weatherRegionalForecast({ state, district, date })
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="panel" style={{ marginTop: 24 }}>
      <div className="panel-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <div className="section-title" style={{ marginBottom: 4 }}>
            Regional outlook — any district in India
          </div>
          <span className="page-tag" style={{ "--accent": "var(--weather)" }}>
            Live · Open-Meteo, not TimeMixer
          </span>
        </div>
        <p className="hint-msg" style={{ marginBottom: 18 }}>
          TimeMixer above is trained on one fixed station only. This looks up real weather
          data for the state, district and date you pick instead.
        </p>

        {!options ? (
          <p className="hint-msg">Loading district catalogue…</p>
        ) : (
          <form onSubmit={submit}>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="ro-state">State</label>
                <select id="ro-state" value={state} onChange={(e) => onStateChange(e.target.value)}>
                  {options.states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="ro-district">District</label>
                <select id="ro-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="ro-date">Start date</label>
                <input id="ro-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </div>

            <div className="actions">
              <motion.button
                className="btn"
                type="submit"
                style={{ background: "var(--weather)", borderColor: "var(--weather)" }}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
              >
                {loading ? <span className="spinner" /> : "Get 7-day outlook"}
              </motion.button>
            </div>
            {error && <div className="error-msg">{error}</div>}
          </form>
        )}

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.location.name + result.effective_start_date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: 22 }}
            >
              <div className="hint-msg" style={{ marginBottom: 10 }}>
                {result.location.name}, {result.location.state} ({result.location.latitude.toFixed(2)}°,{" "}
                {result.location.longitude.toFixed(2)}°) ·{" "}
                {result.source === "open-meteo-archive" ? "historical record" : "live forecast"}
              </div>
              {result.date_out_of_range && (
                <div
                  className="error-msg"
                  style={{ color: "var(--ink-soft)", borderColor: "var(--line-strong)", background: "var(--paper)" }}
                >
                  {result.requested_start_date} isn't available, so this outlook starts{" "}
                  {result.effective_start_date} instead.
                </div>
              )}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      {METRICS.map((m) => (
                        <th style={thStyle} key={m.key}>
                          {m.label} <span className="unit">{m.unit}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.forecast.map((d) => (
                      <tr key={d.date}>
                        <td style={tdStyle}>{d.date}</td>
                        {METRICS.map((m) => (
                          <td style={{ ...tdStyle, fontFamily: "var(--font-mono)" }} key={m.key}>
                            {d[m.key].toFixed(1)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid var(--line)",
  color: "var(--ink-soft)",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid var(--line)",
  whiteSpace: "nowrap",
};
