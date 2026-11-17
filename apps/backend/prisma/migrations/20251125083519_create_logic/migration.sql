-- CreateTable
CREATE TABLE "Logic" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "Logic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Logic" ADD CONSTRAINT "Logic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
