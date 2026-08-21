ALTER TABLE "Tenancy" ADD COLUMN "paymentMethod" TEXT;

ALTER TABLE "Document"
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "templateKey" TEXT,
  ADD COLUMN "idempotencyKey" TEXT;

CREATE UNIQUE INDEX "Document_externalId_key" ON "Document"("externalId");
CREATE UNIQUE INDEX "Document_idempotencyKey_key" ON "Document"("idempotencyKey");
CREATE INDEX "Document_provider_externalId_idx" ON "Document"("provider", "externalId");
