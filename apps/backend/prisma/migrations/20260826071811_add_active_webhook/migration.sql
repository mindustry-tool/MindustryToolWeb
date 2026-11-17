-- AlterTable
ALTER TABLE "ServerGroupWebhook" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ServerWebhook" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
