import assert from "node:assert/strict";
import test from "node:test";
import {
  buildARouteBranches,
  buildFiveRouteBranches,
} from "../app/lib/mta/routeBranches.js";

const stopTimes = (ids) => ids.map((stopId, index) => ({
  stop_id: stopId,
  arrival_time: `10:${String(index).padStart(2, "0")}:00`,
  departure_time: `10:${String(index).padStart(2, "0")}:00`,
}));
const routeStop = (id) => ({ id });

test("builds A branches and restores one-direction Aqueduct service", () => {
  const leffertsTrip = { trip_id: "lefferts" };
  const farRockawayTrip = { trip_id: "far-rockaway" };
  const stopTimesByTrip = new Map([
    ["lefferts", stopTimes(["A02", "A61", "A63", "A65"])],
    ["far-rockaway", stopTimes(["A02", "A61", "H02", "H04", "H11"])],
  ]);
  const result = buildARouteBranches({
    candidates: [leffertsTrip, farRockawayTrip],
    normalStopIds: ["A02", "A61"],
    nowMinute: 600,
    realtimeEntities: [],
    routeStop,
    scheduledToday: [leffertsTrip, farRockawayTrip],
    stopTimesByTrip,
  });

  assert.deepEqual(result.normalStopIds, ["A02", "A61"]);
  assert.deepEqual(
    result.branches.find(({ id }) => id === "far-rockaway").stops.map(({ id }) => id),
    ["H01", "H02", "H04", "H11"]
  );
});

test("orders the 5 north-to-south and exposes Nereid when realtime serves it", () => {
  const result = buildFiveRouteBranches({
    normalStopIds: ["101", "213", "501"],
    realtimeRoutesByStop: new Map([["210", new Set(["5"])]]),
    routeStop,
  });

  assert.deepEqual(result.normalStopIds, ["501", "213", "101"]);
  assert.equal(result.branches[0].id, "nereid");
  assert.equal(result.branches[0].stops.at(-1).id, "212");
});
