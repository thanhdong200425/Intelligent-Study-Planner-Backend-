import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS } from 'src/session/session.constants';
import Redis from 'ioredis';
import { randomInt } from 'crypto';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name, { timestamp: true });
  private readonly resend: Resend;

  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {
    const apiKey = this.configService.get<string>('RESEND_KEY');
    if (!apiKey) {
      this.logger.error('Resend key is not set.');
      throw new Error('Resend key is not set in configuration.');
    }
    this.resend = new Resend(apiKey);
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
    const senderEmail = this.configService.get<string>('FROM_EMAIL');
    const senderName = this.configService.get<string>('FROM_EMAIL_NAME');
    if (!senderEmail) {
      this.logger.error('MAIL_SENDER is not set.');
      return { status: false };
    }

    const from = senderName ? `${senderName} <${senderEmail}>` : senderEmail;

    try {
      const { error } = await this.resend.emails.send({
        from,
        to: email,
        subject: 'Your verification code',
        html: template,
      });

      if (error) {
        this.logger.error(`Failed to send email: ${error.message}`, error);
        return { status: false };
      }

      this.logger.log(`Email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Exception during email sending: ${error}`);
      return { status: false };
    }

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
