CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'CANCELLED', 'EXPIRED');

ALTER TABLE "Reservation"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ReservationStatus" USING "status"::"ReservationStatus",
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

ALTER TABLE "AuditEvent" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_facilityId_fkey"
  FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
DROP INDEX IF EXISTS "AuditEvent_organisationId_entityType_entityId_occurredAt_idx";
CREATE INDEX "AuditEvent_organisationId_facilityId_entityType_entityId_occurredAt_idx"
  ON "AuditEvent"("organisationId", "facilityId", "entityType", "entityId", "occurredAt");
