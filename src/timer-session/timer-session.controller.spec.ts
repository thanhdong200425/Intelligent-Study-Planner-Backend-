import { Test, TestingModule } from '@nestjs/testing';
import { TimerSessionController } from './timer-session.controller';
import { TimerSessionService } from './timer-session.service';

describe('TimerSessionController', () => {
  let controller: TimerSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimerSessionController],
      providers: [TimerSessionService],
    }).compile();

    controller = module.get<TimerSessionController>(TimerSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
