import { fetchWithTimeout } from "./feeds.js";

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;
const STATION_METADATA_URL = "https://data.ny.gov/resource/5f5g-n3cz.json?$limit=1000";
const BOROUGH_NAMES = {
  B: "Brooklyn",
  Bk: "Brooklyn",
  Bx: "Bronx",
  M: "Manhattan",
  Q: "Queens",
  SI: "Staten Island",
};

const EMPTY_METADATA = Object.freeze({
  accessibleIds: new Set(),
  boroughByStopId: new Map(),
});

let cache;

export async function getStationMetadata() {
  if (cache && Date.now() - cache.loadedAt < CACHE_DURATION_MS) return cache.value;

  try {
    const response = await fetchWithTimeout(STATION_METADATA_URL, { cache: "no-store" });
    if (!response.ok) return EMPTY_METADATA;

    const stations = await response.json();
    const accessibleIds = new Set();
    const boroughByStopId = new Map();

    for (const station of stations) {
      const stopIds = String(station.gtfs_stop_ids || "")
        .split(";")
        .map((id) => id.trim())
        .filter(Boolean);

      for (const stopId of stopIds) {
        if (station.ada === "1") accessibleIds.add(stopId);
        const borough = BOROUGH_NAMES[station.borough] || station.borough;
        if (borough) boroughByStopId.set(stopId, borough);
      }
    }

    const value = { accessibleIds, boroughByStopId };
    cache = { loadedAt: Date.now(), value };
    return value;
  } catch {
    return EMPTY_METADATA;
  }
}
