import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { FaqsModule } from './faqs/faqs.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { PromotionsModule } from './promotions/promotions.module';
import { SettingsModule } from './settings/settings.module';
import { PaymentModule } from './payment/payment.module';
import { AttributesModule } from './attributes/attributes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';

import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute per IP
    }]),
    CacheModule.register({ isGlobal: true, ttl: 60000 }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    CatalogModule, 
    OrdersModule, 
    ChatbotModule, 
    FaqsModule, 
    ReviewsModule, 
    AdminModule, 
    PromotionsModule, 
    SettingsModule, 
    PaymentModule,
    AttributesModule,
    NotificationsModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
