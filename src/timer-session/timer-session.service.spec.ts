import { Test, TestingModule } from '@nestjs/testing';
import { TimerSessionService } from './timer-session.service';

describe('TimerSessionService', () => {
  let service: TimerSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimerSessionService],
    }).compile();

    service = module.get<TimerSessionService>(TimerSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
