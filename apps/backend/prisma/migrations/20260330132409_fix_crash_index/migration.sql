-- DropIndex
DROP INDEX "CrashReport_stacktrace_idx";

-- CreateIndex
CREATE INDEX "CrashReport_fingerprint_idx" ON "CrashReport"("fingerprint");
