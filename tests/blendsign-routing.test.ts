import assert from "node:assert/strict";
import test from "node:test";
import { blendSignTemplateKey } from "../src/lib/blendsign-client.ts";

test("debit orders use the mandate template", () => {
  assert.equal(blendSignTemplateKey("DEBIT_ORDER"), "stor24-unit-lease-debit-order");
});

test("non-debit payment methods use the standard template", () => {
  assert.equal(blendSignTemplateKey("CARD"), "stor24-unit-lease");
  assert.equal(blendSignTemplateKey("EFT"), "stor24-unit-lease");
  assert.equal(blendSignTemplateKey("OTHER"), "stor24-unit-lease");
});
