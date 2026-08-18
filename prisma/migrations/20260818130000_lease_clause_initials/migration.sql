-- Add per-clause initial capture and clause-version tracking to Document.
-- Additive, nullable columns; existing rows are unaffected.
ALTER TABLE "Document" ADD COLUMN "initials" JSONB;
ALTER TABLE "Document" ADD COLUMN "clauseVersion" TEXT;
