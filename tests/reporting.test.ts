import assert from "node:assert/strict";
import test from "node:test";
import { availableReports, reportParametersSchema, toCsv } from "../src/lib/reporting";

test("report catalogue is filtered by role", () => {
  const sales = availableReports(["reports.sales"]).map((report) => report.key);
  assert.deepEqual(sales, ["lead-conversion"]);
  const owner = availableReports(["*"]);
  assert.equal(owner.length, 8);
});

test("report parameters reject reversed date ranges", () => {
  const parsed = reportParametersSchema.safeParse({ reportKey: "occupancy-revenue", from: "2026-07-31", to: "2026-05-01", format: "CSV", groupBy: "month" });
  assert.equal(parsed.success, false);
});

test("CSV encoding handles commas, quotes and formula-like values safely as quoted text", () => {
  const csv = toCsv([{ name: "Unit, A", note: 'He said "ready"', value: "=1+1" }]);
  assert.match(csv, /"Unit, A"/);
  assert.match(csv, /"He said ""ready"""/);
  assert.match(csv, /"'=1\+1"/);
});
