-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "groupId" UUID;

-- CreateTable
CREATE TABLE "ServerGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "ServerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupServerAdmin" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "GroupServerAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupServerEnv" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "GroupServerEnv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServerGroup_ownerId_idx" ON "ServerGroup"("ownerId");

-- CreateIndex
CREATE INDEX "GroupServerAdmin_groupId_idx" ON "GroupServerAdmin"("groupId");

-- CreateIndex
CREATE INDEX "GroupServerAdmin_userId_idx" ON "GroupServerAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupServerAdmin_groupId_userId_key" ON "GroupServerAdmin"("groupId", "userId");

-- CreateIndex
CREATE INDEX "GroupServerEnv_groupId_idx" ON "GroupServerEnv"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupServerEnv_groupId_name_key" ON "GroupServerEnv"("groupId", "name");

-- CreateIndex
CREATE INDEX "Server_groupId_idx" ON "Server"("groupId");

-- AddForeignKey
ALTER TABLE "ServerGroup" ADD CONSTRAINT "ServerGroup_owner_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerGroup" ADD CONSTRAINT "ServerGroup_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerGroup" ADD CONSTRAINT "ServerGroup_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerAdmin" ADD CONSTRAINT "GroupServerAdmin_group_fkey" FOREIGN KEY ("groupId") REFERENCES "ServerGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerAdmin" ADD CONSTRAINT "GroupServerAdmin_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerAdmin" ADD CONSTRAINT "GroupServerAdmin_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerAdmin" ADD CONSTRAINT "GroupServerAdmin_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerEnv" ADD CONSTRAINT "GroupServerEnv_group_fkey" FOREIGN KEY ("groupId") REFERENCES "ServerGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerEnv" ADD CONSTRAINT "GroupServerEnv_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GroupServerEnv" ADD CONSTRAINT "GroupServerEnv_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_group_fkey" FOREIGN KEY ("groupId") REFERENCES "ServerGroup"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
