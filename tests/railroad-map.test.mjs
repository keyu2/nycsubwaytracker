import test from "node:test";
import assert from "node:assert/strict";
import { railroadMap } from "../app/lib/railroadMap.js";

const pattern = (...ids) => ({ stops: ids.map((id) => ({ id, name: id })) });
test("railroad map merges alternate origins and ignores reverse and short-turn duplicates", () => {
  const map = railroadMap([pattern("A", "B", "J", "C", "D"), pattern("D", "C", "J", "B", "A"), pattern("X", "J", "C", "D"), pattern("J", "C", "D")]);
  assert.equal(map.branches.length, 1);
  assert.equal(map.branches[0].to, "J");
  assert.equal(map.branches[0].from, null);
});
test("express services do not duplicate a terminal branch", () => {
  const map = railroadMap([pattern("A", "B", "C", "D"), pattern("A", "B", "X"), pattern("A", "X")]);
  assert.equal(map.branches.length, 1);
  assert.equal(map.branches[0].from, "B");
});
