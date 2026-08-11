CREATE TYPE "MapElementType" AS ENUM ('UNIT', 'ZONE', 'WALL', 'DOOR', 'LABEL');

CREATE TABLE "FacilityMap" (
  "id" TEXT NOT NULL,
  "facilityId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "width" INTEGER NOT NULL DEFAULT 1200,
  "height" INTEGER NOT NULL DEFAULT 720,
  "backgroundUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FacilityMap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MapElement" (
  "id" TEXT NOT NULL,
  "mapId" TEXT NOT NULL,
  "unitId" TEXT,
  "type" "MapElementType" NOT NULL,
  "x" INTEGER NOT NULL,
  "y" INTEGER NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "rotation" INTEGER NOT NULL DEFAULT 0,
  "label" TEXT,
  "config" JSONB,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MapElement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FacilityMap_facilityId_name_key" ON "FacilityMap"("facilityId", "name");
CREATE INDEX "FacilityMap_facilityId_updatedAt_idx" ON "FacilityMap"("facilityId", "updatedAt");
CREATE UNIQUE INDEX "MapElement_unitId_key" ON "MapElement"("unitId");
CREATE INDEX "MapElement_mapId_type_sortOrder_idx" ON "MapElement"("mapId", "type", "sortOrder");
ALTER TABLE "FacilityMap" ADD CONSTRAINT "FacilityMap_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MapElement" ADD CONSTRAINT "MapElement_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "FacilityMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MapElement" ADD CONSTRAINT "MapElement_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
