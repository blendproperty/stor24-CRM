import assert from "node:assert/strict";
import test from "node:test";

import { hikCentralSignature } from "../src/lib/integrations/hikcentral-provider";
import { MAX_FACE_IMAGE_BYTES, validateFaceImage } from "../src/lib/biometric-access-service";

test("HikCentral request signing is deterministic and request-specific", () => {
  const common = { method: "POST", path: "/artemis/api/resource/v1/person/single/add", appKey: "key", appSecret: "secret", timestamp: "1700000000000", nonce: "nonce" };
  const first = hikCentralSignature({ ...common, body: '{"personCode":"ST24-1"}' });
  const repeated = hikCentralSignature({ ...common, body: '{"personCode":"ST24-1"}' });
  const changed = hikCentralSignature({ ...common, body: '{"personCode":"ST24-2"}' });
  assert.deepEqual(first, repeated);
  assert.notEqual(first.signature, changed.signature);
  assert.notEqual(first.contentMd5, changed.contentMd5);
});

test("face upload accepts JPEG and PNG within the privacy boundary", () => {
  assert.doesNotThrow(() => validateFaceImage(new File(["image"], "face.jpg", { type: "image/jpeg" })));
  assert.doesNotThrow(() => validateFaceImage(new File(["image"], "face.png", { type: "image/png" })));
});

test("face upload rejects unsupported types and oversized files", () => {
  assert.throws(() => validateFaceImage(new File(["image"], "face.gif", { type: "image/gif" })), /FACE_IMAGE_TYPE_INVALID/);
  assert.throws(() => validateFaceImage(new File([new Uint8Array(MAX_FACE_IMAGE_BYTES + 1)], "face.jpg", { type: "image/jpeg" })), /FACE_IMAGE_SIZE_INVALID/);
});
