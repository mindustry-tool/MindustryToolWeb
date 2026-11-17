-- CreateTable
CREATE TABLE "CommunityServerGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalPlayers" INTEGER NOT NULL DEFAULT 0,
    "serverCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CommunityServerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityServer" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 6567,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolvedIp" TEXT,
    "countryCode" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "ping" INTEGER,
    "serverName" TEXT,
    "cleanName" TEXT,
    "mapName" TEXT,
    "gamemode" TEXT,
    "wave" INTEGER,
    "players" INTEGER NOT NULL DEFAULT 0,
    "playerLimit" INTEGER,
    "version" INTEGER,
    "description" TEXT,
    "isHub" BOOLEAN NOT NULL DEFAULT false,
    "lastPingAt" TIMESTAMPTZ(6),
    "lastSeenAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CommunityServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityServerSnapshot" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "players" INTEGER NOT NULL,
    "ping" INTEGER,
    "isOnline" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityServerSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityGroupSnapshot" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "totalPlayers" INTEGER NOT NULL,
    "activeServers" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityGroupSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityServerGroup_name_key" ON "CommunityServerGroup"("name");

-- CreateIndex
CREATE INDEX "CommunityServerGroup_totalPlayers_idx" ON "CommunityServerGroup"("totalPlayers" DESC);

-- CreateIndex
CREATE INDEX "CommunityServerGroup_deletedAt_idx" ON "CommunityServerGroup"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityServer_address_key" ON "CommunityServer"("address");

-- CreateIndex
CREATE INDEX "CommunityServer_groupId_idx" ON "CommunityServer"("groupId");

-- CreateIndex
CREATE INDEX "CommunityServer_isOnline_players_idx" ON "CommunityServer"("isOnline", "players" DESC);

-- CreateIndex
CREATE INDEX "CommunityServer_countryCode_idx" ON "CommunityServer"("countryCode");

-- CreateIndex
CREATE INDEX "CommunityServer_deletedAt_idx" ON "CommunityServer"("deletedAt");

-- CreateIndex
CREATE INDEX "CommunityServerSnapshot_serverId_createdAt_idx" ON "CommunityServerSnapshot"("serverId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CommunityServerSnapshot_createdAt_idx" ON "CommunityServerSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityGroupSnapshot_groupId_createdAt_idx" ON "CommunityGroupSnapshot"("groupId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CommunityGroupSnapshot_createdAt_idx" ON "CommunityGroupSnapshot"("createdAt");

-- AddForeignKey
ALTER TABLE "CommunityServer" ADD CONSTRAINT "CommunityServer_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommunityServerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityServerSnapshot" ADD CONSTRAINT "CommunityServerSnapshot_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "CommunityServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityGroupSnapshot" ADD CONSTRAINT "CommunityGroupSnapshot_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CommunityServerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
