import { randomUUID } from "node:crypto";
import { DefaultAzureCredential } from "@azure/identity";
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
    private readonly accountUrl: string | undefined = process.env
      .CV_STORAGE_ACCOUNT_URL,
    private readonly containerName: string = process.env.CV_STORAGE_CONTAINER ??
      "cvs",
  ) {}

  private getContainerClient(): ContainerClient {
    if (!this.containerClient) {
      const serviceClient = this.connectionString
        ? BlobServiceClient.fromConnectionString(this.connectionString)
        : this.createManagedIdentityClient();
      this.containerClient = serviceClient.getContainerClient(
        this.containerName,
      );
    }

    return this.containerClient;
  }

  private createManagedIdentityClient(): BlobServiceClient {
    if (!this.accountUrl) {
      throw new Error(
        "CV_STORAGE_CONNECTION_STRING or CV_STORAGE_ACCOUNT_URL is required",
      );
    }

    return new BlobServiceClient(this.accountUrl, new DefaultAzureCredential());
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
