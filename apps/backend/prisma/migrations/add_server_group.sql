-- Migration: Add ServerGroup, GroupServerAdmin, GroupServerEnv
-- Run this manually: psql -d yourdb -f add_server_group.sql

BEGIN;

-- Create ServerGroup table
CREATE TABLE "ServerGroup" (
    "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
    "name"        TEXT        NOT NULL,
    "description" TEXT,
    "ownerId"     UUID        NOT NULL,
    "createdAt"   TIMESTAMPTZ NOT NULL,
    "createdBy"   UUID        NOT NULL,
    "updatedAt"   TIMESTAMPTZ,
    "updatedBy"   UUID,

    CONSTRAINT "ServerGroup_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ServerGroup_ownerId_idx" ON "ServerGroup"("ownerId");

ALTER TABLE "ServerGroup"
    ADD CONSTRAINT "ServerGroup_owner_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "ServerGroup"
    ADD CONSTRAINT "ServerGroup_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION;
ALTER TABLE "ServerGroup"
    ADD CONSTRAINT "ServerGroup_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION;

-- Create GroupServerAdmin table
CREATE TABLE "GroupServerAdmin" (
    "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
    "groupId"     UUID        NOT NULL,
    "userId"      UUID        NOT NULL,
    "authorities" TEXT[]      NOT NULL DEFAULT '{}',
    "createdAt"   TIMESTAMPTZ NOT NULL,
    "createdBy"   UUID        NOT NULL,
    "updatedAt"   TIMESTAMPTZ,
    "updatedBy"   UUID,

    CONSTRAINT "GroupServerAdmin_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GroupServerAdmin_groupId_userId_key" UNIQUE ("groupId", "userId")
);

CREATE INDEX "GroupServerAdmin_groupId_idx" ON "GroupServerAdmin"("groupId");
CREATE INDEX "GroupServerAdmin_userId_idx" ON "GroupServerAdmin"("userId");

ALTER TABLE "GroupServerAdmin"
    ADD CONSTRAINT "GroupServerAdmin_group_fkey" FOREIGN KEY ("groupId") REFERENCES "ServerGroup"("id") ON DELETE CASCADE;
ALTER TABLE "GroupServerAdmin"
    ADD CONSTRAINT "GroupServerAdmin_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION;
ALTER TABLE "GroupServerAdmin"
    ADD CONSTRAINT "GroupServerAdmin_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION;
ALTER TABLE "GroupServerAdmin"
    ADD CONSTRAINT "GroupServerAdmin_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION;

-- Create GroupServerEnv table
CREATE TABLE "GroupServerEnv" (
    "id"        UUID        NOT NULL DEFAULT gen_random_uuid(),
    "groupId"   UUID        NOT NULL,
    "name"      TEXT        NOT NULL,
    "value"     TEXT        NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "createdBy" UUID        NOT NULL,
    "updatedAt" TIMESTAMPTZ,
    "updatedBy" UUID,

    CONSTRAINT "GroupServerEnv_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GroupServerEnv_groupId_name_key" UNIQUE ("groupId", "name")
);

CREATE INDEX "GroupServerEnv_groupId_idx" ON "GroupServerEnv"("groupId");

ALTER TABLE "GroupServerEnv"
    ADD CONSTRAINT "GroupServerEnv_group_fkey" FOREIGN KEY ("groupId") REFERENCES "ServerGroup"("id") ON DELETE CASCADE;
ALTER TABLE "GroupServerEnv"
    ADD CONSTRAINT "GroupServerEnv_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION;
ALTER TABLE "GroupServerEnv"
    ADD CONSTRAINT "GroupServerEnv_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION;

-- Add groupId to Server
ALTER TABLE "Server"
    ADD COLUMN "groupId" UUID;

CREATE INDEX "Server_groupId_idx" ON "Server"("groupId");

ALTER TABLE "Server"
    ADD CONSTRAINT "Server_group_fkey" FOREIGN KEY ("groupId") REFERENCES "ServerGroup"("id") ON DELETE SET NULL;

COMMIT;
