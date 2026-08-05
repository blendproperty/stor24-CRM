import assert from "node:assert/strict";
import test from "node:test";
import { ConfigurationRequiredProvider } from "../src/lib/integrations/providers";

test("unconfigured providers fail honestly without claiming vendor success", async () => {
  const provider = new ConfigurationRequiredProvider("PAYMENTS", "Payment provider");
  const result = await provider.health();
  assert.deepEqual(result, { ok: false, retryable: false, code: "CONFIG_REQUIRED", message: "Payment provider has not been configured or verified." });
});
