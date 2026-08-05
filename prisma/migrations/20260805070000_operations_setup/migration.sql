CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'SCHEDULED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "StockMovementType" AS ENUM ('RECEIPT', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGE', 'TRANSFER');
CREATE TYPE "DailyCloseStatus" AS ENUM ('OPEN', 'READY', 'CLOSED', 'REOPENED');

CREATE TABLE "ConfigurationProfile" (
  "id" TEXT NOT NULL, "organisationId" TEXT NOT NULL, "facilityId" TEXT, "domain" TEXT NOT NULL,
  "name" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'DRAFT', "config" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConfigurationProfile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ChargeDefinition" (
  "id" TEXT NOT NULL, "organisationId" TEXT NOT NULL, "code" TEXT NOT NULL, "name" TEXT NOT NULL,
  "amount" DECIMAL(14,2), "calculation" TEXT NOT NULL DEFAULT 'FIXED', "taxable" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true, "config" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ChargeDefinition_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DiscountPlan" (
  "id" TEXT NOT NULL, "organisationId" TEXT NOT NULL, "code" TEXT NOT NULL, "name" TEXT NOT NULL,
  "discountType" TEXT NOT NULL, "value" DECIMAL(14,4) NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3), "rules" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DiscountPlan_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "UnitNote" (
  "id" TEXT NOT NULL, "organisationId" TEXT NOT NULL, "facilityId" TEXT NOT NULL, "unitId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL, "note" TEXT NOT NULL, "pinned" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UnitNote_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MaintenanceRequest" (
  "id" TEXT NOT NULL, "organisationId" TEXT NOT NULL, "facilityId" TEXT NOT NULL, "unitId" TEXT,
  "assignedToId" TEXT, "title" TEXT NOT NULL, "description" TEXT, "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL', "dueAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
  "id" TEXT NOT NULL, "organisationId" TEXT NOT NULL, "facilityId" TEXT NOT NULL, "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL, "category" TEXT NOT NULL, "barcode" TEXT, "costPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "sellingPrice" DECIMAL(14,2) NOT NULL, "quantityOnHand" INTEGER NOT NULL DEFAULT 0, "reorderPoint" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StockMovement" (
  "id" TEXT NOT NULL, "productId" TEXT NOT NULL, "type" "StockMovementType" NOT NULL, "quantity" INTEGER NOT NULL,
  "unitCost" DECIMAL(14,2), "reason" TEXT, "reference" TEXT, "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DailyClose" (
  "id" TEXT NOT NULL, "organisationId" TEXT NOT NULL, "facilityId" TEXT NOT NULL, "businessDate" DATE NOT NULL,
  "status" "DailyCloseStatus" NOT NULL DEFAULT 'OPEN', "checks" JSONB NOT NULL, "expectedCash" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "countedCash" DECIMAL(14,2), "variance" DECIMAL(14,2), "notes" TEXT, "closedById" TEXT, "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyClose_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConfigurationProfile_organisationId_facilityId_domain_name_key" ON "ConfigurationProfile"("organisationId", "facilityId", "domain", "name");
CREATE INDEX "ConfigurationProfile_organisationId_domain_status_idx" ON "ConfigurationProfile"("organisationId", "domain", "status");
CREATE UNIQUE INDEX "ChargeDefinition_organisationId_code_key" ON "ChargeDefinition"("organisationId", "code");
CREATE UNIQUE INDEX "DiscountPlan_organisationId_code_key" ON "DiscountPlan"("organisationId", "code");
CREATE INDEX "UnitNote_organisationId_facilityId_createdAt_idx" ON "UnitNote"("organisationId", "facilityId", "createdAt");
CREATE INDEX "UnitNote_unitId_createdAt_idx" ON "UnitNote"("unitId", "createdAt");
CREATE INDEX "MaintenanceRequest_organisationId_facilityId_status_dueAt_idx" ON "MaintenanceRequest"("organisationId", "facilityId", "status", "dueAt");
CREATE INDEX "MaintenanceRequest_unitId_status_idx" ON "MaintenanceRequest"("unitId", "status");
CREATE UNIQUE INDEX "Product_facilityId_sku_key" ON "Product"("facilityId", "sku");
CREATE INDEX "Product_organisationId_facilityId_active_idx" ON "Product"("organisationId", "facilityId", "active");
CREATE INDEX "StockMovement_productId_createdAt_idx" ON "StockMovement"("productId", "createdAt");
CREATE UNIQUE INDEX "DailyClose_facilityId_businessDate_key" ON "DailyClose"("facilityId", "businessDate");
CREATE INDEX "DailyClose_organisationId_status_businessDate_idx" ON "DailyClose"("organisationId", "status", "businessDate");

ALTER TABLE "ConfigurationProfile" ADD CONSTRAINT "ConfigurationProfile_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConfigurationProfile" ADD CONSTRAINT "ConfigurationProfile_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChargeDefinition" ADD CONSTRAINT "ChargeDefinition_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscountPlan" ADD CONSTRAINT "DiscountPlan_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnitNote" ADD CONSTRAINT "UnitNote_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnitNote" ADD CONSTRAINT "UnitNote_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnitNote" ADD CONSTRAINT "UnitNote_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnitNote" ADD CONSTRAINT "UnitNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DailyClose" ADD CONSTRAINT "DailyClose_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyClose" ADD CONSTRAINT "DailyClose_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyClose" ADD CONSTRAINT "DailyClose_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
