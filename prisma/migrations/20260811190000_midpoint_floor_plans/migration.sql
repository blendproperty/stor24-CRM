-- Attach the approved Midpoint architectural plans to editable facility maps.
UPDATE "FacilityMap" AS map
SET "backgroundUrl" = '/floor-plans/midpoint-ground-floor.webp'
FROM "Facility" AS facility
WHERE map."facilityId" = facility.id
  AND lower(facility.name) LIKE '%midpoint%'
  AND lower(map.name) = 'ground floor';

INSERT INTO "FacilityMap" (id, "facilityId", name, width, height, "backgroundUrl", "createdAt", "updatedAt")
SELECT 'midpoint-ground-' || md5(facility.id), facility.id, 'Ground Floor', 1200, 833,
  '/floor-plans/midpoint-ground-floor.webp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Facility" AS facility
WHERE lower(facility.name) LIKE '%midpoint%'
  AND NOT EXISTS (
    SELECT 1 FROM "FacilityMap" AS map
    WHERE map."facilityId" = facility.id AND lower(map.name) = 'ground floor'
  );

INSERT INTO "FacilityMap" (id, "facilityId", name, width, height, "backgroundUrl", "createdAt", "updatedAt")
SELECT 'midpoint-first-' || md5(facility.id), facility.id, 'First Floor', 1200, 833,
  '/floor-plans/midpoint-first-floor.webp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Facility" AS facility
WHERE lower(facility.name) LIKE '%midpoint%'
  AND NOT EXISTS (
    SELECT 1 FROM "FacilityMap" AS map
    WHERE map."facilityId" = facility.id AND lower(map.name) = 'first floor'
  );

INSERT INTO "FacilityMap" (id, "facilityId", name, width, height, "backgroundUrl", "createdAt", "updatedAt")
SELECT 'midpoint-second-' || md5(facility.id), facility.id, 'Second Floor', 1200, 833,
  '/floor-plans/midpoint-second-floor.webp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Facility" AS facility
WHERE lower(facility.name) LIKE '%midpoint%'
  AND NOT EXISTS (
    SELECT 1 FROM "FacilityMap" AS map
    WHERE map."facilityId" = facility.id AND lower(map.name) = 'second floor'
  );
