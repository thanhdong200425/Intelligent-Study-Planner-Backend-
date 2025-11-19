import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS } from 'src/session/session.constants';
import Redis from 'ioredis';
import { randomInt } from 'crypto';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name, { timestamp: true });
  private resend?: Resend;
  private smtpTransporter?: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {
    const provider =
      this.configService.get<string>('NODE_ENV') === 'production'
        ? 'resend'
        : 'smtp';

    if (provider === 'resend') {
      const apiKey = this.configService.get<string>('RESEND_KEY');
      if (!apiKey) {
        this.logger.error(
          'RESEND_KEY is not set. Falling back to SMTP if configured.',
        );
      } else {
        this.resend = new Resend(apiKey);
        this.logger.log('Mail provider initialized: Resend');
      }
    }

    if (!this.resend) {
      const host = this.configService.get<string>('SMTP_HOST');
      const port = this.configService.get<number>('SMTP_PORT' as any);
      const user = this.configService.get<string>('MAIL_SENDER');
      const pass = this.configService.get<string>('MAIL_PASSWORD');

      if (host && port && user && pass) {
        this.smtpTransporter = nodemailer.createTransport({
          host,
          port: Number(port),
          secure: true,
          auth: { user, pass },
        });
        this.logger.log('Mail provider initialized: SMTP');
      } else {
        this.logger.warn(
          'SMTP is not fully configured (SMTP_HOST/PORT/MAIL_SENDER/MAIL_PASSWORD). Email sending will fail until configured.',
        );
      }
    }
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
      if (this.resend) {
        const { error } = await this.resend.emails.send({
          from,
          to: email,
          subject: 'Your verification code',
          html: template,
        });

        if (error) {
          this.logger.error(
            `Failed to send email via Resend: ${error.message}`,
            error,
          );
          return { status: false };
        }

        this.logger.log(`Email sent via Resend to ${email}`);
      } else if (this.smtpTransporter) {
        await this.smtpTransporter.sendMail({
          from,
          to: email,
          subject: 'Your verification code',
          html: template,
        });
        this.logger.log(`Email sent via SMTP to ${email}`);
      } else {
        this.logger.error('No mail provider is configured.');
        return { status: false };
      }
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
