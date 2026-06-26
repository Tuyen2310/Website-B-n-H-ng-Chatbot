import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST', 'smtp.ethereal.email'),
          port: Number(config.get('MAIL_PORT', 587)),
          secure: Number(config.get('MAIL_PORT', 587)) === 465, // true for 465, false for other ports
          auth: {
            user: config.get('MAIL_USER', 'test@ethereal.email'),
            pass: config.get('MAIL_PASS', 'test_password'),
          },
        },
        defaults: {
          from: '"SmartShop" <noreply@smartshop.com>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
