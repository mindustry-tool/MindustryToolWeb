-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContentPatch" DROP CONSTRAINT "ContentPatch_verifierId_fkey";

-- DropForeignKey
ALTER TABLE "CrashReport" DROP CONSTRAINT "CrashReport_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_friendId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userId_fkey";

-- DropForeignKey
ALTER TABLE "GitHubUpload" DROP CONSTRAINT "GitHubUpload_authorId_fkey";

-- DropForeignKey
ALTER TABLE "GitHubUpload" DROP CONSTRAINT "GitHubUpload_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "GlobalMessage" DROP CONSTRAINT "GlobalMessage_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "GroupServerAdmin" DROP CONSTRAINT "GroupServerAdmin_updater_fkey";

-- DropForeignKey
ALTER TABLE "GroupServerAdmin" DROP CONSTRAINT "GroupServerAdmin_user_fkey";

-- DropForeignKey
ALTER TABLE "GroupServerEnv" DROP CONSTRAINT "GroupServerEnv_updater_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "ItemTag" DROP CONSTRAINT "ItemTag_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "Logic" DROP CONSTRAINT "Logic_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ManagerAuthority" DROP CONSTRAINT "ManagerAuthority_userId_fkey";

-- DropForeignKey
ALTER TABLE "Map" DROP CONSTRAINT "Map_verifierId_fkey";

-- DropForeignKey
ALTER TABLE "Planet" DROP CONSTRAINT "Planet_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "PlanetTag" DROP CONSTRAINT "PlanetTag_planetId_fkey";

-- DropForeignKey
ALTER TABLE "PlanetTag" DROP CONSTRAINT "PlanetTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_verifierId_fkey";

-- DropForeignKey
ALTER TABLE "Schematic" DROP CONSTRAINT "Schematic_verifierId_fkey";

-- DropForeignKey
ALTER TABLE "Server" DROP CONSTRAINT "Server_updater_fkey";

-- DropForeignKey
ALTER TABLE "ServerAdmin" DROP CONSTRAINT "ServerAdmin_updater_fkey";

-- DropForeignKey
ALTER TABLE "ServerAuthority" DROP CONSTRAINT "ServerAuthority_userId_fkey";

-- DropForeignKey
ALTER TABLE "ServerEnv" DROP CONSTRAINT "ServerEnv_updater_fkey";

-- DropForeignKey
ALTER TABLE "ServerGroup" DROP CONSTRAINT "ServerGroup_updater_fkey";

-- DropForeignKey
ALTER TABLE "ServerManager" DROP CONSTRAINT "ServerManager_updater_fkey";

-- DropForeignKey
ALTER TABLE "ServerPlayer" DROP CONSTRAINT "ServerPlayer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "TagCategory" DROP CONSTRAINT "TagCategory_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "TagGroup" DROP CONSTRAINT "TagGroup_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserStats" DROP CONSTRAINT "UserStats_userId_fkey";

-- CreateIndex
CREATE INDEX "Action_triggeredBy_idx" ON "Action"("triggeredBy");

-- CreateIndex
CREATE INDEX "Action_triggeredAt_idx" ON "Action"("triggeredAt" DESC);

-- CreateIndex
CREATE INDEX "CrashReport_updatedBy_idx" ON "CrashReport"("updatedBy");

-- CreateIndex
CREATE INDEX "Friendship_friendId_idx" ON "Friendship"("friendId");

-- CreateIndex
CREATE INDEX "GlobalMessage_createdAt_idx" ON "GlobalMessage"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "GlobalMessage_createdBy_idx" ON "GlobalMessage"("createdBy");

-- CreateIndex
CREATE INDEX "Logic_createdBy_idx" ON "Logic"("createdBy");

-- CreateIndex
CREATE INDEX "Logic_createdAt_idx" ON "Logic"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ServerActionLog_serverId_idx" ON "ServerActionLog"("serverId");

-- CreateIndex
CREATE INDEX "ServerActionLog_createdBy_idx" ON "ServerActionLog"("createdBy");

-- CreateIndex
CREATE INDEX "ServerEvent_serverId_idx" ON "ServerEvent"("serverId");

-- CreateIndex
CREATE INDEX "ServerPlayer_userId_idx" ON "ServerPlayer"("userId");

-- CreateIndex
CREATE INDEX "ServerPlayer_uuid_idx" ON "ServerPlayer"("uuid");

-- CreateIndex
CREATE INDEX "WikiLink_postId_idx" ON "WikiLink"("postId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanetTag" ADD CONSTRAINT "PlanetTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanetTag" ADD CONSTRAINT "PlanetTag_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagCategory" ADD CONSTRAINT "TagCategory_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagGroup" ADD CONSTRAINT "TagGroup_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schematic" ADD CONSTRAINT "Schematic_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ContentPatch" ADD CONSTRAINT "ContentPatch_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubUpload" ADD CONSTRAINT "GitHubUpload_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubUpload" ADD CONSTRAINT "GitHubUpload_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerEnv" ADD CONSTRAINT "ServerEnv_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerManager" ADD CONSTRAINT "ServerManager_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerGroup" ADD CONSTRAINT "ServerGroup_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerAdmin" ADD CONSTRAINT "GroupServerAdmin_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerAdmin" ADD CONSTRAINT "GroupServerAdmin_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerEnv" ADD CONSTRAINT "GroupServerEnv_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerPlayer" ADD CONSTRAINT "ServerPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerAuthority" ADD CONSTRAINT "ServerAuthority_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ManagerAuthority" ADD CONSTRAINT "ManagerAuthority_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerAdmin" ADD CONSTRAINT "ServerAdmin_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalMessage" ADD CONSTRAINT "GlobalMessage_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logic" ADD CONSTRAINT "Logic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrashReport" ADD CONSTRAINT "CrashReport_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
