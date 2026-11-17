-- AlterTable
ALTER TABLE "Schematic" ADD COLUMN     "blocks" TEXT[] DEFAULT ARRAY[]::TEXT[];
