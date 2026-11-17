-- CreateTable
CREATE TABLE "IpVisit" (
    "ip" TEXT NOT NULL,
    "lastAccess" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "IpVisit_pkey" PRIMARY KEY ("ip")
);

-- CreateIndex
CREATE INDEX "IpVisit_lastAccess_idx" ON "IpVisit"("lastAccess");
