import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import Bindings from "gtfs-realtime-bindings";

export const RAILROADS = {
  lirr: { name: "Long Island Rail Road", shortName: "LIRR" },
  mnr: { name: "Metro-North Railroad", shortName: "Metro-North" },
};

const MTA_FEED_BASE = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds";
const SCHEDULE_CACHE_TTL = 60 * 60 * 1000;
const LIVE_CACHE_TTL = 15 * 1000;
const ALERT_CACHE_TTL = 30 * 1000;
const REQUEST_TIMEOUT = 20_000;
const cache = new Map();
const pendingRequests = new Map();

async function cached(key, ttl, load) {
  const previous = cache.get(key);
  if (previous && Date.now() - previous.loadedAt < ttl) {
    return previous.value;
  }

  if (!pendingRequests.has(key)) {
    const request = load()
      .then((value) => {
        cache.set(key, { value, loadedAt: Date.now() });
        return value;
      })
      .finally(() => pendingRequests.delete(key));
    pendingRequests.set(key, request);
  }

  return pendingRequests.get(key);
}

async function fetchFeed(url) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
  if (!response.ok) {
    throw new Error(`Railroad feed returned ${response.status}`);
  }
  return response;
}

function parseCsv(zip, filename) {
  const entry = zip.getEntry(filename);
  if (!entry) throw new Error(`Railroad schedule is missing ${filename}`);
  return parse(entry.getData().toString(), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });
}

function parseScheduleZip(bytes) {
  const zip = new AdmZip(Buffer.from(bytes));
  const routes = parseCsv(zip, "routes.txt").map((route) => ({
    id: route.route_id,
    name: route.route_long_name,
    color: `#${route.route_color || "0066aa"}`,
  }));
  const stops = parseCsv(zip, "stops.txt")
    .filter((stop) => !stop.location_type || stop.location_type === "0")
    .map((stop) => ({
      id: stop.stop_id,
      name: stop.stop_name,
      accessible: stop.wheelchair_boarding === "1",
    }));
  const stopTimes = new Map();

  for (const row of parseCsv(zip, "stop_times.txt")) {
    const tripStops = stopTimes.get(row.trip_id) || [];
    tripStops.push(row);
    stopTimes.set(row.trip_id, tripStops);
  }
  for (const tripStops of stopTimes.values()) {
    tripStops.sort((left, right) => Number(left.stop_sequence) - Number(right.stop_sequence));
  }

  return {
    routes,
    stops,
    stopsById: new Map(stops.map((stop) => [stop.id, stop])),
    trips: parseCsv(zip, "trips.txt"),
    stopTimes,
  };
}

export async function railroadSchedule(agency) {
  if (!RAILROADS[agency]) throw new Error("Unknown railroad");

  return cached(`${agency}:schedule`, SCHEDULE_CACHE_TTL, async () => {
    const response = await fetchFeed(`https://rrgtfsfeeds.s3.amazonaws.com/gtfs${agency}.zip`);
    return parseScheduleZip(await response.arrayBuffer());
  });
}

function vehiclePositions(feed) {
  const vehicles = new Map();
  for (const entity of feed.entity) {
    const tripId = entity.vehicle?.trip?.tripId;
    if (tripId) vehicles.set(tripId, entity.vehicle);
  }
  return vehicles;
}

function parseLiveTrip(entity, vehicles) {
  const update = entity.tripUpdate;
  const vehicle = entity.vehicle || vehicles.get(update.trip.tripId);

  return {
    id: update.trip.tripId,
    routeId: update.trip.routeId,
    number: update.vehicle?.label || vehicle?.vehicle?.label || entity.id,
    canceled: update.trip.scheduleRelationship === 3,
    currentStop: vehicle?.stopId || null,
    stops: (update.stopTimeUpdate || []).map((stop) => ({
      id: stop.stopId,
      time: Number(stop.departure?.time || stop.arrival?.time) || null,
      delay: Number(stop.departure?.delay ?? stop.arrival?.delay ?? 0),
      skipped: stop.scheduleRelationship === 1,
    })),
  };
}

export async function railroadLive(agency) {
  return cached(`${agency}:live`, LIVE_CACHE_TTL, async () => {
    const response = await fetchFeed(`${MTA_FEED_BASE}/${agency}%2Fgtfs-${agency}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const feed = Bindings.transit_realtime.FeedMessage.decode(bytes);
    const vehicles = vehiclePositions(feed);

    return {
      updatedAt: Number(feed.header.timestamp),
      trips: feed.entity
        .filter((entity) => entity.tripUpdate)
        .map((entity) => parseLiveTrip(entity, vehicles)),
    };
  });
}

function translatedText(value) {
  return value?.translation?.find((translation) => translation.language === "en")?.text
    || value?.translation?.[0]?.text
    || "";
}

function alertIsActive(alert, now) {
  return !alert.active_period?.length || alert.active_period.some((period) => (
    (!period.start || Number(period.start) <= now)
    && (!period.end || Number(period.end) > now)
  ));
}

function alertCategory(alert, alertType) {
  const plannedCauses = [9, 10, "CONSTRUCTION", "MAINTENANCE"];
  return /^planned/i.test(alertType) || plannedCauses.includes(alert.cause)
    ? "planned"
    : "happening";
}

export async function railroadAlerts(agency) {
  return cached(`${agency}:alerts`, ALERT_CACHE_TTL, async () => {
    const response = await fetchFeed(`${MTA_FEED_BASE}/camsys%2F${agency}-alerts.json`);
    const feed = await response.json();
    const now = Date.now() / 1000;

    return (feed.entity || [])
      .filter(({ alert }) => alert && alertIsActive(alert, now))
      .map(({ id, alert }) => {
        const alertType = alert["transit_realtime.mercury_alert"]?.alert_type
          || "Service alert";
        return {
          id,
          alertType,
          header: translatedText(alert.header_text),
          description: translatedText(alert.description_text),
          category: alertCategory(alert, alertType),
          routes: (alert.informed_entity || [])
            .map((entity) => entity.route_id)
            .filter(Boolean),
        };
      });
  });
}

export function railroadPatterns(schedule, routeId) {
  const patterns = new Map();

  for (const trip of schedule.trips) {
    if (trip.route_id !== routeId) continue;
    const stopIds = (schedule.stopTimes.get(trip.trip_id) || []).map((row) => row.stop_id);
    if (!stopIds.length) continue;

    const key = `${stopIds[0]}:${stopIds.at(-1)}`;
    const previous = patterns.get(key);
    if (!previous || stopIds.length > previous.length) patterns.set(key, stopIds);
  }

  return [...patterns.entries()].map(([id, stopIds]) => ({
    id,
    stops: stopIds.map((stopId) => schedule.stopsById.get(stopId)).filter(Boolean),
  }));
}
