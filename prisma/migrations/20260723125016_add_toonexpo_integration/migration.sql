-- CreateEnum
CREATE TYPE "ToonExpoRequestStatus" AS ENUM ('PENDING', 'SUCCESS', 'LINKED_EXISTING', 'FAILED');

-- CreateEnum
CREATE TYPE "VenueMapPublicationStatus" AS ENUM ('PENDING', 'PUBLISHED', 'ALREADY_PUBLISHED', 'REJECTED', 'FAILED');

-- AlterTable
ALTER TABLE "VenuePlan" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ToonExpoProvisioningRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventCycleId" TEXT NOT NULL,
    "companyType" "OrganizationType" NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "requestedModules" TEXT[],
    "status" "ToonExpoRequestStatus" NOT NULL DEFAULT 'PENDING',
    "toonexpoCompanyId" TEXT,
    "toonexpoUserId" TEXT,
    "errorMessage" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToonExpoProvisioningRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueMapPublication" (
    "id" TEXT NOT NULL,
    "venuePlanId" TEXT NOT NULL,
    "snapshotVersion" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "status" "VenueMapPublicationStatus" NOT NULL DEFAULT 'PENDING',
    "toonexpoSnapshotId" TEXT,
    "errorMessage" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueMapPublication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToonExpoProvisioningRequest_organizationId_idx" ON "ToonExpoProvisioningRequest"("organizationId");

-- CreateIndex
CREATE INDEX "VenueMapPublication_venuePlanId_idx" ON "VenueMapPublication"("venuePlanId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueMapPublication_venuePlanId_snapshotVersion_key" ON "VenueMapPublication"("venuePlanId", "snapshotVersion");

-- AddForeignKey
ALTER TABLE "ToonExpoProvisioningRequest" ADD CONSTRAINT "ToonExpoProvisioningRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToonExpoProvisioningRequest" ADD CONSTRAINT "ToonExpoProvisioningRequest_eventCycleId_fkey" FOREIGN KEY ("eventCycleId") REFERENCES "EventCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMapPublication" ADD CONSTRAINT "VenueMapPublication_venuePlanId_fkey" FOREIGN KEY ("venuePlanId") REFERENCES "VenuePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
