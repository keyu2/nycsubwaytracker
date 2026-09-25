import assert from "node:assert/strict";
import test from "node:test";
import { nearestStations, searchDiscovery, stationRouteIds } from "../app/lib/stationDiscovery.js";

const stations = [
  { id: "near", name: "Jackson Hts-Roosevelt Av", latitude: 40.75, longitude: -73.88, services: [{ id: "G14", routes: ["E", "F", "M", "R"] }] },
  { id: "next", name: "74 St-Broadway", latitude: 40.751, longitude: -73.89, services: [{ id: "710", routes: ["7", "7X"] }] },
  { id: "far", name: "World Trade Center", latitude: 40.7126, longitude: -74.0099, services: [{ id: "E01", routes: ["E"] }] },
];

test("nearestStations keeps nearby station complexes even when services overlap", () => {
  const results = nearestStations(stations, { latitude: 40.75, longitude: -73.88 }, 2);
  assert.deepEqual(results.map((station) => station.id), ["near", "next"]);
  assert.equal(results[0].distance, 0);
});

test("stationRouteIds collapses express variants into route families", () => {
  assert.deepEqual(stationRouteIds(stations[1]), ["7"]);
});

test("searchDiscovery returns an exact route result", () => {
  const results = searchDiscovery(stations, ["E", "F", "7", "7X"], "E");
  assert.deepEqual(results.routes, ["E"]);
  assert.deepEqual(results.stations, []);
});

test("searchDiscovery combines a route and station term", () => {
  const results = searchDiscovery(stations, ["E", "F", "7"], "E Roosevelt");
  assert.deepEqual(results.routes, []);
  assert.deepEqual(results.stations.map((station) => station.id), ["near"]);
});

test("searchDiscovery searches station names without a route", () => {
  const results = searchDiscovery(stations, ["E", "F", "7"], "world trade");
  assert.deepEqual(results.stations.map((station) => station.id), ["far"]);
});
