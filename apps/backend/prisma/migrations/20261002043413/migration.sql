-- AlterTable
ALTER TABLE "ServerManager" ADD COLUMN     "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextConnectionAttemptAt" TIMESTAMPTZ(6);
