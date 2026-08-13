import assert from "node:assert/strict";
import test from "node:test";
import {
  prepareUnitRenumberPlan,
  reverseUnitRenumberPlan,
  UnitRenumberingError,
} from "../src/lib/unit-renumbering";

const units = [
  { id: "one", number: "101" },
  { id: "two", number: "102" },
  { id: "three", number: "103" },
];

test("renumbering permits swaps and produces an undo plan", () => {
  const plan = prepareUnitRenumberPlan(units, [
    { unitId: "one", newNumber: "102" },
    { unitId: "two", newNumber: "101" },
  ]);
  assert.deepEqual(
    plan.map(({ oldNumber, newNumber }) => [oldNumber, newNumber]),
    [
      ["101", "102"],
      ["102", "101"],
    ],
  );
  assert.deepEqual(reverseUnitRenumberPlan(plan), [
    { unitId: "one", newNumber: "101" },
    { unitId: "two", newNumber: "102" },
  ]);
});

test("renumbering rejects collisions with unchanged units", () => {
  assert.throws(
    () =>
      prepareUnitRenumberPlan(units, [
        { unitId: "one", newNumber: "103" },
      ]),
    (error: unknown) =>
      error instanceof UnitRenumberingError &&
      error.code === "UNIT_NUMBER_EXISTS",
  );
});

test("renumbering rejects duplicate target numbers case-insensitively", () => {
  assert.throws(
    () =>
      prepareUnitRenumberPlan(units, [
        { unitId: "one", newNumber: "A-1" },
        { unitId: "two", newNumber: "a-1" },
      ]),
    (error: unknown) =>
      error instanceof UnitRenumberingError &&
      error.code === "DUPLICATE_NEW_NUMBER",
  );
});

test("renumbering removes no-op entries", () => {
  assert.deepEqual(
    prepareUnitRenumberPlan(units, [{ unitId: "one", newNumber: "101" }]),
    [],
  );
});
