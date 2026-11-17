/*
  Warnings:

  - You are about to drop the `Translation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TranslationContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TranslationContent" DROP CONSTRAINT "TranslationContent_translationId_fkey";

-- DropTable
DROP TABLE "Translation";

-- DropTable
DROP TABLE "TranslationContent";
