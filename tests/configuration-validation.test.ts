import assert from "node:assert/strict";
import test from "node:test";
import { integrationSchema, stockMovementSchema } from "../src/lib/validators.ts";

test("connector configuration cannot claim an unverified live state", () => {
  const result = integrationSchema.safeParse({ category: "PHONE", provider: "Example", status: "CONNECTED", config: {} });
  assert.equal(result.success, false);
});

test("connector configuration rejects secret-shaped arbitrary fields", () => {
  const result = integrationSchema.safeParse({ category: "PHONE", provider: "Example", config: { apiKey: "do-not-store" } });
  assert.equal(result.success, false);
});

test("stock movements cannot have zero quantity", () => {
  assert.equal(stockMovementSchema.safeParse({ productId: "cm12345678901234567890123", type: "RECEIPT", quantity: 0 }).success, false);
});
