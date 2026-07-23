-- CreateEnum
CREATE TYPE "PartnerStage" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'DECLINED');

-- CreateTable
CREATE TABLE "PartnerParticipation" (
    "id" TEXT NOT NULL,
    "eventCycleId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "primaryContactId" TEXT,
    "assignedStaffId" TEXT,
    "stage" "PartnerStage" NOT NULL DEFAULT 'NEW',
    "partnerType" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerParticipation_eventCycleId_idx" ON "PartnerParticipation"("eventCycleId");

-- CreateIndex
CREATE INDEX "PartnerParticipation_organizationId_idx" ON "PartnerParticipation"("organizationId");

-- CreateIndex
CREATE INDEX "PartnerParticipation_assignedStaffId_idx" ON "PartnerParticipation"("assignedStaffId");

-- AddForeignKey
ALTER TABLE "PartnerParticipation" ADD CONSTRAINT "PartnerParticipation_eventCycleId_fkey" FOREIGN KEY ("eventCycleId") REFERENCES "EventCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerParticipation" ADD CONSTRAINT "PartnerParticipation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerParticipation" ADD CONSTRAINT "PartnerParticipation_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerParticipation" ADD CONSTRAINT "PartnerParticipation_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
