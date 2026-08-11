ALTER TABLE "Customer"
ADD COLUMN "taxNumber" TEXT,
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "alternateContact" JSONB,
ADD COLUMN "workContact" JSONB,
ADD COLUMN "communicationConsent" JSONB,
ADD COLUMN "notes" TEXT;
