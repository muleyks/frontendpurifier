import {
  aqiInfo,
  deriveReadings,
  nextTelemetry,
  AQI_MIN,
  AQI_MAX,
  INITIAL_TELEMETRY,
} from "../src/sim/telemetry";

describe("aqi banding", () => {
  it("maps AQI to qualitative labels", () => {
    expect(aqiInfo(20).label).toBe("Good");
    expect(aqiInfo(50).label).toBe("Good");
    expect(aqiInfo(75).label).toBe("Moderate");
    expect(aqiInfo(120).label).toBe("Poor");
    expect(aqiInfo(200).key).toBe("poor");
  });
});

describe("deriveReadings", () => {
  it("derives consistent pm2.5 / tvoc / label", () => {
    expect(deriveReadings(100)).toEqual({ aqi: 100, aqiLabel: "Moderate", pm25: 20, tvoc: 130 });
  });
  it("clamps negatives to zero", () => {
    expect(deriveReadings(-5).aqi).toBe(0);
  });
});

describe("nextTelemetry", () => {
  it("stays within bounds across many steps and fan speeds", () => {
    let s = INITIAL_TELEMETRY;
    for (let i = 0; i < 1000; i += 1) {
      s = nextTelemetry(s, { fanSpeed: Math.random() * 100 });
      expect(s.aqi).toBeGreaterThanOrEqual(AQI_MIN);
      expect(s.aqi).toBeLessThanOrEqual(AQI_MAX);
      expect(s.pm25).toBeGreaterThanOrEqual(0);
    }
  });
  it("handles missing previous state", () => {
    expect(nextTelemetry(undefined).aqi).toBeGreaterThanOrEqual(AQI_MIN);
  });
});
