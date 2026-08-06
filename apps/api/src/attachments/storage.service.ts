import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

const PRESIGN_EXPIRY_SECONDS = 10 * 60;
const HTTP_STATUS_NOT_FOUND = 404;
const S3_FORCE_PATH_STYLE_TRUE = 'true';

/**
 * AWS SDK v3 defaults to flexible checksums that break Cloudflare R2 / MinIO
 * presigned URLs. Only calculate when the API operation requires it.
 */
const S3_CHECKSUM_WHEN_REQUIRED = 'WHEN_REQUIRED' as const;

/** Checksum headers that must not be hoisted into R2/MinIO signed query strings. */
const PRESIGN_UNHOISTABLE_HEADERS = new Set([
  'x-amz-checksum-crc32',
  'x-amz-checksum-crc32c',
  'x-amz-checksum-sha1',
  'x-amz-checksum-sha256',
  'x-amz-sdk-checksum-algorithm',
]);

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const endpoint = this.requireEnv('S3_ENDPOINT');
    const region = this.requireEnv('S3_REGION');
    const accessKeyId = this.requireEnv('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.requireEnv('S3_SECRET_ACCESS_KEY');
    this.bucket = this.requireEnv('S3_BUCKET');

    this.client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === S3_FORCE_PATH_STYLE_TRUE,
      requestChecksumCalculation: S3_CHECKSUM_WHEN_REQUIRED,
      responseChecksumValidation: S3_CHECKSUM_WHEN_REQUIRED,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucketExists();
  }

  async createPresignedPutUrl(objectKey: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: PRESIGN_EXPIRY_SECONDS,
      unhoistableHeaders: PRESIGN_UNHOISTABLE_HEADERS,
    });
  }

  async createPresignedGetUrl(
    objectKey: string,
    expiresInSeconds: number = PRESIGN_EXPIRY_SECONDS,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
      unhoistableHeaders: PRESIGN_UNHOISTABLE_HEADERS,
    });
  }

  async deleteObject(objectKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
  }

  /**
   * Best-effort bucket check. Creates the bucket only when it is truly missing (local MinIO
   * convenience). Managed stores like Cloudflare R2 pre-create buckets and issue object-scoped
   * credentials without bucket-admin rights, so permission errors must not block startup.
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket ready: ${this.bucket}`);
      return;
    } catch (error: unknown) {
      if (!this.isBucketMissingError(error)) {
        this.logger.warn(
          `Could not verify S3 bucket "${this.bucket}" (likely credentials without bucket-level rights); assuming it exists.`,
        );
        return;
      }
    }

    try {
      this.logger.log(`Creating S3 bucket: ${this.bucket}`);
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket created: ${this.bucket}`);
    } catch (error: unknown) {
      this.logger.warn(
        `Could not create S3 bucket "${this.bucket}": ${error instanceof Error ? error.message : String(error)}. Create it manually before uploading files.`,
      );
    }
  }

  /** True only for a definite "bucket does not exist" (404/NotFound/NoSuchBucket) response. */
  private isBucketMissingError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const name = (error as { name?: string }).name;
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    return name === 'NotFound' || name === 'NoSuchBucket' || status === HTTP_STATUS_NOT_FOUND;
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }
}
