import { Test, TestingModule } from '@nestjs/testing';
import { ReadyController } from './ready.controller';

describe('ReadyController', () => {
  let controller: ReadyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadyController],
    }).compile();

    controller = module.get(ReadyController);
  });

  it('returns ok without touching the database', () => {
    expect(controller.getReady()).toEqual({ status: 'ok' });
  });
});
