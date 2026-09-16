-- Rename the free-text cv column to reflect that it now stores an Azure Blob Storage path.
ALTER TABLE "Applications" RENAME COLUMN "cv" TO "cvBlobPath";

-- Tracks the async malware scan result from Microsoft Defender for Storage.
ALTER TABLE "Applications" ADD COLUMN "cvScanStatus" TEXT NOT NULL DEFAULT 'pending';
