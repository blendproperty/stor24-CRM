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
