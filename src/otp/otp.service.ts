import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from 'src/session/session.constants';

@Injectable()
export class OtpService {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}
}
