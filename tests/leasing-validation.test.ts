import assert from "node:assert/strict";
import test from "node:test";
import { customerSchema, moveInSchema, noticeSchema, transferSchema } from "../src/lib/validators";

test("customer requires a person or company name", () => {
  assert.equal(customerSchema.safeParse({ type: "INDIVIDUAL", email: "test@example.test" }).success, false);
  assert.equal(customerSchema.safeParse({ type: "BUSINESS", companyName: "Synthetic Storage CC" }).success, true);
});

test("notice rejects a move-out before the notice date", () => {
  assert.equal(noticeSchema.safeParse({ tenancyId: "tenancy-1", noticeDate: "2026-08-20", plannedMoveOut: "2026-08-10" }).success, false);
  assert.equal(noticeSchema.safeParse({ tenancyId: "tenancy-1", noticeDate: "2026-08-10", plannedMoveOut: "2026-08-31" }).success, true);
});

test("move-in rejects negative money and transfer requires identifiers", () => {
  assert.equal(moveInSchema.safeParse({ facilityId: "facility-1", customerId: "customer-1", unitId: "unit-1", startDate: "2026-08-04", initialCharge: -1 }).success, false);
  assert.equal(transferSchema.safeParse({ tenancyId: "", toUnitId: "unit-2", effectiveAt: "2026-08-04" }).success, false);
});
