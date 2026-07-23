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
const S3_FORCE_PATH_STYLE_TRUE = 'true';

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

    return getSignedUrl(this.client, command, { expiresIn: PRESIGN_EXPIRY_SECONDS });
  }

  async createPresignedGetUrl(
    objectKey: string,
    expiresInSeconds: number = PRESIGN_EXPIRY_SECONDS,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async deleteObject(objectKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket ready: ${this.bucket}`);
    } catch {
      this.logger.log(`Creating S3 bucket: ${this.bucket}`);
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket created: ${this.bucket}`);
    }
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }
}
