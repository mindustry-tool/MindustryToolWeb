-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('VERIFICATION', 'LIKE', 'SHARE_REWARD', 'SYSTEM');

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "code" VARCHAR(128) NOT NULL,
    "params" JSONB NOT NULL,
    "groupKey" VARCHAR(128),
    "aggregationKey" VARCHAR(128),
    "link" VARCHAR(1024),
    "readAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BroadcastNotification" (
    "id" UUID NOT NULL,
    "code" VARCHAR(128) NOT NULL,
    "params" JSONB NOT NULL,
    "link" VARCHAR(1024),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BroadcastNotificationRead" (
    "id" UUID NOT NULL,
    "broadcastId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "readAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastNotificationRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "verificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "likesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "shareRewardEnabled" BOOLEAN NOT NULL DEFAULT true,
    "systemEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_aggregationKey_readAt_idx" ON "Notification"("userId", "aggregationKey", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_groupKey_idx" ON "Notification"("userId", "groupKey");

-- CreateIndex
CREATE INDEX "BroadcastNotification_createdAt_idx" ON "BroadcastNotification"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "BroadcastNotificationRead_userId_idx" ON "BroadcastNotificationRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BroadcastNotificationRead_broadcastId_userId_key" ON "BroadcastNotificationRead"("broadcastId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastNotificationRead" ADD CONSTRAINT "BroadcastNotificationRead_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "BroadcastNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastNotificationRead" ADD CONSTRAINT "BroadcastNotificationRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
