import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let queryRaw: jest.Mock;

  beforeEach(async () => {
    queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: queryRaw,
          },
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('returns ok with database up when Prisma responds', async () => {
    const result = await controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('up');
    expect(typeof result.timestamp).toBe('string');
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns ok with database down when Prisma fails', async () => {
    queryRaw.mockRejectedValueOnce(new Error('connection refused'));

    const result = await controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('down');
  });
});
