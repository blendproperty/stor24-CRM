-- Add DocuSign-style send-and-sign fields to Document.
-- Additive, nullable/defaulted columns; existing rows (all previously fully
-- signed inline) get status = 'SIGNED' so they remain correctly represented.
ALTER TABLE "Document" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SIGNED';
ALTER TABLE "Document" ADD COLUMN "signingToken" TEXT;
ALTER TABLE "Document" ADD COLUMN "sentAt" TIMESTAMP(3);
ALTER TABLE "Document" ADD COLUMN "expiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Document_signingToken_key" ON "Document"("signingToken");
