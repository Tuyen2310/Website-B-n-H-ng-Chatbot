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
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.logger.log('Gemini AI model initialized successfully (gemini-2.5-flash)');
  }

  async chat(message: string, userId?: number) {
    // 0. Resolve API Key Dynamically
    const settings = await this.prisma.settings.findFirst({ orderBy: { updatedAt: 'desc' } });
    const apiKey = settings?.chatbotApiKey || this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.error('No Gemini API Key found in Settings or .env');
      return { response: 'Xin lỗi, trợ lý AI hiện chưa được cấu hình khóa API. Quý khách vui lòng liên hệ quản trị viên.' };
    }

    // Initialize or re-initialize model if API key changed
    const currentKey = (this as any)._lastApiKey;
    if (!this.model || apiKey !== currentKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        
        let preferredModel = (settings as any)?.chatbotModel || this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
        
        // Try models in order of preference, starting with the configured one
        const baseModels = [
          'gemini-2.5-flash',
          'gemini-flash-lite-latest',
          'gemini-flash-latest',
          'gemini-3.5-flash'
        ];
        // Remove preferred from base to avoid duplicates, then prepend it
        const modelsToTry = [preferredModel, ...baseModels.filter(m => m !== preferredModel)];

        let initialized = false;
        for (const modelName of modelsToTry) {
          try {
            const testModel = this.genAI.getGenerativeModel(
              { model: modelName }
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
      let matchedFaqContext = '';
      const directMatch = faqs.find(f => {
        const q = f.question.toLowerCase().trim();
        return cleanMessage === q || cleanMessage.includes(q) || q.includes(cleanMessage);
      });

      if (directMatch && cleanMessage.length > 5) {
        matchedFaqContext = `\n[CỰC KỲ QUAN TRỌNG] KHÁCH HÀNG VỪA HỎI CÂU HỎI FAQ. BẠN BẮT BUỘC PHẢI GIỮ NGUYÊN VĂN BẢN TRẢ LỜI CỦA CỬA HÀNG NHƯ SAU, KHÔNG ĐƯỢC THÊM BỚT TỪ NGỮ: "${directMatch.answer}". \nBên dưới câu trả lời đó, nếu có nhắc đến tên sản phẩm, bạn MỚI ĐƯỢC thêm khung hiển thị sản phẩm (ảnh, giá, link, nút thêm giỏ hàng) theo chuẩn của NGUYÊN TẮC PHỤC VỤ. Nếu không có sản phẩm nào liên quan thì chỉ trả lời y nguyên văn bản trên.`;
        await this.prisma.chatbotLog.create({
          data: { userId, question: message, answer: directMatch.answer },
        });
      }

      // 3. Construct Context
      const productContext = products.map(p => {
        const attributes = (p as any).attributes;
        const attrStr = attributes ? JSON.stringify(attributes) : 'Không có thông số';
        // Giới hạn mô tả để không quá dài
        const shortDesc = p.description ? (p.description.length > 80 ? p.description.substring(0, 80) + '...' : p.description) : 'Đang cập nhật...';
        let imgUrl = (p as any).images?.[0] || 'https://via.placeholder.com/300';
        
        // Prevent massive base64 strings from crashing the AI token limit
        if (imgUrl.startsWith('data:image')) {
          imgUrl = 'https://via.placeholder.com/300?text=anh-san-pham';
        }
        
        return `Mã Thẻ: [PRODUCT_CARD:${p.id}]
Tên: ${p.name}
Giá: ${p.price.toLocaleString('vi-VN')}đ
Mô tả: ${shortDesc}`;
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
          const orderDetails = pastOrders.map(o => {
            const itemNames = o.items.map(i => i.product.name).join(', ');
            let statusText = '';
            switch(o.status) {
              case 'PENDING': statusText = 'Đang chờ xử lý'; break;
              case 'CONFIRMED': statusText = 'Đã xác nhận'; break;
              case 'SHIPPING': statusText = 'Đang giao hàng'; break;
              case 'COMPLETED': statusText = 'Đã hoàn thành'; break;
              case 'CANCELLED': statusText = 'Đã hủy'; break;
            }
            return `Mã đơn #${o.id} (${statusText}) - Sản phẩm: ${itemNames}`;
          }).join(' | ');
          userHistory = `LỊCH SỬ ĐƠN HÀNG CỦA KHÁCH: ${orderDetails}. (Nếu khách hỏi trạng thái đơn hàng, hãy báo chính xác trạng thái này. Đồng thời dựa vào đây để gợi ý thêm sản phẩm phù hợp)`;
        }
      }

      const systemPrompt = `Bạn là chuyên gia tư vấn mua sắm AI cao cấp tại **${shopInfo.shopName}**. 
      Slogan: "${shopInfo.tagline}"

      THÔNG TIN CỬA HÀNG:
      - Hotline: **${shopInfo.phone}** | Email: **${shopInfo.email}**
      - Địa chỉ: ${shopInfo.address}

      ${userHistory}
      ${matchedFaqContext}

      DANH SÁCH SẢN PHẨM HIỆN CÓ:
      ${productContext}

      CÂU HỎI THƯỜNG GẶP (FAQ):
      ${faqContext}

      NGUYÊN TẮC PHỤC VỤ:
      1. GIỌNG ĐIỆU: Chuyên nghiệp, nồng hậu. Gọi khách hàng là "Quý khách" hoặc "Anh/Chị".
      2. TƯ VẤN SẢN PHẨM: Khi giới thiệu sản phẩm, bạn BẮT BUỘC chỉ được xuất ra đúng 1 dòng mã Thẻ Sản Phẩm duy nhất (vd: [PRODUCT_CARD:15]). TUYỆT ĐỐI KHÔNG tự gõ lại tên sản phẩm, không tự vẽ thêm markdown, không tự ghi giá tiền hay link. Chỉ xuất ra thẻ [PRODUCT_CARD:id] và hệ thống sẽ tự động hiển thị thẻ UI siêu đẹp cho khách hàng.
      
      Ví dụ một câu trả lời ĐÚNG:
      "Dạ em gửi Quý khách mẫu điện thoại xịn nhất bên em ạ:
      [PRODUCT_CARD:23]"

      3. BÁM SÁT KỊCH BẢN FAQ (VÔ CÙNG QUAN TRỌNG): Bạn BẮT BUỘC CHỈ ĐƯỢC PHÉP trả lời các vấn đề dựa trên danh sách CÂU HỎI THƯỜNG GẶP (FAQ) ở trên. Kịch bản trả lời phải xoay quanh các dữ liệu này. 
      4. TỪ CHỐI TRẢ LỜI NGOÀI LỀ: Nếu khách hàng hỏi những vấn đề không có trong FAQ, hoặc không liên quan đến sản phẩm/dịch vụ của cửa hàng (trả lời khác 1 trời 1 vực), bạn PHẢI LỊCH SỰ TỪ CHỐI và hướng dẫn khách hàng liên hệ qua Hotline hoặc Email. TUYỆT ĐỐI KHÔNG tự bịa ra (hallucinate) câu trả lời.
      5. TRÌNH BÀY: Sử dụng Markdown sang trọng, dùng các biểu tượng emoji phù hợp. Dùng gạch đầu dòng rõ ràng.`;

      // 4. Generate Content with Robust Fallback
      if (!this.genAI) {
        throw new Error('AI Model is not initialized properly');
      }

      let result;
      let lastError;
      const preferredModel = (this as any)._currentModelName || 'gemini-2.5-flash';
      const baseModels = ['gemini-2.5-flash', 'gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.5-flash'];
      const modelsToTry = [...new Set([preferredModel, ...baseModels])];

      for (const modelName of modelsToTry) {
        try {
          const tryModel = this.genAI.getGenerativeModel({ model: modelName });
          result = await tryModel.generateContent([
            { text: systemPrompt },
            { text: `Khách hàng hỏi: "${message}"` },
          ]);
          // If successful, update the current model to this one for future calls
          this.model = tryModel;
          (this as any)._currentModelName = modelName;
          break; // Exit loop on success
        } catch (genError: any) {
          this.logger.warn(`Generation failed with ${modelName}: ${genError.message}`);
          lastError = genError;
        }
      }

      if (!result) {
        this.model = null; // Reset if all failed
        throw lastError;
      }

      const responseText = result.response.text();

      await this.prisma.chatbotLog.create({
        data: { userId, question: message, answer: responseText },
      });

      // Suggest 3 random related FAQs
      let suggestions: string[] = [];
      const otherFaqs = faqs.filter(f => f.id !== directMatch?.id);
      const shuffled = otherFaqs.sort(() => 0.5 - Math.random());
      suggestions = shuffled.slice(0, 3).map(f => f.question);

      return { response: responseText, suggestions };
    } catch (error: any) {
      this.logger.error('Chatbot error:', error.message);
      const phone = shopInfo?.phone || '0987654321';
      // Temporarily show detailed error to help the user fix the API Key
      const detailedError = `(Lỗi kỹ thuật: ${error.message})`;
      return { response: `Dạ, tôi đang gặp một chút gián đoạn kỹ thuật. ${detailedError} Quý khách vui lòng nhắn lại sau giây lát hoặc gọi hotline **${phone}** để được hỗ trợ ngay ạ!` };
    }
  }

  async chatStream(message: string, userId: number | undefined, res: any) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const cleanMessage = message.toLowerCase().trim();
    let shopInfo: any = null;
    let faqs: any[] = [];
    let directMatch: any = null;

    try {
      // 1. Context Prep
      const [latestSettings, dbFaqs, products] = await Promise.all([
        this.prisma.settings.findFirst({ orderBy: { updatedAt: 'desc' } }),
        this.prisma.fAQ.findMany({ where: { isDeleted: false } }),
        this.prisma.product.findMany({ where: { isDeleted: false }, take: 50 }),
      ]);
      shopInfo = latestSettings || { shopName: 'SmartShop AI', tagline: 'Trải nghiệm mua sắm thông minh', email: 'support@smartshop.com', phone: '0987654321', address: 'Hà Nội' };
      faqs = dbFaqs;

      let matchedFaqContext = '';
      directMatch = faqs.find(f => {
        const q = f.question.toLowerCase().trim();
        return cleanMessage === q || cleanMessage.includes(q) || q.includes(cleanMessage);
      });

      if (directMatch && cleanMessage.length > 5) {
        matchedFaqContext = `\n[CỰC KỲ QUAN TRỌNG] KHÁCH HÀNG VỪA HỎI CÂU HỎI FAQ. BẠN BẮT BUỘC PHẢI GIỮ NGUYÊN VĂN BẢN TRẢ LỜI CỦA CỬA HÀNG NHƯ SAU: "${directMatch.answer}".`;
      }

      const productContext = products.map(p => `Mã Thẻ: [PRODUCT_CARD:${p.id}]\nTên: ${p.name}\nGiá: ${p.price.toLocaleString('vi-VN')}đ`).join('\n\n');
      const faqContext = faqs.map(f => `Q: ${f.question} -> A: ${f.answer}`).join('\n');

      let userHistory = '';
      if (userId) {
        const pastOrders = await this.prisma.order.findMany({ where: { userId }, include: { items: { include: { product: true } } }, take: 3, orderBy: { createdAt: 'desc' } });
        if (pastOrders.length > 0) {
          const orderDetails = pastOrders.map(o => `Mã đơn #${o.id} - Trạng thái: ${o.status}`).join(' | ');
          userHistory = `LỊCH SỬ ĐƠN HÀNG CỦA KHÁCH: ${orderDetails}.`;
        }
      }

      const systemPrompt = `Bạn là chuyên gia tư vấn mua sắm AI cao cấp tại **${shopInfo.shopName}**. 
      Slogan: "${shopInfo.tagline}"

      THÔNG TIN CỬA HÀNG:
      - Hotline: **${shopInfo.phone}** | Email: **${shopInfo.email}**
      - Địa chỉ: ${shopInfo.address}

      ${userHistory}
      ${matchedFaqContext}

      DANH SÁCH SẢN PHẨM HIỆN CÓ:
      ${productContext}

      CÂU HỎI THƯỜNG GẶP (FAQ):
      ${faqContext}

      NGUYÊN TẮC PHỤC VỤ:
      1. GIỌNG ĐIỆU: Chuyên nghiệp, nồng hậu. Gọi khách hàng là "Quý khách" hoặc "Anh/Chị".
      2. TƯ VẤN SẢN PHẨM: Khi giới thiệu sản phẩm, bạn BẮT BUỘC chỉ được xuất ra đúng 1 dòng mã Thẻ Sản Phẩm duy nhất (vd: [PRODUCT_CARD:15]). TUYỆT ĐỐI KHÔNG tự gõ lại tên sản phẩm.
      3. BÁM SÁT KỊCH BẢN FAQ. 
      4. TỪ CHỐI TRẢ LỜI NGOÀI LỀ.`;

      // 2. Setup AI (Force gemini-1.5-flash for speed)
      let apiKey = (this as any)._lastApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey && latestSettings?.chatbotApiKey) apiKey = latestSettings.chatbotApiKey;
      
      if (!apiKey) {
        res.write(`data: ${JSON.stringify({ error: 'Chưa cấu hình API Key' })}\n\n`);
        return res.end();
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      let stream;
      let lastError;
      
      const modelsToTry = ['gemini-1.5-flash', 'gemini-flash-latest'];
      for (const modelName of modelsToTry) {
        try {
          const tryModel = genAI.getGenerativeModel({ model: modelName });
          const result = await tryModel.generateContentStream([
            { text: systemPrompt },
            { text: `Khách hàng hỏi: "${message}"` },
          ]);
          stream = result.stream;
          break;
        } catch (genError: any) {
          this.logger.warn(`Stream failed with ${modelName}: ${genError.message}`);
          lastError = genError;
        }
      }

      if (!stream) {
        res.write(`data: ${JSON.stringify({ error: lastError?.message || 'Technical Error' })}\n\n`);
        return res.end();
      }

      let fullResponse = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      const otherFaqs = faqs.filter(f => f.id !== directMatch?.id);
      const shuffled = otherFaqs.sort(() => 0.5 - Math.random());
      const suggestions = shuffled.slice(0, 3).map(f => f.question);

      res.write(`data: ${JSON.stringify({ done: true, suggestions })}\n\n`);
      res.end();

      await this.prisma.chatbotLog.create({
        data: { userId, question: message, answer: fullResponse },
      });

    } catch (error: any) {
      this.logger.error('Chatbot stream error:', error.message);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}
