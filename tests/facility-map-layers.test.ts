import assert from "node:assert/strict";
import test from "node:test";
import { moveLayer } from "../src/lib/layer-order.ts";

const ids = (items: Array<{ id: string }>) => items.map((item) => item.id);
const layers = [{ id: "wall" }, { id: "unit" }, { id: "door" }, { id: "label" }];

test("facility map layers can move one step forward or backward", () => {
  assert.deepEqual(ids(moveLayer(layers, "unit", "forward")), ["wall", "door", "unit", "label"]);
  assert.deepEqual(ids(moveLayer(layers, "door", "backward")), ["wall", "door", "unit", "label"]);
});

test("facility map layers can move directly to the front or back", () => {
  assert.deepEqual(ids(moveLayer(layers, "unit", "front")), ["wall", "door", "label", "unit"]);
  assert.deepEqual(ids(moveLayer(layers, "door", "back")), ["door", "wall", "unit", "label"]);
});

test("facility map layer moves at the boundary are no-ops", () => {
  assert.equal(moveLayer(layers, "wall", "back"), layers);
  assert.equal(moveLayer(layers, "label", "front"), layers);
  assert.equal(moveLayer(layers, "missing", "front"), layers);
});
