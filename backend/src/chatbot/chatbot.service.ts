import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel | null = null;
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined — chatbot will not function');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.logger.log('Gemini AI model initialized successfully (gemini-1.5-flash)');
  }

  async chat(message: string, userId?: number) {
    // 0. Resolve API Key Dynamically
    const settings = await this.prisma.settings.findFirst({ orderBy: { updatedAt: 'desc' } });
    const apiKey = (settings as any)?.chatbotApiKey || this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.error('No Gemini API Key found in Settings or .env');
      return { response: 'Xin lỗi, trợ lý AI hiện chưa được cấu hình khóa API. Quý khách vui lòng liên hệ quản trị viên.' };
    }

    // Initialize or re-initialize model if API key changed
    const currentKey = (this as any)._lastApiKey;
    if (!this.model || apiKey !== currentKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        // Try latest models for 2026 in order of preference
        const modelsToTry = [
          'gemini-3.1-flash-lite',
          'gemini-2.5-flash-lite',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-pro'
        ];

        let initialized = false;
        for (const modelName of modelsToTry) {
          try {
            const testModel = this.genAI.getGenerativeModel(
              { model: modelName },
              { apiVersion: 'v1' }
            );
            
            // Active verification: Small call to see if model exists for this key
            await testModel.generateContent({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }] });
            
            this.model = testModel;
            this.logger.log(`Active verification SUCCESS for model: ${modelName} (v1)`);
            initialized = true;
            (this as any)._currentModelName = modelName;
            break;
          } catch (e: any) {
            this.logger.warn(`Model ${modelName} verification FAILED: ${e.message}`);
          }
        }

        if (!initialized) {
          this.logger.error('CRITICAL: All models failed verification for this API Key.');
          return { response: 'Dạ, API Key của bạn hiện không có quyền truy cập vào bất kỳ Model Gemini nào. Vui lòng kiểm tra lại thiết lập trên Google AI Studio.' };
        }

        (this as any)._lastApiKey = apiKey;
        this.logger.log(`Chatbot service ready with model: ${(this as any)._currentModelName}`);
      } catch (initError: any) {
        this.logger.error('Failed to initialize Gemini AI:', initError.message);
        return { response: 'Dạ, hệ thống AI đang gặp sự cố cấu hình API Key. Quý khách vui lòng thử lại sau hoặc liên hệ Hotline.' };
      }
    }

    const cleanMessage = message.toLowerCase().trim();
    let shopInfo: any = null;

    try {
      // 1. Retrieve Data: Latest Settings, FAQs, and Products
      const [latestSettings, faqs, products] = await Promise.all([
        this.prisma.settings.findFirst({ orderBy: { updatedAt: 'desc' } }),
        this.prisma.fAQ.findMany({ where: { isDeleted: false } }),
        this.prisma.product.findMany({
          where: { isDeleted: false },
          take: 30,
          include: { category: true },
        }),
      ]);

      shopInfo = latestSettings || {
        shopName: 'SmartShop AI',
        tagline: 'Trải nghiệm mua sắm thông minh',
        email: 'support@smartshop.com',
        phone: '0987654321',
        address: 'Hà Nội, Việt Nam',
      };

      // 2. Hybrid Logic: Priority matching for FAQs
      const directMatch = faqs.find(f => {
        const q = f.question.toLowerCase().trim();
        return cleanMessage === q || cleanMessage.includes(q) || q.includes(cleanMessage);
      });

      if (directMatch && cleanMessage.length > 5) {
        await this.prisma.chatbotLog.create({
          data: { userId, question: message, answer: directMatch.answer },
        });
        return { response: directMatch.answer };
      }

      // 3. Construct Context
      const productContext = products.map(p => {
        const firstImg = p.images && p.images.length > 0 ? p.images[0] : 'https://placehold.co/400x400?text=No+Image';
        const attributes = (p as any).attributes;
        const attrStr = attributes ? JSON.stringify(attributes) : 'Không có thông số';
        // Giới hạn mô tả để không quá dài
        const shortDesc = p.description ? (p.description.length > 80 ? p.description.substring(0, 80) + '...' : p.description) : 'Đang cập nhật...';
        
        return `🛍️ **${p.name}**
💸 Giá: *${p.price.toLocaleString('vi-VN')}đ*
✨ ${shortDesc}
![ảnh sản phẩm](${firstImg})
[Xem chi tiết ngay](/shop/${p.id})`;
      }).join('\n\n');

      const faqContext = faqs.map(f => `Q: ${f.question} -> A: ${f.answer}`).join('\n');

      let userHistory = '';
      if (userId) {
        const pastOrders = await this.prisma.order.findMany({
          where: { userId },
          include: { items: { include: { product: true } } },
          take: 3,
          orderBy: { createdAt: 'desc' }
        });
        
        if (pastOrders.length > 0) {
          userHistory = pastOrders.flatMap(o => o.items.map(i => i.product.name)).join(', ');
          userHistory = `LỊCH SỬ MUA HÀNG GẦN ĐÂY CỦA KHÁCH: ${userHistory}. (Hãy dựa vào đây để gợi ý thêm sản phẩm phù hợp nếu khách nhờ tư vấn)`;
        }
      }

      const systemPrompt = `Bạn là chuyên gia tư vấn mua sắm AI cao cấp tại **${shopInfo.shopName}**. 
      Slogan: "${shopInfo.tagline}"

      THÔNG TIN CỬA HÀNG:
      - Hotline: **${shopInfo.phone}** | Email: **${shopInfo.email}**
      - Địa chỉ: ${shopInfo.address}
      - Chính sách: Miễn phí vận chuyển cho đơn từ 200k, Bảo hành 12 tháng, Đổi trả trong 30 ngày.

      ${userHistory}

      DANH SÁCH SẢN PHẨM HIỆN CÓ:
      ${productContext}

      CÂU HỎI THƯỜNG GẶP:
      ${faqContext}

      NGUYÊN TẮC PHỤC VỤ:
      1. GIỌNG ĐIỆU: Chuyên nghiệp, nồng hậu. Gọi khách hàng là "Quý khách" hoặc "Anh/Chị".
      2. TƯ VẤN SẢN PHẨM: Khi giới thiệu sản phẩm, LUÔN dùng CHÍNH XÁC cấu trúc sau (mỗi thông tin trên 1 dòng để dễ nhìn):
      
      🛍️ **[Tên sản phẩm]**
      💸 Giá: *[Giá]*
      ✨ [1 câu ngắn mô tả điểm nổi bật]
      ![ảnh sản phẩm](url_ảnh)
      [Xem chi tiết ngay](url_link)

      3. TRÌNH BÀY: Sử dụng Markdown sang trọng, dùng các biểu tượng emoji phù hợp. Xuống dòng rõ ràng giữa các ý. Dùng bullet points nếu cần liệt kê.
      4. KHÔNG BIA ĐẶT: Chỉ tư vấn dựa trên danh sách sản phẩm và FAQ được cung cấp. Tuyệt đối lấy đúng link sản phẩm đã cho.`;

      // 4. Generate Content with Fallback Support
      if (!this.model) {
        throw new Error('AI Model is not initialized properly');
      }

      let result;
      try {
        result = await this.model.generateContent([
          { text: systemPrompt },
          { text: `Khách hàng hỏi: "${message}"` },
        ]);
      } catch (genError: any) {
        this.logger.error(`Generation failed with ${(this as any)._currentModelName}:`, genError.message);
        // If it's a model-not-found error, we reset for next call to try another model
        this.model = null; 
        throw genError;
      }

      const responseText = result.response.text();

      await this.prisma.chatbotLog.create({
        data: { userId, question: message, answer: responseText },
      });

      return { response: responseText };
    } catch (error: any) {
      this.logger.error('Chatbot error:', error.message);
      const phone = shopInfo?.phone || '0987654321';
      // Temporarily show detailed error to help the user fix the API Key
      const detailedError = `(Lỗi kỹ thuật: ${error.message})`;
      return { response: `Dạ, tôi đang gặp một chút gián đoạn kỹ thuật. ${detailedError} Quý khách vui lòng nhắn lại sau giây lát hoặc gọi hotline **${phone}** để được hỗ trợ ngay ạ!` };
    }
  }
}
