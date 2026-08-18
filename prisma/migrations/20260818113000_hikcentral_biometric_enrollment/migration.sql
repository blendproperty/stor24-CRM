CREATE TABLE "BiometricEnrollment" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "occupancyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT NOT NULL DEFAULT 'FACILITY_ACCESS',
    "consentPolicy" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentRecordedById" TEXT,
    "faceImageSha256" TEXT NOT NULL,
    "externalPersonId" TEXT,
    "externalPersonCode" TEXT,
    "providerReference" TEXT,
    "provisionedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "retentionUntil" TIMESTAMP(3),
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiometricEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BiometricEnrollment_occupancyId_purpose_key" ON "BiometricEnrollment"("occupancyId", "purpose");
CREATE INDEX "BiometricEnrollment_organisationId_facilityId_status_idx" ON "BiometricEnrollment"("organisationId", "facilityId", "status");
CREATE INDEX "BiometricEnrollment_customerId_status_idx" ON "BiometricEnrollment"("customerId", "status");

ALTER TABLE "BiometricEnrollment" ADD CONSTRAINT "BiometricEnrollment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BiometricEnrollment" ADD CONSTRAINT "BiometricEnrollment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BiometricEnrollment" ADD CONSTRAINT "BiometricEnrollment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BiometricEnrollment" ADD CONSTRAINT "BiometricEnrollment_occupancyId_fkey" FOREIGN KEY ("occupancyId") REFERENCES "Occupancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
