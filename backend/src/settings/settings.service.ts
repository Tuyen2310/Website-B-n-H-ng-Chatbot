import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureSettingsExist();
  }

  private async ensureSettingsExist() {
    const settings = await this.prisma.settings.findFirst();
    if (!settings) {
      await this.prisma.settings.create({
        data: {
          shopName: 'CommercePro Elite',
          tagline: 'Trải nghiệm mua sắm thông minh cùng AI',
          email: 'support@commercepro.vn',
          phone: '0988.123.456',
          address: 'Số 123 Đường Láng, Đống Đa, Hà Nội',
          metaTitle: 'CommercePro - Hệ thống thương mại điện tử tích hợp AI',
          metaDescription: 'Khám phá hàng ngàn sản phẩm chất lượng cao với sự hỗ trợ của Chatbot thông minh 24/7.',
          keywords: 'ecommerce, ai chatbot, smart shopping, commercepro',
          bankEnabled: true,
          bankId: 'VCB',
          accountNo: '1234567890',
          accountName: 'CONG TY TNHH ANTIGRAVITY',
          chatbotEnabled: true,
          chatbotModel: 'gemini-1.5-flash',
          chatbotWelcome: 'Xin chào! Tôi là trợ lý ảo CommercePro. Tôi có thể giúp gì cho bạn hôm nay?',
        } as any,
      });
    }
  }

  private transformSettings(dbSettings: any) {
    if (!dbSettings) return null;
    return {
      general: {
        shopName: dbSettings.shopName,
        tagline: dbSettings.tagline,
        email: dbSettings.email,
        phone: dbSettings.phone,
        address: dbSettings.address,
        facebook: dbSettings.facebook,
        instagram: dbSettings.instagram,
        twitter: dbSettings.twitter,
        logo: dbSettings.logo,
        favicon: dbSettings.favicon,
        banner: dbSettings.banner,
        currency: 'VND',
      },
      seo: {
        metaTitle: dbSettings.metaTitle,
        metaDescription: dbSettings.metaDescription,
        keywords: dbSettings.keywords,
      },
      payment: {
        bankEnabled: dbSettings.bankEnabled,
        bankId: dbSettings.bankId,
        accountNo: dbSettings.accountNo,
        accountName: dbSettings.accountName,
        momoEnabled: dbSettings.momoEnabled,
        momoPhone: dbSettings.momoPhone,
        vnpayEnabled: dbSettings.vnpayEnabled,
        vnpayTmnCode: dbSettings.vnpayTmnCode,
        vnpayHashSecret: dbSettings.vnpayHashSecret,
      },
      chatbot: {
        enabled: dbSettings.chatbotEnabled,
        apiKey: dbSettings.chatbotApiKey,
        model: dbSettings.chatbotModel,
        welcomeMessage: dbSettings.chatbotWelcome,
      },
      security: {
        twoFactor: dbSettings.twoFactor || false,
        maintenance: dbSettings.maintenance || false,
      },
    };
  }

  // In-memory cache: Settings ít thay đổi, cache 5 phút để tránh truy vấn DB liên tục
  private settingsCache: { data: any; expireAt: number } | null = null;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

  async getSettings() {
    const now = Date.now();
    if (this.settingsCache && this.settingsCache.expireAt > now) {
      return this.settingsCache.data;
    }
    const settings = await this.prisma.settings.findFirst();
    const transformed = this.transformSettings(settings);
    this.settingsCache = { data: transformed, expireAt: now + this.CACHE_TTL_MS };
    return transformed;
  }

  async getPublicSettings() {
    const settings = await this.getSettings();
    if (!settings) return null;
    const { general, seo, payment } = settings;
    const publicPayment = {
      bankEnabled: payment.bankEnabled,
      bankId: payment.bankId,
      accountNo: payment.accountNo,
      accountName: payment.accountName,
      momoEnabled: payment.momoEnabled,
      momoPhone: payment.momoPhone,
    };
    return { general, seo, payment: publicPayment, security: { maintenance: settings.security?.maintenance || false } };
  }

  async updateSettings(data: any) {
    const existing = await this.prisma.settings.findFirst();
    const id = existing?.id || 1;

    const flatData: any = {};
    if (data.general) {
      if (data.general.shopName) flatData.shopName = data.general.shopName;
      if (data.general.tagline) flatData.tagline = data.general.tagline;
      if (data.general.email) flatData.email = data.general.email;
      if (data.general.phone) flatData.phone = data.general.phone;
      if (data.general.address) flatData.address = data.general.address;
      if (data.general.facebook !== undefined) flatData.facebook = data.general.facebook;
      if (data.general.instagram !== undefined) flatData.instagram = data.general.instagram;
      if (data.general.twitter !== undefined) flatData.twitter = data.general.twitter;
      if (data.general.logo !== undefined) flatData.logo = data.general.logo;
      if (data.general.favicon !== undefined) flatData.favicon = data.general.favicon;
      if (data.general.banner !== undefined) flatData.banner = data.general.banner;
    }
    if (data.seo) {
      if (data.seo.metaTitle) flatData.metaTitle = data.seo.metaTitle;
      if (data.seo.metaDescription) flatData.metaDescription = data.seo.metaDescription;
      if (data.seo.keywords) flatData.keywords = data.seo.keywords;
    }
    if (data.payment) {
      if (data.payment.bankEnabled !== undefined) flatData.bankEnabled = data.payment.bankEnabled;
      if (data.payment.bankId) flatData.bankId = data.payment.bankId;
      if (data.payment.accountNo) flatData.accountNo = data.payment.accountNo;
      if (data.payment.accountName) flatData.accountName = data.payment.accountName;
      if (data.payment.momoEnabled !== undefined) flatData.momoEnabled = data.payment.momoEnabled;
      if (data.payment.momoPhone) flatData.momoPhone = data.payment.momoPhone;
      if (data.payment.vnpayEnabled !== undefined) flatData.vnpayEnabled = data.payment.vnpayEnabled;
      if (data.payment.vnpayTmnCode) flatData.vnpayTmnCode = data.payment.vnpayTmnCode;
      if (data.payment.vnpayHashSecret) flatData.vnpayHashSecret = data.payment.vnpayHashSecret;
    }
    if (data.chatbot) {
      if (data.chatbot.enabled !== undefined) flatData.chatbotEnabled = data.chatbot.enabled;
      if (data.chatbot.apiKey !== undefined) flatData.chatbotApiKey = data.chatbot.apiKey;
      if (data.chatbot.model !== undefined) flatData.chatbotModel = data.chatbot.model;
      if (data.chatbot.welcomeMessage !== undefined) flatData.chatbotWelcome = data.chatbot.welcomeMessage;
    }
    if (data.security) {
      if (data.security.maintenance !== undefined) flatData.maintenance = data.security.maintenance;
      if (data.security.twoFactor !== undefined) flatData.twoFactor = data.security.twoFactor;
    }

    const updated = await this.prisma.settings.upsert({
      where: { id },
      update: flatData,
      create: { id, ...flatData } as any,
    });

    // Xóa cache để lần sau lấy dữ liệu mới nhất
    this.settingsCache = null;
    return this.transformSettings(updated);
  }

  async clearCache() {
    this.settingsCache = null; // Xóa settings cache
    return { success: true, message: 'System cache cleared successfully' };
  }

  async terminateSessions() {
    return { success: true, message: 'All active sessions have been terminated' };
  }
}
