ALTER TABLE "Facility"
ADD COLUMN "publicSlug" TEXT,
ADD COLUMN "publicBookingEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Reservation"
ADD COLUMN "publicReference" TEXT,
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'INTERNAL';

CREATE UNIQUE INDEX "Facility_publicSlug_key" ON "Facility"("publicSlug");
CREATE UNIQUE INDEX "Reservation_publicReference_key" ON "Reservation"("publicReference");
CREATE UNIQUE INDEX "Reservation_idempotencyKey_key" ON "Reservation"("idempotencyKey");
