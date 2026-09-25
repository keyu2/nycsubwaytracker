import test from "node:test";
import assert from "node:assert/strict";

import { isPublicStopId } from "../app/lib/mta/stopIds.js";

test("filters realtime timing points that are absent from official static stops", () => {
  const stopsById = new Map([
    ["R11", { stop_name: "Lexington Av/59 St" }],
    ["R11N", { stop_name: "Lexington Av/59 St" }],
    ["R09", { stop_name: "Queensboro Plaza" }],
  ]);

  assert.equal(isPublicStopId("R11N", stopsById), true);
  assert.equal(isPublicStopId("R09N", stopsById), true);
  assert.equal(isPublicStopId("R60N", stopsById), false);
});
