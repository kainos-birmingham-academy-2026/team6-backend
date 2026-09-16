-- Tracks the async malware scan result from Microsoft Defender for Storage.
ALTER TABLE "Applications" ADD COLUMN "cvScanStatus" TEXT NOT NULL DEFAULT 'pending';
