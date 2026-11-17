-- CreateEnum
CREATE TYPE "CrashStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateTable
CREATE TABLE "CrashReport" (
    "id" UUID NOT NULL,
    "mod" TEXT,
    "message" TEXT NOT NULL,
    "stacktrace" TEXT NOT NULL,
    "status" "CrashStatus" NOT NULL DEFAULT 'PENDING',
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "CrashReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrashReport_mod_idx" ON "CrashReport"("mod");

-- CreateIndex
CREATE INDEX "CrashReport_status_idx" ON "CrashReport"("status");

-- CreateIndex
CREATE INDEX "CrashReport_stacktrace_idx" ON "CrashReport"("stacktrace");

-- AddForeignKey
ALTER TABLE "CrashReport" ADD CONSTRAINT "CrashReport_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
