import assert from "node:assert/strict";
import test from "node:test";
import { hasPermission, permissionMatches } from "../src/lib/permissions.ts";

test("permission matching supports exact, domain and read-only grants", () => {
  assert.equal(permissionMatches("operations.manage", "operations.manage"), true);
  assert.equal(permissionMatches("operations.*", "operations.manage"), true);
  assert.equal(permissionMatches("*.view", "configuration.view"), true);
  assert.equal(permissionMatches("*.view", "configuration.manage"), false);
});

test("unrelated facility roles do not imply configuration management", () => {
  assert.equal(hasPermission(["facility.*", "reports.view"], "configuration.manage"), false);
});

test("report permissions do not escape their namespace", () => {
  assert.equal(permissionMatches("facility.*", "facility.edit"), true);
  assert.equal(permissionMatches("facility.*", "reports.view"), false);
  assert.equal(permissionMatches("*.view", "integrations.view"), true);
  assert.equal(permissionMatches("*.view", "integrations.configure"), false);
});

test("financial and sales grants remain distinct", () => {
  assert.equal(hasPermission(["reports.financial", "reports.export"], "reports.financial"), true);
  assert.equal(hasPermission(["reports.financial", "reports.export"], "reports.sales"), false);
  assert.equal(hasPermission(["reports.sales"], "reports.sales"), true);
  assert.equal(hasPermission(["reports.sales"], "reports.export"), false);
});
