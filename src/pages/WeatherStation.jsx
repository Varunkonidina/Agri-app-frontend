import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import api from "../lib/api";
import PageTransition from "../components/PageTransition";
import AnimatedNumber from "../components/AnimatedNumber";
import NeuralField from "../components/NeuralField";
const METRICS = [
  { key: "T2M", label: "Temperature", unit: "°C" },
  { key: "RH2M", label: "Humidity", unit: "%" },
  { key: "PS", label: "Surface pressure", unit: "kPa" },
  { key: "WS10M", label: "Wind speed", unit: "m/s" },
  { key: "PRECTOTCORR", label: "Precipitation", unit: "mm" },
];

export default function WeatherStation() {
  const [history, setHistory] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [metric, setMetric] = useState("T2M");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .weatherHistory()
      .then((res) => setHistory(res.input_sequence))
      .catch((e) => setError(e.message));
  }, []);

  const runForecast = () => {
    setLoading(true);
    setError(null);
    api
      .weatherForecast()
      .then((res) => {
        setHistory(res.input_sequence);
        setForecast(res.forecast);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const chartData = useMemo(() => {
    const past = (history || []).map((d) => ({ ...d, kind: "observed" }));
    const future = (forecast || []).map((d) => ({ ...d, kind: "forecast" }));
    if (past.length && future.length) {
      const bridge = { ...past[past.length - 1], kind: "forecast" };
      return [...past, bridge, ...future];
    }
    return [...past, ...future];
  }, [history, forecast]);

  const latest = history && history[history.length - 1];
  const activeMetric = METRICS.find((m) => m.key === metric);
  const forecastAvg =
    forecast && forecast.reduce((s, d) => s + d[metric], 0) / forecast.length;

  return (
    <PageTransition>
      <div className="page-head" style={{ "--accent": "var(--weather)" }}>
        <div>
          <h2>Weather Station</h2>
           <NeuralField className="hero-field" height={520} nodeCount={100} />
          <p>
            TimeMixer reads the last 30 daily readings and projects the next 7 days across
            five atmospheric variables.
          </p>
        </div>
        <span className="page-tag">TimeMixer · 30 → 7 day</span>
      </div>

      <div className="panel panel-split">
        <div className="panel-section">
          <div className="section-title">Current station reading</div>

          {latest ? (
            <motion.div
              className="field-grid"
              initial="initial"
              animate="animate"
              variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            >
              {METRICS.map((m) => (
                <motion.div
                  className="field"
                  key={m.key}
                  variants={{
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0 },
                  }}
                >
                  <label>
                    {m.label} <span className="unit">{m.unit}</span>
                  </label>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 18 }}>
                    <AnimatedNumber value={latest[m.key]} decimals={1} />
                  </div>
                </motion.div>
              ))}
              <div className="field">
                <label>As of</label>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18 }}>{latest.date}</div>
              </div>
            </motion.div>
          ) : (
            <p className="hint-msg">Loading the latest 30-day observation window…</p>
          )}

          <div className="actions">
            <motion.button
              className="btn"
              style={{ background: "var(--weather)", borderColor: "var(--weather)" }}
              onClick={runForecast}
              disabled={loading || !history}
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
            >
              {loading ? <span className="spinner" /> : "Generate 7-day forecast"}
            </motion.button>
            {forecast && <span className="hint-msg">Forecast starts the day after {latest?.date}</span>}
          </div>

          {error && <div className="error-msg">{error}</div>}

          <AnimatePresence>
            {forecast && (
              <motion.div
                className="stat-strip"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {METRICS.slice(0, 3).map((m) => (
                  <div className="stat-cell" key={m.key}>
                    <div className="k">{m.label} avg</div>
                    <div className="v">
                      <AnimatedNumber
                        value={forecast.reduce((s, d) => s + d[m.key], 0) / forecast.length}
                        decimals={1}
                        suffix={m.unit}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="panel-section">
          <div className="section-title">Forecast chart</div>
          <div className="legend-row">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className="nav-item"
                style={{
                  width: "auto",
                  padding: "5px 10px",
                  fontSize: 12.5,
                  border: "1px solid var(--line)",
                  background: metric === m.key ? "var(--weather-soft)" : "transparent",
                  fontWeight: metric === m.key ? 600 : 400,
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <motion.div
            style={{ width: "100%", height: 260 }}
            key={metric}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10.5, fontFamily: "var(--font-mono)", fill: "var(--ink-soft)" }}
                  tickFormatter={(d) => d?.slice(5)}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 10.5, fontFamily: "var(--font-mono)", fill: "var(--ink-soft)" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--paper-raised)",
                    border: "1px solid var(--line)",
                    borderRadius: 3,
                    fontSize: 12.5,
                    fontFamily: "var(--font-mono)",
                  }}
                  labelStyle={{ color: "var(--ink-soft)" }}
                />
                {history && forecast && (
                  <ReferenceLine x={history[history.length - 1].date} stroke="var(--line-strong)" strokeDasharray="3 3" />
                )}
                <Area
                  type="monotone"
                  dataKey={(d) => (d.kind === "observed" ? d[metric] : null)}
                  stroke="none"
                  fill="var(--weather-soft)"
                  isAnimationActive={true}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
                <Line
                  type="monotone"
                  dataKey={(d) => (d.kind === "observed" ? d[metric] : null)}
                  stroke="var(--weather)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={700}
                  animationEasing="ease-out"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={(d) => (d.kind === "forecast" ? d[metric] : null)}
                  stroke="var(--yield)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={{ r: 2.5 }}
                  isAnimationActive={true}
                  animationDuration={700}
                  animationEasing="ease-out"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
          <div className="legend-row" style={{ marginTop: 6, marginBottom: 0 }}>
            <span className="legend-chip">
              <span className="swatch" style={{ background: "var(--weather)" }} /> observed
            </span>
            <span className="legend-chip">
              <span className="swatch" style={{ background: "var(--yield)" }} /> forecast
            </span>
            {forecastAvg != null && (
              <span className="legend-chip">
                7-day avg {activeMetric.label.toLowerCase()}: {forecastAvg.toFixed(1)}
                {activeMetric.unit}
              </span>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
