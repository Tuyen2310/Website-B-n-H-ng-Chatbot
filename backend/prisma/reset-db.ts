/**
 * reset-db.ts – Hard Reset toàn bộ Database
 * 
 * Script này sẽ:
 * 1. Xóa SẠCH tất cả dữ liệu trong tất cả bảng (kể cả soft-deleted)
 * 2. Reset sequence ID về 1 cho tất cả bảng (TRUNCATE ... RESTART IDENTITY)
 * 3. Seed lại dữ liệu sạch từ đầu
 * 
 * Chạy: npx ts-node prisma/reset-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================================
// Dữ liệu mẫu sạch (70 sản phẩm, 14 danh mục)
// =====================================================
const freshData: Record<string, Array<{ name: string; price: number; stock: number; soldCount: number; keyword: string }>> = {
  'Điện thoại': [
    { name: 'iPhone 15 Pro Max 256GB', price: 32990000, stock: 50, soldCount: 320, keyword: 'iphone' },
    { name: 'Samsung Galaxy S24 Ultra 512GB', price: 29990000, stock: 45, soldCount: 280, keyword: 'samsung' },
    { name: 'Xiaomi 14 Pro 5G', price: 22990000, stock: 38, soldCount: 195, keyword: 'xiaomi' },
    { name: 'Oppo Find X7 Ultra', price: 24990000, stock: 30, soldCount: 145, keyword: 'oppo' },
    { name: 'Google Pixel 8 Pro', price: 21990000, stock: 25, soldCount: 112, keyword: 'pixel' },
  ],
  'Laptop': [
    { name: 'MacBook Pro 16 M3 Max', price: 79990000, stock: 20, soldCount: 98, keyword: 'macbook' },
    { name: 'Dell XPS 15 9530', price: 45990000, stock: 18, soldCount: 76, keyword: 'dell' },
    { name: 'Asus ROG Strix SCAR 16', price: 65990000, stock: 15, soldCount: 55, keyword: 'asus' },
    { name: 'ThinkPad X1 Carbon Gen 11', price: 39990000, stock: 22, soldCount: 88, keyword: 'thinkpad' },
    { name: 'LG Gram 16 2023', price: 32990000, stock: 28, soldCount: 130, keyword: 'lg' },
  ],
  'Âm thanh': [
    { name: 'Sony WH-1000XM5', price: 7490000, stock: 60, soldCount: 450, keyword: 'sony' },
    { name: 'AirPods Pro 2', price: 5990000, stock: 80, soldCount: 620, keyword: 'airpods' },
    { name: 'Marshall Stanmore III', price: 9990000, stock: 25, soldCount: 180, keyword: 'marshall' },
    { name: 'JBL PartyBox 310', price: 12990000, stock: 20, soldCount: 95, keyword: 'jbl' },
    { name: 'Sennheiser Momentum 4', price: 8990000, stock: 35, soldCount: 210, keyword: 'sennheiser' },
  ],
  'Đồng hồ': [
    { name: 'Apple Watch Ultra 2', price: 19990000, stock: 30, soldCount: 190, keyword: 'apple' },
    { name: 'Garmin Fenix 7X Pro', price: 22990000, stock: 18, soldCount: 88, keyword: 'garmin' },
    { name: 'Samsung Galaxy Watch 6 Classic', price: 8990000, stock: 45, soldCount: 260, keyword: 'samsung' },
    { name: 'Casio G-Shock Mudmaster', price: 12990000, stock: 22, soldCount: 145, keyword: 'casio' },
    { name: 'Orient Star Classic', price: 15990000, stock: 15, soldCount: 72, keyword: 'orient' },
  ],
  'Gia dụng': [
    { name: 'Robot hút bụi Roborock S8 Pro Ultra', price: 24990000, stock: 20, soldCount: 112, keyword: 'robot' },
    { name: 'Nồi chiên không dầu Philips HD9860', price: 6990000, stock: 55, soldCount: 380, keyword: 'philips' },
    { name: 'Tủ lạnh Panasonic Inverter 550L', price: 18990000, stock: 12, soldCount: 65, keyword: 'panasonic' },
    { name: 'Máy lọc không khí Dyson Purifier', price: 15990000, stock: 18, soldCount: 95, keyword: 'dyson' },
    { name: 'Máy giặt LG Inverter 10kg', price: 11990000, stock: 25, soldCount: 148, keyword: 'lg' },
  ],
  'Phụ kiện': [
    { name: 'Pin sạc dự phòng Anker 20000mAh', price: 1290000, stock: 120, soldCount: 980, keyword: 'anker' },
    { name: 'Củ sạc nhanh Ugreen 100W GaN', price: 990000, stock: 100, soldCount: 720, keyword: 'ugreen' },
    { name: 'Chuột không dây Logitech MX Master 3S', price: 2490000, stock: 65, soldCount: 430, keyword: 'logitech' },
    { name: 'Bàn phím cơ Keychron Q1 Pro', price: 4590000, stock: 40, soldCount: 280, keyword: 'keychron' },
    { name: 'Cáp sạc Belkin USB-C to Lightning', price: 490000, stock: 200, soldCount: 1200, keyword: 'belkin' },
  ],
  'Văn phòng': [
    { name: 'Ghế công thái học Herman Miller Aeron', price: 35990000, stock: 8, soldCount: 45, keyword: 'chair' },
    { name: 'Bàn nâng hạ thông minh Epione', price: 7990000, stock: 20, soldCount: 118, keyword: 'desk' },
    { name: 'Máy in laser HP LaserJet Pro', price: 3490000, stock: 30, soldCount: 220, keyword: 'printer' },
    { name: 'Màn hình Dell UltraSharp 27 4K', price: 12990000, stock: 22, soldCount: 155, keyword: 'monitor' },
    { name: 'Bút ký cao cấp Parker Sonnet', price: 1590000, stock: 50, soldCount: 280, keyword: 'pen' },
  ],
  'Sức khỏe': [
    { name: 'Máy tăm nước Waterpik WP-660', price: 2590000, stock: 45, soldCount: 310, keyword: 'waterpik' },
    { name: 'Bàn chải điện Oral-B Pro 3000', price: 1290000, stock: 80, soldCount: 560, keyword: 'oralb' },
    { name: 'Máy đo huyết áp Omron HEM-7361T', price: 1190000, stock: 60, soldCount: 420, keyword: 'omron' },
    { name: 'Cân sức khỏe thông minh Xiaomi S400', price: 590000, stock: 100, soldCount: 780, keyword: 'scale' },
    { name: 'Máy massage cổ vai gáy Beurer', price: 1890000, stock: 40, soldCount: 280, keyword: 'massage' },
  ],
  'Thời trang': [
    { name: 'Áo Polo Ralph Lauren Classic', price: 2990000, stock: 80, soldCount: 450, keyword: 'polo' },
    { name: 'Giày Nike Air Force 1 Low', price: 3290000, stock: 60, soldCount: 620, keyword: 'nike' },
    { name: 'Túi xách Coach Tabby 26', price: 18990000, stock: 15, soldCount: 88, keyword: 'coach' },
    { name: 'Đồng hồ dây da Fossil Neutra', price: 4990000, stock: 25, soldCount: 175, keyword: 'fossil' },
    { name: 'Kính mắt Ray-Ban Aviator Classic', price: 5490000, stock: 35, soldCount: 230, keyword: 'rayban' },
  ],
  'Thể thao': [
    { name: 'Xe đạp thể thao Giant ATX 830', price: 12990000, stock: 12, soldCount: 65, keyword: 'bicycle' },
    { name: 'Tạ tay cao su 20kg Kamachi', price: 1590000, stock: 40, soldCount: 290, keyword: 'dumbbell' },
    { name: 'Máy chạy bộ điện Kettler Optima', price: 18990000, stock: 8, soldCount: 45, keyword: 'treadmill' },
    { name: 'Bóng rổ Spalding NBA Street', price: 890000, stock: 55, soldCount: 380, keyword: 'basketball' },
    { name: 'Vợt cầu lông Yonex Astrox 99', price: 3490000, stock: 30, soldCount: 220, keyword: 'badminton' },
  ],
  'Sách': [
    { name: 'Đắc Nhân Tâm – Dale Carnegie', price: 89000, stock: 500, soldCount: 2800, keyword: 'book' },
    { name: 'Nghĩ Giàu Làm Giàu – Napoleon Hill', price: 129000, stock: 350, soldCount: 1950, keyword: 'book' },
    { name: 'Atomic Habits – James Clear (bản dịch)', price: 109000, stock: 400, soldCount: 2200, keyword: 'book' },
    { name: 'Clean Code – Robert C. Martin', price: 289000, stock: 150, soldCount: 680, keyword: 'coding' },
    { name: 'Sapiens: Lược Sử Loài Người', price: 199000, stock: 250, soldCount: 1200, keyword: 'history' },
  ],
  'Đồ chơi': [
    { name: 'LEGO Technic Bugatti Chiron 42083', price: 5990000, stock: 15, soldCount: 88, keyword: 'lego' },
    { name: 'Xe điều khiển từ xa RC Traxxas', price: 3490000, stock: 22, soldCount: 145, keyword: 'car' },
    { name: 'Máy Bay Drone DJI Mini 3 Pro', price: 18990000, stock: 10, soldCount: 65, keyword: 'drone' },
    { name: 'Búp bê Barbie Malibu Anniversary', price: 1290000, stock: 45, soldCount: 320, keyword: 'doll' },
    { name: 'Rubik 3x3 Gan 356 Air SM', price: 890000, stock: 60, soldCount: 480, keyword: 'rubik' },
  ],
  'Mỹ phẩm': [
    { name: 'Kem dưỡng ẩm La Roche-Posay Toleriane', price: 490000, stock: 120, soldCount: 850, keyword: 'skincare' },
    { name: 'Son môi MAC Retro Matte', price: 650000, stock: 95, soldCount: 720, keyword: 'lipstick' },
    { name: 'Nước hoa Dior Sauvage EDP 100ml', price: 4290000, stock: 25, soldCount: 180, keyword: 'perfume' },
    { name: 'Kem chống nắng Anessa Gold SPF 50+', price: 590000, stock: 140, soldCount: 980, keyword: 'sunscreen' },
    { name: 'Serum Vitamin C Obagi Professional', price: 1890000, stock: 65, soldCount: 420, keyword: 'serum' },
  ],
  'Thực phẩm': [
    { name: 'Mật ong rừng nguyên chất 1L', price: 550000, stock: 80, soldCount: 520, keyword: 'honey' },
    { name: 'Thịt bò Wagyu Nhật Bản A5 1kg', price: 4500000, stock: 20, soldCount: 88, keyword: 'beef' },
    { name: 'Rượu vang đỏ Chateau Margaux 2019', price: 18500000, stock: 8, soldCount: 35, keyword: 'wine' },
    { name: 'Hạt macadamia rang muối 500g', price: 290000, stock: 150, soldCount: 980, keyword: 'nuts' },
    { name: 'Trà ô long Đài Loan cao cấp 150g', price: 380000, stock: 95, soldCount: 620, keyword: 'tea' },
  ],
};

async function main() {
  console.log('\n🔄 BẮT ĐẦU HARD RESET DATABASE...\n');

  // =========================================================
  // BƯỚC 1: XÓA SẠCH TOÀN BỘ DỮ LIỆU (theo thứ tự FK)
  // =========================================================
  console.log('🗑️  Đang xóa toàn bộ dữ liệu...');

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE 
    "AdminAuditLog",
    "ChatbotLog",
    "CartItem",
    "Cart",
    "Wishlist",
    "Address",
    "Review",
    "OrderItem",
    "Order",
    "Promotion",
    "ProductAttribute",
    "ProductVariant",
    "Product",
    "Category",
    "FAQ",
    "Settings"
    RESTART IDENTITY CASCADE
  `);

  // Xóa user riêng sau vì có FK phức tạp
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`);

  console.log('✅ Đã xóa sạch tất cả bảng và reset sequence ID về 1\n');

  // =========================================================
  // BƯỚC 2: TẠO LẠI USER ADMIN & TEST
  // =========================================================
  console.log('👤 Đang tạo tài khoản...');

  const bcrypt = require('bcrypt');
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  await prisma.user.createMany({
    data: [
      {
        id: 1,
        email: 'admin@smartshop.com',
        password: adminHash,
        name: 'Admin SmartShop',
        role: 'ADMIN',
        points: 0,
      },
      {
        id: 2,
        email: 'user@example.com',
        password: userHash,
        name: 'Nguyễn Văn A',
        role: 'USER',
        points: 150,
      },
    ],
  });

  // Reset sequence sau khi insert có ID cố định
  await prisma.$executeRawUnsafe(`SELECT setval('"User_id_seq"', 2, true)`);
  console.log('✅ Đã tạo: admin@smartshop.com (pass: admin123) | user@example.com (pass: user123)');

  // =========================================================
  // BƯỚC 3: TẠO DANH MỤC & SẢN PHẨM SẠCH
  // =========================================================
  console.log('\n📦 Đang nạp danh mục và sản phẩm...');

  let productCount = 0;
  for (const [catName, products] of Object.entries(freshData)) {
    const category = await prisma.category.create({
      data: {
        name: catName,
        description: `Chuyên cung cấp các sản phẩm ${catName} chính hãng, chất lượng cao.`,
      },
    });

    for (const [idx, p] of products.entries()) {
      const keyword = p.keyword.split(',')[0];
      const seed1 = (category.id * 10 + idx) * 31;
      const seed2 = (category.id * 10 + idx) * 37;

      await prisma.product.create({
        data: {
          name: p.name,
          price: p.price,
          description: `${p.name} chính hãng 100%. Bảo hành 12 tháng theo tiêu chuẩn nhà sản xuất. Giao hàng nhanh toàn quốc.`,
          stock: p.stock,
          soldCount: p.soldCount,
          categoryId: category.id,
          images: [
            `https://loremflickr.com/600/600/${keyword}?lock=${seed1}`,
            `https://loremflickr.com/800/800/${keyword}?lock=${seed2}`,
          ],
          attributes: {
            'Tình trạng': 'Mới 100%',
            'Bảo hành': '12 tháng',
            'Xuất xứ': 'Chính hãng',
          },
        },
      });
      productCount++;
    }
    console.log(`  ✓ [${category.id}] ${catName}: ${products.length} sản phẩm`);
  }

  // =========================================================
  // BƯỚC 4: TẠO MÃ KHUYẾN MÃI
  // =========================================================
  console.log('\n🎫 Đang tạo mã khuyến mãi...');

  const now = new Date();
  const future = new Date(now);
  future.setFullYear(future.getFullYear() + 1);

  await prisma.promotion.createMany({
    data: [
      { code: 'GIAM10', discountPercent: 10, startDate: now, endDate: future, isActive: true },
      { code: 'GIAM20', discountPercent: 20, startDate: now, endDate: future, isActive: true },
      { code: 'SAVE50K', discountPercent: 5, startDate: now, endDate: future, isActive: true },
      { code: 'NEWUSER', discountPercent: 15, startDate: now, endDate: future, isActive: true },
    ],
  });
  console.log('  ✓ Đã tạo 4 mã giảm giá: GIAM10, GIAM20, SAVE50K, NEWUSER');

  // =========================================================
  // BƯỚC 5: TẠO FAQ
  // =========================================================
  await (prisma as any).fAQ.createMany({
    data: [
      { question: 'SmartShop có chính sách đổi trả như thế nào?', answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất. Vui lòng liên hệ hotline để được hỗ trợ.', topic: 'Chính sách' },
      { question: 'Thời gian giao hàng mất bao lâu?', answer: 'Thông thường 2-4 ngày làm việc với giao hàng tiêu chuẩn, 1-2 ngày với giao hàng nhanh trong nội thành.', topic: 'Vận chuyển' },
      { question: 'Sản phẩm có bảo hành không?', answer: 'Tất cả sản phẩm tại SmartShop đều được bảo hành chính hãng từ 6-24 tháng tùy loại sản phẩm.', topic: 'Bảo hành' },
      { question: 'Tôi có thể thanh toán bằng hình thức nào?', answer: 'SmartShop chấp nhận thanh toán COD (tiền mặt khi nhận hàng), chuyển khoản ngân hàng và ví điện tử.', topic: 'Thanh toán' },
    ],
  });

  // =========================================================
  // KẾT QUẢ
  // =========================================================
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalUsers = await prisma.user.count();

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     ✅ HARD RESET HOÀN TẤT!              ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  📂 Danh mục: ${totalCategories.toString().padEnd(26)}║`);
  console.log(`║  📦 Sản phẩm: ${totalProducts.toString().padEnd(26)}║`);
  console.log(`║  👤 Users:    ${totalUsers.toString().padEnd(26)}║`);
  console.log('║  🔢 ID đã reset về bắt đầu từ 1         ║');
  console.log('╚══════════════════════════════════════════╝\n');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
