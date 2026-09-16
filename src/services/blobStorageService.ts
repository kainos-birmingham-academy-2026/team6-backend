import { randomUUID } from "node:crypto";
import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";

export type CvUploadInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
};

export class BlobStorageService {
  private containerClient: ContainerClient | null = null;

  constructor(
    private readonly connectionString: string | undefined = process.env
      .CV_STORAGE_CONNECTION_STRING,
    private readonly containerName: string = process.env.CV_STORAGE_CONTAINER ??
      "cvs",
  ) {}

  private getContainerClient(): ContainerClient {
    if (!this.connectionString) {
      throw new Error("CV_STORAGE_CONNECTION_STRING is not configured");
    }

    if (!this.containerClient) {
      const serviceClient = BlobServiceClient.fromConnectionString(
        this.connectionString,
      );
      this.containerClient = serviceClient.getContainerClient(
        this.containerName,
      );
    }

    return this.containerClient;
  }

  // Blob name is namespaced by user/job role so scan results and lookups stay unambiguous.
  async uploadCv(
    userId: number,
    jobRoleId: number,
    file: CvUploadInput,
  ): Promise<string> {
    const blobName = `${userId}/${jobRoleId}/${randomUUID()}-${file.originalName}`;
    const blockBlobClient =
      this.getContainerClient().getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimeType },
      // Malware scan result is written back here by Defender for Storage after upload.
      tags: { scanStatus: "pending" },
    });

    return blobName;
  }
}

export const blobStorageService = new BlobStorageService();
