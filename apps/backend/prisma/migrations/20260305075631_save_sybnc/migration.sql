-- CreateTable
CREATE TABLE "StorageSlot" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6),

    CONSTRAINT "StorageSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFile" (
    "id" UUID NOT NULL,
    "slotId" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "fileHashId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6),
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "UserFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileHash" (
    "id" UUID NOT NULL,
    "hash" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "minioPath" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileHash_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StorageSlot_userId_idx" ON "StorageSlot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageSlot_userId_name_key" ON "StorageSlot"("userId", "name");

-- CreateIndex
CREATE INDEX "UserFile_slotId_idx" ON "UserFile"("slotId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFile_slotId_path_key" ON "UserFile"("slotId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "FileHash_hash_key" ON "FileHash"("hash");

-- CreateIndex
CREATE INDEX "FileHash_hash_idx" ON "FileHash"("hash");

-- AddForeignKey
ALTER TABLE "StorageSlot" ADD CONSTRAINT "StorageSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "StorageSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFile" ADD CONSTRAINT "UserFile_fileHashId_fkey" FOREIGN KEY ("fileHashId") REFERENCES "FileHash"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
