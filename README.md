# AgriIntel frontend

A React + Vite console with one page per model: Weather Station, Crop Advisor,
Fertilizer Advisor, Yield Estimator, plus an overview page.

## Setup

```bash
cd frontend
npm install
```

The API base URL is read from `.env` (`VITE_API_BASE_URL`, defaults to
`http://localhost:8000`). Edit `.env` if your backend runs elsewhere.

## Run

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Make sure the backend
(see `../backend/README.md`) is running first — the sidebar shows an "inference API
unreachable" notice if it isn't.

## Build for production

```bash
npm run build
npm run preview   # serve the production build locally to sanity-check it
```

`npm run build` outputs static files to `dist/`, deployable to any static host
(Vercel, Netlify, S3 + CloudFront, nginx, etc.) — just make sure
`VITE_API_BASE_URL` points at wherever the FastAPI backend is deployed.

## Structure

```
src/
  lib/api.js            axios client, one function per endpoint
  pages/Home.jsx         overview / links to the four tools
  pages/WeatherStation.jsx     TimeMixer forecast chart
  pages/CropAdvisor.jsx        TabPFN crop recommendation
  pages/FertilizerAdvisor.jsx  TabNet fertilizer recommendation
  pages/YieldEstimator.jsx     TabM yield regression
  index.css               design tokens + all component styles (no UI kit)
```
