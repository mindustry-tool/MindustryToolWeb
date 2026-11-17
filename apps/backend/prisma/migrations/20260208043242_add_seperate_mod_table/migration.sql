/*
  Warnings:

  - You are about to drop the column `modName` on the `CrashReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CrashReport" DROP COLUMN "modName";

-- CreateTable
CREATE TABLE "CrashedMod" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CrashedMod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CrashReport" ADD CONSTRAINT "CrashReport_mod_fkey" FOREIGN KEY ("mod") REFERENCES "CrashedMod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
