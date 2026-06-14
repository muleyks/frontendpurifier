// Simulated air-quality telemetry (frontend-only; no real sensors/backend).
// Shared by the mobile dashboard/analytics and (later) the watch so one source
// of truth drives every screen.

export const AQI_LEVELS = [
  { max: 50, label: "Good", key: "good", color: "#4A9C7A" },
  { max: 100, label: "Moderate", key: "moderate", color: "#D2A24B" },
  { max: Infinity, label: "Poor", key: "poor", color: "#C75B4A" },
];

export const AQI_MIN = 5;
export const AQI_MAX = 180;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// AQI band -> { label, key, color } (never rely on color alone; label carries it too).
export function aqiInfo(aqi) {
  const v = clamp(Number(aqi) || 0, 0, Infinity);
  return AQI_LEVELS.find((l) => v <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

// Keep PM2.5 / TVOC consistent with the AQI shown.
export function deriveReadings(aqi) {
  const a = Math.round(clamp(aqi, 0, 300));
  return { aqi: a, aqiLabel: aqiInfo(a).label, pm25: Math.round(a * 0.2), tvoc: Math.round(40 + a * 0.9) };
}

export const INITIAL_TELEMETRY = deriveReadings(42);

// One simulation step: bounded random walk. fanSpeed is 0..100; a higher fan
// cleans the air faster (pulls AQI down), ambient sources nudge it up.
export function nextTelemetry(state, { fanSpeed = 40, drift = 8 } = {}) {
  const prev = state && Number.isFinite(state.aqi) ? state.aqi : INITIAL_TELEMETRY.aqi;
  const noise = (Math.random() - 0.5) * 2 * drift;
  const cleaning = (clamp(fanSpeed, 0, 100) / 100) * 6;
  const ambient = 2.5;
  const aqi = clamp(prev + noise + ambient - cleaning, AQI_MIN, AQI_MAX);
  return deriveReadings(aqi);
}
