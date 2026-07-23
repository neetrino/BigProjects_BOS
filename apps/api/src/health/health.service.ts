import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type DatabaseStatus = 'up' | 'down';

export type HealthResponse = {
  status: 'ok';
  timestamp: string;
  database: DatabaseStatus;
};

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthResponse> {
    const database = await this.checkDatabase();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database,
    };
  }

  private async checkDatabase(): Promise<DatabaseStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch (error: unknown) {
      this.logger.error(
        'Database health check failed',
        error instanceof Error ? error.stack : error,
      );
      return 'down';
    }
  }
}
