-- CreateIndex
CREATE INDEX "Server_deletedAt_status_players_isOfficial_updatedAt_idx" ON "Server"("deletedAt", "status", "players" DESC, "isOfficial" DESC, "updatedAt" DESC);
