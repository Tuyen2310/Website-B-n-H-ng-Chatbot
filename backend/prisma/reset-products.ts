import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang tiến hành xóa TOÀN BỘ sản phẩm và Reset mã ID về 1...');

  try {
    // Trong PostgreSQL, lệnh TRUNCATE ... RESTART IDENTITY CASCADE 
    // sẽ xóa sạch bảng Product, xóa luôn cả các dữ liệu liên quan (như Đánh giá, Đơn hàng chứa sản phẩm đó) 
    // và đặc biệt là TRẢ LẠI MÃ ID VỀ SỐ 1
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE;`);
    
    console.log('[THÀNH CÔNG] Toàn bộ Sản phẩm đã bị xóa sạch.');
    console.log('[THÀNH CÔNG] Mã ID (Auto-increment) đã được Reset về 1.');
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
