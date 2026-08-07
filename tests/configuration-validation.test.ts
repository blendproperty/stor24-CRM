import assert from "node:assert/strict";
import test from "node:test";
import { configurationSchema, integrationSchema, stockMovementSchema } from "../src/lib/validators.ts";

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

test("company setup accepts structured website attributes", () => {
  const result = configurationSchema.safeParse({
    facilityId: "cm12345678901234567890123",
    domain: "WEBSITE_ATTRIBUTES",
    name: "Default",
    status: "READY",
    config: { storeAttributes: [{ name: "24-hour access", description: "Access all day", used: true }] },
  });
  assert.equal(result.success, true);
});

test("company setup accepts store-specific structured program defaults", () => {
  const result = configurationSchema.safeParse({
    facilityId: "cm12345678901234567890123",
    domain: "PROGRAM_DEFAULTS",
    name: "Default",
    status: "READY",
    config: {
      activeGroup: "Payments",
      defaults: { Payments: { receiptPrinting: "prompt", preventBackdatedCharges: true }, "South Africa": { vatRate: 15, vatDisplay: "inclusive", measurementSystem: "Metric (metres)" }, Reservations: { reservationExpiryDays: 60 } },
      paymentTypes: [{ name: "Cash", description: "Cash", allowed: true, onlineAllowed: false, reversals: true }],
      smsMessages: ["Your payment was received."],
      responseLists: { creditReasons: ["Billing correction"], callNotePhrases: [], complimentaryReasons: [], unitNotes: [] },
    },
  });
  assert.equal(result.success, true);
});
