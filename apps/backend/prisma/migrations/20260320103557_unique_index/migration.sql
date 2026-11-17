/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ChatChannel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ChatChannel_name_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ChatChannel_name_key" ON "ChatChannel"("name");
