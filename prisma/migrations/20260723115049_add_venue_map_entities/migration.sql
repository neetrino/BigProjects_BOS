-- CreateEnum
CREATE TYPE "PublicDisplayMode" AS ENUM ('ORGANIZATION', 'CUSTOM_LABEL', 'HIDDEN');

-- CreateEnum
CREATE TYPE "PlanPublishStatus" AS ENUM ('UNPUBLISHED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "VenuePlan" (
    "id" TEXT NOT NULL,
    "eventCycleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageKey" TEXT,
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "pixelsPerMeter" DOUBLE PRECISION,
    "gridOriginX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gridOriginY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "publishStatus" "PlanPublishStatus" NOT NULL DEFAULT 'UNPUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenuePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceArea" (
    "id" TEXT NOT NULL,
    "venuePlanId" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "squareMeters" INTEGER NOT NULL,
    "publicDisplayMode" "PublicDisplayMode" NOT NULL DEFAULT 'ORGANIZATION',
    "customPublicLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceAreaCell" (
    "id" TEXT NOT NULL,
    "spaceAreaId" TEXT NOT NULL,
    "venuePlanId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "SpaceAreaCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceAllocation" (
    "id" TEXT NOT NULL,
    "spaceAreaId" TEXT NOT NULL,
    "builderDealId" TEXT,
    "partnerParticipationId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VenuePlan_eventCycleId_key" ON "VenuePlan"("eventCycleId");

-- CreateIndex
CREATE INDEX "SpaceArea_venuePlanId_idx" ON "SpaceArea"("venuePlanId");

-- CreateIndex
CREATE INDEX "SpaceAreaCell_spaceAreaId_idx" ON "SpaceAreaCell"("spaceAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceAreaCell_venuePlanId_x_y_key" ON "SpaceAreaCell"("venuePlanId", "x", "y");

-- CreateIndex
CREATE INDEX "SpaceAllocation_spaceAreaId_idx" ON "SpaceAllocation"("spaceAreaId");

-- CreateIndex
CREATE INDEX "SpaceAllocation_builderDealId_idx" ON "SpaceAllocation"("builderDealId");

-- CreateIndex
CREATE INDEX "SpaceAllocation_partnerParticipationId_idx" ON "SpaceAllocation"("partnerParticipationId");

-- AddForeignKey
ALTER TABLE "VenuePlan" ADD CONSTRAINT "VenuePlan_eventCycleId_fkey" FOREIGN KEY ("eventCycleId") REFERENCES "EventCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceArea" ADD CONSTRAINT "SpaceArea_venuePlanId_fkey" FOREIGN KEY ("venuePlanId") REFERENCES "VenuePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceAreaCell" ADD CONSTRAINT "SpaceAreaCell_spaceAreaId_fkey" FOREIGN KEY ("spaceAreaId") REFERENCES "SpaceArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceAreaCell" ADD CONSTRAINT "SpaceAreaCell_venuePlanId_fkey" FOREIGN KEY ("venuePlanId") REFERENCES "VenuePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceAllocation" ADD CONSTRAINT "SpaceAllocation_spaceAreaId_fkey" FOREIGN KEY ("spaceAreaId") REFERENCES "SpaceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceAllocation" ADD CONSTRAINT "SpaceAllocation_builderDealId_fkey" FOREIGN KEY ("builderDealId") REFERENCES "BuilderDeal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceAllocation" ADD CONSTRAINT "SpaceAllocation_partnerParticipationId_fkey" FOREIGN KEY ("partnerParticipationId") REFERENCES "PartnerParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Manual constraints (not expressible in Prisma schema)
ALTER TABLE "SpaceAllocation" ADD CONSTRAINT "SpaceAllocation_exactly_one_owner_check" CHECK ((("builderDealId" IS NOT NULL)::int + ("partnerParticipationId" IS NOT NULL)::int) = 1);

CREATE UNIQUE INDEX "SpaceAllocation_one_active_per_area" ON "SpaceAllocation" ("spaceAreaId") WHERE "active" = true;
