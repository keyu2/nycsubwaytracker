import test from "node:test";
import assert from "node:assert/strict";
import { createBoardRouteGroups } from "../app/lib/boardRouteGroups.js";

test("groups separate platforms in one station complex into switchable services", () => {
  assert.deepEqual(
    createBoardRouteGroups(["7", "N", "W"], [
      { id: "718", routes: ["7"] },
      { id: "R09", routes: ["N", "W"] },
    ]),
    [
      { id: "7", members: ["7"] },
      { id: "N-W", members: ["N", "W"] },
    ]
  );
});

test("adds a realtime route that is missing from static station services", () => {
  assert.deepEqual(
    createBoardRouteGroups(["7", "7X"], [{ id: "718", routes: ["7"] }]),
    [{ id: "7", members: ["7"] }]
  );
});
