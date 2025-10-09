import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
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

  async sendOtp(email: string, code: string) {
    const template = `<div style="font-family:Inter,system-ui">
        <h2>Verify your email</h2>
        <p>Your verification code is:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:4px">${code}</div>
        <p>This code expires in 10 minutes.</p>
      </div>`;

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_SENDER'),
      to: email,
      subject: 'Your verification code',
      html: template,
    });
  }
}
