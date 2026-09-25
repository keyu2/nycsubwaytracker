import test from "node:test";
import assert from "node:assert/strict";
import {
  realtimePathDiffersFromStatic,
  trimStaticPathToRealtimeTerminal,
  tripOriginStopId,
} from "../app/lib/mta/tripPath.js";

const staticPath = [
  { stop_id: "A01N", stop_sequence: "1" },
  { stop_id: "A02N", stop_sequence: "2" },
  { stop_id: "A03N", stop_sequence: "3" },
];

test("accepts sparse realtime updates that follow the static path", () => {
  assert.equal(
    realtimePathDiffersFromStatic(
      [
        { stopId: "A01N", stopSequence: 1 },
        { stopId: "A03N", stopSequence: 3 },
      ],
      staticPath
    ),
    false
  );
});

test("detects a realtime reroute even when stop sequences still match", () => {
  assert.equal(
    realtimePathDiffersFromStatic(
      [
        { stopId: "A01N", stopSequence: 1 },
        { stopId: "X02N", stopSequence: 2 },
        { stopId: "A03N", stopSequence: 3 },
      ],
      staticPath
    ),
    true
  );
});

test("detects an out-of-pattern realtime stop without a sequence", () => {
  assert.equal(
    realtimePathDiffersFromStatic(
      [{ stopId: "X02N" }],
      staticPath
    ),
    true
  );
});

test("ends a scheduled path at the terminal supplied by realtime data", () => {
  assert.deepEqual(
    trimStaticPathToRealtimeTerminal(
      [
        { stopId: "A01N", stopSequence: 1 },
        { stopId: "A02N", stopSequence: 2 },
      ],
      staticPath
    ),
    staticPath.slice(0, 2)
  );
});

test("keeps the scheduled origin when realtime data only contains remaining stops", () => {
  assert.equal(
    tripOriginStopId(staticPath, [{ stopId: "A02N" }, { stopId: "A03N" }]),
    "A01N"
  );
});
