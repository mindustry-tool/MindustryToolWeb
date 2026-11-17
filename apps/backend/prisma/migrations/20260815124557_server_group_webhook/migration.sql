-- CreateTable
CREATE TABLE "ServerGroupWebhook" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "ServerGroupWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServerGroupWebhook_groupId_idx" ON "ServerGroupWebhook"("groupId");

-- AddForeignKey
ALTER TABLE "ServerGroupWebhook" ADD CONSTRAINT "ServerGroupWebhook_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ServerGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
