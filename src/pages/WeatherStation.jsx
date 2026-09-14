import { useEffect, useMemo, useState } from "react";
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
    // bridge point so the forecast line connects to the last observed point
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
    <>
      <div className="page-head" style={{ "--accent": "var(--weather)" }}>
        <div>
          <h2>Weather Station</h2>
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
            <div className="field-grid">
              {METRICS.map((m) => (
                <div className="field" key={m.key}>
                  <label>
                    {m.label} <span className="unit">{m.unit}</span>
                  </label>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 18 }}>
                    {latest[m.key].toFixed(1)}
                  </div>
                </div>
              ))}
              <div className="field">
                <label>As of</label>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18 }}>{latest.date}</div>
              </div>
            </div>
          ) : (
            <p className="hint-msg">Loading the latest 30-day observation window…</p>
          )}

          <div className="actions">
            <button className="btn" style={{ background: "var(--weather)", borderColor: "var(--weather)" }} onClick={runForecast} disabled={loading || !history}>
              {loading ? <span className="spinner" /> : "Generate 7-day forecast"}
            </button>
            {forecast && <span className="hint-msg">Forecast starts the day after {latest?.date}</span>}
          </div>

          {error && <div className="error-msg">{error}</div>}

          {forecast && (
            <div className="stat-strip">
              {METRICS.slice(0, 3).map((m) => (
                <div className="stat-cell" key={m.key}>
                  <div className="k">{m.label} avg</div>
                  <div className="v">
                    {(forecast.reduce((s, d) => s + d[m.key], 0) / forecast.length).toFixed(1)}
                    {m.unit}
                  </div>
                </div>
              ))}
            </div>
          )}
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

          <div style={{ width: "100%", height: 260 }}>
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
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey={(d) => (d.kind === "observed" ? d[metric] : null)}
                  stroke="var(--weather)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={(d) => (d.kind === "forecast" ? d[metric] : null)}
                  stroke="var(--yield)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={{ r: 2.5 }}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-row" style={{ marginTop: 6, marginBottom: 0 }}>
            <span className="legend-chip">
              <span className="swatch" style={{ background: "var(--weather)" }} /> observed
            </span>
            <span className="legend-chip">
              <span className="swatch" style={{ background: "var(--yield)" }} /> forecast
            </span>
            {forecastAvg != null && (
              <span className="legend-chip">7-day avg {activeMetric.label.toLowerCase()}: {forecastAvg.toFixed(1)}{activeMetric.unit}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
