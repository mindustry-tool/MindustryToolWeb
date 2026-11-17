-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('SCHEMATIC', 'MAP', 'POST', 'CONTENT_PATCH');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('POST', 'WIKI');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('USER_CREATED', 'ICON');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'DOWNLOADING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ContentPatchType" AS ENUM ('DATA', 'DATAPACK');

-- CreateTable
CREATE TABLE "Account" (
    "userId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("providerId","provider")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL,
    "authorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "about" TEXT,
    "image_url" TEXT,
    "thumbnail" TEXT,
    "updated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "authorities" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "full_tag" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "categoryId" UUID NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanetTag" (
    "tagId" UUID NOT NULL,
    "planetId" UUID NOT NULL,

    CONSTRAINT "PlanetTag_pkey" PRIMARY KEY ("tagId","planetId")
);

-- CreateTable
CREATE TABLE "TagCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "duplicate" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TagCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagGroup" (
    "group" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "TagGroup_pkey" PRIMARY KEY ("group","categoryId")
);

-- CreateTable
CREATE TABLE "ItemTag" (
    "itemId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "ItemTag_pkey" PRIMARY KEY ("itemId","tagId")
);

-- CreateTable
CREATE TABLE "Planet" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,
    "icon" TEXT,

    CONSTRAINT "Planet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerConnect" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 0,
    "httpPort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerConnect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "language" VARCHAR(5) NOT NULL,
    "cover" TEXT,
    "verifierId" UUID,
    "postType" "PostType" NOT NULL DEFAULT 'POST',
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "itemId" UUID NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schematic" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "description" TEXT NOT NULL,
    "meta" JSON NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "verifierId" UUID,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Schematic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPatch" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "verifierId" UUID,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "type" "ContentPatchType" NOT NULL DEFAULT 'DATA',

    CONSTRAINT "ContentPatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Map" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "description" TEXT NOT NULL,
    "meta" JSON NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "verifierId" UUID,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiLink" (
    "wikiId" UUID NOT NULL,
    "postId" UUID NOT NULL,

    CONSTRAINT "WikiLink_pkey" PRIMARY KEY ("wikiId","postId")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "mediaType" "MediaType" DEFAULT 'USER_CREATED',
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" UUID NOT NULL,
    "url" TEXT,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "parentId" UUID,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Icon" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "groupId" UUID DEFAULT '01990f00-af47-7f2e-86ba-4b3d3525202f'::uuid,

    CONSTRAINT "Icon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IconGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "IconGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "itemId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_like" PRIMARY KEY ("itemId","userId")
);

