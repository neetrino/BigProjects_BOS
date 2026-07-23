-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('NEW', 'CONTACTED', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "ContentOwnerType" AS ENUM ('ORGANIZATION', 'BUILDER_DEAL', 'PARTNER_PARTICIPATION');

-- CreateTable
CREATE TABLE "BuilderDeal" (
    "id" TEXT NOT NULL,
    "eventCycleId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "primaryContactId" TEXT,
    "assignedStaffId" TEXT,
    "stage" "DealStage" NOT NULL DEFAULT 'NEW',
    "expectedSqm" INTEGER,
    "agreedAmount" DECIMAL(12,2),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuilderDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "ownerType" "ContentOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "ownerType" "ContentOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuilderDeal_eventCycleId_idx" ON "BuilderDeal"("eventCycleId");

-- CreateIndex
CREATE INDEX "BuilderDeal_organizationId_idx" ON "BuilderDeal"("organizationId");

-- CreateIndex
CREATE INDEX "BuilderDeal_assignedStaffId_idx" ON "BuilderDeal"("assignedStaffId");

-- CreateIndex
CREATE INDEX "Note_ownerType_ownerId_idx" ON "Note"("ownerType", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_objectKey_key" ON "Attachment"("objectKey");

-- CreateIndex
CREATE INDEX "Attachment_ownerType_ownerId_idx" ON "Attachment"("ownerType", "ownerId");

-- AddForeignKey
ALTER TABLE "BuilderDeal" ADD CONSTRAINT "BuilderDeal_eventCycleId_fkey" FOREIGN KEY ("eventCycleId") REFERENCES "EventCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderDeal" ADD CONSTRAINT "BuilderDeal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderDeal" ADD CONSTRAINT "BuilderDeal_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderDeal" ADD CONSTRAINT "BuilderDeal_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
