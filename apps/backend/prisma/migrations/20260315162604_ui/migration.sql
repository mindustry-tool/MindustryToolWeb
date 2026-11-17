/*
  Warnings:

  - A unique constraint covering the columns `[key,group]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Schematic_blocks_idx" ON "Schematic" USING HASH ("blocks");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_key_group_key" ON "Translation"("key", "group");
