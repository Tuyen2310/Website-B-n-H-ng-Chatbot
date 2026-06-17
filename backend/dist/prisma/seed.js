"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Bắt đầu quy trình nạp dữ liệu hệ thống (Master Seed) ---');
    await prisma.chatbotLog.deleteMany();
    await prisma.review.deleteMany();
    await prisma.fAQ.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.user.deleteMany();
    await prisma.settings.deleteMany();
    console.log('✓ Đã dọn sạch dữ liệu cũ');
    await prisma.settings.create({
        data: {
            shopName: 'SmartShop AI',
            tagline: 'Trải nghiệm mua sắm thông minh với AI trợ lý',
            email: 'support@smartshop.com',
            phone: '0987654321',
            address: '123 Đường Công Nghệ, Hà Nội',
            bankEnabled: true,
            bankId: 'Vietcombank',
            accountNo: '1234567890',
            accountName: 'CONG TY SMART SHOP',
            chatbotEnabled: true,
            chatbotApiKey: 'AIzaSyApItiS2pzaHqy8pkLuD6KZhG6PDW4hdG0',
            chatbotModel: 'gemini-1.5-flash',
            chatbotWelcome: 'Chào mừng bạn đến với SmartShop! Tôi có thể giúp gì cho bạn?',
        }
    });
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@smartshop.com',
            password: adminPassword,
            name: 'Quản trị viên Hệ thống',
            role: client_1.Role.ADMIN,
            phone: '0987654321',
            address: 'Hà Nội, Việt Nam'
        }
    });
    const customer = await prisma.user.create({
        data: {
            email: 'user@example.com',
            password: userPassword,
            name: 'Nguyễn Văn Khách',
            role: client_1.Role.USER,
            phone: '0123456789',
            address: '456 Đường Lê Lợi, TP.HCM'
        }
    });
    console.log('✓ Đã tạo tài khoản Admin (admin@smartshop.com / admin123)');
    const categoryNames = [
        'Điện thoại', 'Laptop', 'Âm thanh', 'Đồng hồ', 'Gia dụng',
        'Phụ kiện', 'Văn phòng', 'Sức khỏe', 'Làm đẹp', 'Đồ chơi',
        'Sách', 'Thể thao', 'Thời trang', 'Thực phẩm'
    ];
    for (const catName of categoryNames) {
        let category = await prisma.category.findFirst({ where: { name: catName } });
        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: catName,
                    description: `Danh mục cung cấp các sản phẩm ${catName} chính hãng chất lượng cao.`,
                },
            });
        }
        console.log(`[OK] Đã xử lý danh mục: ${category.name}`);
        for (let i = 1; i <= 5; i++) {
            const productName = `${catName} Cao Cấp Mẫu Số ${i}`;
            const safeSeed = catName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
            const images = [
                `https://picsum.photos/seed/${safeSeed}_${i}_main/600/600`,
                `https://picsum.photos/seed/${safeSeed}_${i}_detail1/800/800`,
                `https://picsum.photos/seed/${safeSeed}_${i}_detail2/800/800`,
            ];
            const isFlash = Math.random() > 0.7;
            const originalPrice = Math.floor(Math.random() * 5000000) + 100000;
            const fSalePrice = isFlash ? Math.floor(originalPrice * 0.8) : null;
            await prisma.product.create({
                data: {
                    name: productName,
                    price: originalPrice,
                    description: `Đây là thông tin mô tả chi tiết cho ${productName}. Sản phẩm được bảo hành chính hãng và đi kèm nhiều phụ kiện hấp dẫn. Hãy đặt mua ngay hôm nay để nhận ưu đãi!`,
                    stock: Math.floor(Math.random() * 100) + 10,
                    categoryId: category.id,
                    images: images,
                    isFlashSale: isFlash,
                    flashSalePrice: fSalePrice,
                    attributes: {
                        brand: "Thương hiệu Demo",
                        origin: "Việt Nam",
                        condition: "Mới 100%"
                    }
                }
            });
        }
        console.log(`   -> Đã thêm thành công 5 sản phẩm cho ${category.name}`);
    }
    console.log('✓ Đã nạp toàn bộ danh sách sản phẩm mẫu lớn');
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);
    const promotions = [
        {
            code: 'GIAM10',
            type: 'DISCOUNT',
            discountPercent: 10,
            minOrderAmount: 100000,
            startDate: now,
            endDate: nextMonth,
            isActive: true,
        },
        {
            code: 'FREESHIP',
            type: 'FREESHIP',
            minOrderAmount: 200000,
            startDate: now,
            endDate: nextMonth,
            isActive: true,
        },
        {
            code: 'VOUCHER50K',
            type: 'DISCOUNT',
            discountAmount: 50000,
            minOrderAmount: 500000,
            startDate: now,
            endDate: nextMonth,
            isActive: true,
        }
    ];
    for (const promo of promotions) {
        await prisma.promotion.create({ data: promo });
    }
    console.log('✓ Đã nạp mã giảm giá & Freeship');
    await prisma.fAQ.createMany({
        data: [
            {
                question: 'Thời gian giao hàng mất bao lâu?',
                answer: 'Dạ, nội thành Hà Nội & TP.HCM chúng em giao trong 2h. Các tỉnh thành khác sẽ từ 2-3 ngày làm việc ạ.',
                topic: 'Vận chuyển'
            },
            {
                question: 'Tôi có được kiểm tra hàng trước khi thanh toán không?',
                answer: 'Dạ có ạ! SmartShop hỗ trợ Quý khách đồng kiểm (mở hộp kiểm tra sản phẩm) trước khi thanh toán cho shipper để đảm bảo hàng đúng mẫu mã và chất lượng.',
                topic: 'Vận chuyển'
            },
            {
                question: 'Chính sách bảo hành của cửa hàng như thế nào?',
                answer: 'Tất cả sản phẩm công nghệ tại SmartShop đều được bảo hành 12 tháng chính hãng. Đặc biệt, chúng em hỗ trợ 1 đổi 1 trong 30 ngày đầu nếu có lỗi từ nhà sản xuất ạ.',
                topic: 'Bảo hành'
            },
            {
                question: 'Shop có hỗ trợ trả góp không?',
                answer: 'Dạ có ạ, bên em hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng của hơn 20 ngân hàng, hoặc trả góp qua hồ sơ (CCCD) với các công ty tài chính như Home Credit, FE Credit.',
                topic: 'Thanh toán'
            },
            {
                question: 'Làm sao để được miễn phí vận chuyển?',
                answer: 'Dạ, với mọi đơn hàng có giá trị từ 200.000đ trở lên, SmartShop sẽ miễn phí vận chuyển toàn quốc cho Quý khách ạ.',
                topic: 'Ưu đãi'
            },
            {
                question: 'Cửa hàng có địa chỉ ở đâu?',
                answer: 'Dạ, Quý khách có thể ghé thăm chúng em tại địa chỉ: 123 Đường Công Nghệ, Đống Đa, Hà Nội để trải nghiệm trực tiếp sản phẩm ạ.',
                topic: 'Thông tin'
            },
            {
                question: 'Sản phẩm có phải hàng chính hãng không?',
                answer: 'SmartShop cam kết 100% sản phẩm là hàng chính hãng, mới nguyên seal. Nếu phát hiện hàng giả, chúng em xin đền bù 200% giá trị đơn hàng ạ.',
                topic: 'Sản phẩm'
            },
        ]
    });
    console.log('✓ Đã tạo FAQs');
    console.log('--- HOÀN TẤT SEEDING DỮ LIỆU ---');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map