-- CreateTable
CREATE TABLE "PostView" (
    "postId" UUID NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostView_pkey" PRIMARY KEY ("postId","ip")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" UUID NOT NULL,
    "itemType" "ItemType" NOT NULL DEFAULT 'POST',
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "replyId" UUID,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "metadata" JSON NOT NULL,
    "triggeredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredBy" UUID NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationContent" (
    "id" UUID NOT NULL,
    "language" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "translationId" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "TranslationContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubUpload" (
    "id" UUID NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "total" INTEGER DEFAULT 0,
    "success" INTEGER DEFAULT 0,
    "fail" INTEGER DEFAULT 0,
    "duplicate" INTEGER DEFAULT 0,

    CONSTRAINT "GitHubUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerEnv" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "ServerEnv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerManager" (
    "id" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "securityKey" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "isFreeToUse" BOOLEAN DEFAULT false,

    CONSTRAINT "ServerManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "gamemode" TEXT,
    "port" INTEGER NOT NULL,
    "hostCommand" TEXT,
    "webhook" TEXT,
    "discordChannelId" TEXT,
    "avatar" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "players" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "isAutoTurnOff" BOOLEAN NOT NULL DEFAULT true,
    "isHub" BOOLEAN NOT NULL DEFAULT false,
    "managerId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "gameVersion" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL,
    "mapName" TEXT,
    "mods" TEXT[],
    "cpu" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "memory" INTEGER NOT NULL DEFAULT 512,
    "score" INTEGER DEFAULT 0,
    "credit" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerLog" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "data" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "ServerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerActionLog" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "action" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "ServerActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerEvent" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "event" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ServerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerPlayer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "ServerPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerLoginToken" (
    "id" TEXT NOT NULL,
    "serverId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ServerLoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerAuthority" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "ServerAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerAuthority" (
    "id" UUID NOT NULL,
    "managerId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authorities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "ManagerAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerWebhook" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "ServerWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvited" (
    "userId" UUID NOT NULL,
    "ip" TEXT NOT NULL,

    CONSTRAINT "UserInvited_pkey" PRIMARY KEY ("userId","ip")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("userId","name")
);

-- CreateTable
CREATE TABLE "ServerAdmin" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "ServerAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_providerId_idx" ON "Account"("providerId");

-- CreateIndex
CREATE INDEX "Account_provider_idx" ON "Account"("provider");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_id_key" ON "Role"("id");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_categoryId_key" ON "Tag"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "TagCategory_name_key" ON "TagCategory"("name");

-- CreateIndex
CREATE INDEX "idx_item_tag_item_id_tag_id" ON "ItemTag"("itemId", "tagId");

-- CreateIndex
CREATE INDEX "idx_item_tag_itemId" ON "ItemTag"("itemId");

-- CreateIndex
CREATE INDEX "idx_item_tag_tagId" ON "ItemTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Planet_name_key" ON "Planet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerConnect_name_key" ON "PlayerConnect"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Post_itemId_key" ON "Post"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Schematic_itemId_key" ON "Schematic"("itemId");

-- CreateIndex
CREATE INDEX "Schematic_data_idx" ON "Schematic" USING HASH ("data");

-- CreateIndex
CREATE INDEX "Schematic_name_idx" ON "Schematic"("name");

-- CreateIndex
CREATE INDEX "schematic_verification_itemid_idx" ON "Schematic"("verificationStatus", "itemId");

-- CreateIndex
CREATE INDEX "schematic_verify_index" ON "Schematic"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPatch_itemId_key" ON "ContentPatch"("itemId");

-- CreateIndex
CREATE INDEX "ContentPatch_data_idx" ON "ContentPatch"("data");

-- CreateIndex
CREATE INDEX "ContentPatch_name_idx" ON "ContentPatch"("name");

-- CreateIndex
CREATE INDEX "ContentPatch_verificationStatus_idx" ON "ContentPatch"("verificationStatus");

-- CreateIndex
CREATE INDEX "ContentPatch_itemId_idx" ON "ContentPatch"("itemId");

-- CreateIndex
CREATE INDEX "ContentPatch_verificationStatus_itemId_idx" ON "ContentPatch"("verificationStatus", "itemId");

-- CreateIndex
CREATE INDEX "ContentPatch_name_verificationStatus_idx" ON "ContentPatch"("name", "verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Map_itemId_key" ON "Map"("itemId");

-- CreateIndex
CREATE INDEX "Map_name_idx" ON "Map"("name");

-- CreateIndex
CREATE INDEX "Map_data_hash_idx" ON "Map" USING HASH ("data");

-- CreateIndex
CREATE INDEX "map_verification_itemid_idx" ON "Map"("verificationStatus", "itemId");

-- CreateIndex
CREATE INDEX "map_verify_index" ON "Map"("verificationStatus");

-- CreateIndex
CREATE INDEX "Media_createdBy_createdAt_idx" ON "Media"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "idx_media_createdby_mediatype_createdat_desc" ON "Media"("createdBy", "mediaType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Image_parentId_createdAt_index" ON "Image"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_like_itemId" ON "Like"("itemId");

-- CreateIndex
CREATE INDEX "idx_like_userId" ON "Like"("userId");

-- CreateIndex
CREATE INDEX "idx_item_createdBy" ON "Item"("createdBy");

-- CreateIndex
CREATE INDEX "idx_item_updatedBy" ON "Item"("updatedBy");

-- CreateIndex
CREATE INDEX "item_created_at_index" ON "Item"("createdAt");

-- CreateIndex
CREATE INDEX "idx_comment_itemId" ON "Comment"("itemId");

-- CreateIndex
CREATE INDEX "idx_comment_replyId" ON "Comment"("replyId");

-- CreateIndex
CREATE INDEX "Translation_group_index" ON "Translation"("group");

-- CreateIndex
CREATE INDEX "TranslationContent_language_index" ON "TranslationContent"("language");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationContent_translationId_language_key" ON "TranslationContent"("translationId", "language");

-- CreateIndex
CREATE INDEX "GitHubUpload_authorId_idx" ON "GitHubUpload"("authorId");

-- CreateIndex
CREATE INDEX "GitHubUpload_createdBy_idx" ON "GitHubUpload"("createdBy");

-- CreateIndex
CREATE INDEX "GitHubUpload_status_idx" ON "GitHubUpload"("status");

-- CreateIndex
CREATE INDEX "ServerEnv_serverId_idx" ON "ServerEnv"("serverId");

-- CreateIndex
CREATE INDEX "ServerManager_createdBy_idx" ON "ServerManager"("createdBy");

-- CreateIndex
CREATE INDEX "Server_managerId_idx" ON "Server"("managerId");

-- CreateIndex
CREATE INDEX "ServerLog_serverId_idx" ON "ServerLog"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerLoginToken_token_key" ON "ServerLoginToken"("token");

-- CreateIndex
CREATE INDEX "ServerLoginToken_token_idx" ON "ServerLoginToken"("token");

-- CreateIndex
CREATE INDEX "ServerLoginToken_createdAt_idx" ON "ServerLoginToken"("createdAt");

-- CreateIndex
CREATE INDEX "ServerLoginToken_ip_uuid_idx" ON "ServerLoginToken"("ip", "uuid");

-- CreateIndex
CREATE INDEX "ServerAuthority_serverId_idx" ON "ServerAuthority"("serverId");

-- CreateIndex
CREATE INDEX "ServerAuthority_userId_idx" ON "ServerAuthority"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerAuthority_serverId_userId_key" ON "ServerAuthority"("serverId", "userId");

-- CreateIndex
CREATE INDEX "ManagerAuthority_managerId_idx" ON "ManagerAuthority"("managerId");

-- CreateIndex
CREATE INDEX "ManagerAuthority_userId_idx" ON "ManagerAuthority"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerAuthority_managerId_userId_key" ON "ManagerAuthority"("managerId", "userId");

-- CreateIndex
CREATE INDEX "ServerWebhook_serverId_idx" ON "ServerWebhook"("serverId");

-- CreateIndex
CREATE INDEX "ShareLink_createdBy_idx" ON "ShareLink"("createdBy");

-- CreateIndex
CREATE INDEX "ServerAdmin_serverId_idx" ON "ServerAdmin"("serverId");

-- CreateIndex
CREATE INDEX "ServerAdmin_userId_idx" ON "ServerAdmin"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TagCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanetTag" ADD CONSTRAINT "PlanetTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanetTag" ADD CONSTRAINT "PlanetTag_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagCategory" ADD CONSTRAINT "TagCategory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagCategory" ADD CONSTRAINT "TagCategory_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagGroup" ADD CONSTRAINT "TagGroup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TagCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagGroup" ADD CONSTRAINT "TagGroup_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagGroup" ADD CONSTRAINT "TagGroup_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "FK_Post_itemId" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schematic" ADD CONSTRAINT "Schematic_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Schematic" ADD CONSTRAINT "Schematic_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ContentPatch" ADD CONSTRAINT "ContentPatch_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ContentPatch" ADD CONSTRAINT "ContentPatch_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Icon" ADD CONSTRAINT "Icon_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "IconGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "fk_like_item" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "fk_like_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "FK_Comment_userId" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "fk_comment_item" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "fk_comment_reply" FOREIGN KEY ("replyId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TranslationContent" ADD CONSTRAINT "TranslationContent_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GitHubUpload" ADD CONSTRAINT "GitHubUpload_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubUpload" ADD CONSTRAINT "GitHubUpload_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerEnv" ADD CONSTRAINT "ServerEnv_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerEnv" ADD CONSTRAINT "ServerEnv_server_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerEnv" ADD CONSTRAINT "ServerEnv_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerManager" ADD CONSTRAINT "ServerManager_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerManager" ADD CONSTRAINT "ServerManager_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_manager_fkey" FOREIGN KEY ("managerId") REFERENCES "ServerManager"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerLog" ADD CONSTRAINT "ServerLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerLog" ADD CONSTRAINT "ServerLog_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerActionLog" ADD CONSTRAINT "ServerActionLog_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerActionLog" ADD CONSTRAINT "ServerActionLog_server_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerEvent" ADD CONSTRAINT "ServerEvent_server_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerPlayer" ADD CONSTRAINT "ServerPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerAuthority" ADD CONSTRAINT "ServerAuthority_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerAuthority" ADD CONSTRAINT "ServerAuthority_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ManagerAuthority" ADD CONSTRAINT "ManagerAuthority_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "ServerManager"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ManagerAuthority" ADD CONSTRAINT "ManagerAuthority_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerWebhook" ADD CONSTRAINT "ServerWebhook_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerAdmin" ADD CONSTRAINT "ServerAdmin_creator_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerAdmin" ADD CONSTRAINT "ServerAdmin_server_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServerAdmin" ADD CONSTRAINT "ServerAdmin_updater_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

