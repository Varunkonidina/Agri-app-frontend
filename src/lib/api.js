import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

function unwrap(promise) {
  return promise.then((res) => res.data).catch((err) => {
    const detail = err?.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(", ")
      : detail || err.message || "Request failed";
    throw new Error(message);
  });
}

export const api = {
  health: () => unwrap(client.get("/api/health")),

  weatherHistory: () => unwrap(client.get("/api/weather/history")),
  weatherForecast: (sequence) =>
    unwrap(client.post("/api/weather/forecast", sequence ? { sequence } : {})),

  cropOptions: () => unwrap(client.get("/api/crop/options")),
  cropRecommend: (payload) => unwrap(client.post("/api/crop/recommend", payload)),

  fertilizerOptions: () => unwrap(client.get("/api/fertilizer/options")),
  fertilizerRecommend: (payload) =>
    unwrap(client.post("/api/fertilizer/recommend", payload)),

  yieldOptions: () => unwrap(client.get("/api/yield/options")),
  yieldPredict: (payload) => unwrap(client.post("/api/yield/predict", payload)),
};

export default api;
