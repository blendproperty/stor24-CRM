import assert from "node:assert/strict";
import test from "node:test";
import { permissionGranted } from "../src/lib/permissions.ts";
import { createResetToken, hashResetToken } from "../src/lib/password-reset.ts";
import { isPublicPathname } from "../src/proxy.ts";

test("session proxy allows only the HMAC-authenticated BlendSign webhook path", () => {
  assert.equal(isPublicPathname("/api/webhooks/blendsign"), true);
  assert.equal(isPublicPathname("/api/webhooks/blendsign/anything"), true);
  assert.equal(isPublicPathname("/api/webhooks/unknown"), false);
});

test("permission matcher supports exact, scoped, read-only and owner grants", () => {
  assert.equal(permissionGranted(["leads.create"], "leads.create"), true);
  assert.equal(permissionGranted(["facility.*"], "facility.update"), true);
  assert.equal(permissionGranted(["*.view"], "reports.view"), true);
  assert.equal(permissionGranted(["reports.view"], "reports.export"), false);
  assert.equal(permissionGranted(["*"], "users.manage"), true);
});

test("reset tokens are random and only stable after hashing", () => {
  const first = createResetToken();
  const second = createResetToken();
  assert.notEqual(first, second);
  assert.equal(hashResetToken(first), hashResetToken(first));
  assert.notEqual(hashResetToken(first), first);
  assert.match(hashResetToken(first), /^[a-f0-9]{64}$/);
});
