-- Add in-house lease e-signature capture fields to Document.
-- All columns are nullable and additive; existing rows are unaffected.
ALTER TABLE "Document" ADD COLUMN "content" TEXT;
ALTER TABLE "Document" ADD COLUMN "signerName" TEXT;
ALTER TABLE "Document" ADD COLUMN "signerIp" TEXT;
ALTER TABLE "Document" ADD COLUMN "signerUserAgent" TEXT;
