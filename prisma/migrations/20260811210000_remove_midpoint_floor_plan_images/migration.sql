-- Remove the imported architectural backgrounds while retaining the editable floor workspaces.
UPDATE "FacilityMap"
SET "backgroundUrl" = NULL
WHERE "backgroundUrl" LIKE '/floor-plans/midpoint-%';
