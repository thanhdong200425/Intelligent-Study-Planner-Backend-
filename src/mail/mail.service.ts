import { Inject, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { REDIS } from 'src/session/session.constants';
import Redis from 'ioredis';
import { randomInt } from 'crypto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name, { timestamp: true });

  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT')),
      secure: true,
      auth: {
        user: this.configService.get('MAIL_SENDER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendOtp(email: string): Promise<{
    status: boolean;
    code?: number;
  }> {
    const code = this.generateOtp();
    const template = `<div style="font-family:Inter,system-ui">
        <h2>Verify your email</h2>
        <p>Your verification code is:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:4px">${code}</div>
        <p>This code expires in 10 minutes.</p>
      </div>`;

    // If connection ok, it will send the email
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_SENDER'),
      to: email,
      subject: 'Your verification code',
      html: template,
    });

    // Store OTP in Redis with 10 minutes expiration
    const otpStatus = await this.redis.set(`otp:${email}`, code, 'EX', 600);
    if (otpStatus !== 'OK') {
      this.logger.error(`Failed to store OTP for email: ${email}`);
      return {
        status: false,
      };
    }

    return {
      status: true,
      code,
    };
  }

  async verifyOtp(email: string, code: number) {
    const key = `otp:${email}`;
    const storedCode = await this.redis.get(key);
    if (!storedCode) {
      this.logger.warn(`No OTP found for email: ${email}`);
      return false;
    }

    if (Number(storedCode) !== Number(code)) {
      this.logger.warn(`Invalid OTP for email: ${email}`);
      return false;
    }

    await this.redis.del(key);
    return true;
  }

  private generateOtp(): number {
    return randomInt(100000, 999999);
  }
}
