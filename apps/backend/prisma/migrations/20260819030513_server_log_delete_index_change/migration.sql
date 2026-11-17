-- DropIndex
DROP INDEX "ServerLog_serverId_id_idx";

-- CreateIndex
CREATE INDEX "ServerLog_serverId_id_idx" ON "ServerLog"("serverId", "id" ASC);
