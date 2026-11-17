-- AlterTable
ALTER TABLE "IpVisit" ADD COLUMN "client" TEXT NOT NULL DEFAULT 'web';

-- CreateIndex
CREATE INDEX "IpVisit_client_lastAccess_idx" ON "IpVisit"("client", "lastAccess");
