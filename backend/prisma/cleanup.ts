import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu dọn dẹp Database...');

  // 1. Xóa vĩnh viễn các sản phẩm đã bị đánh dấu là xóa (isDeleted = true)
  const deletedProducts = await prisma.product.deleteMany({
    where: { isDeleted: true },
  });
  console.log(`- Đã dọn dẹp ${deletedProducts.count} sản phẩm bị đánh dấu xóa.`);

  // 2. Các thao tác dọn dẹp khác (Ví dụ: Đơn hàng test, User spam)
  // Bạn có thể tùy chỉnh thêm các script dọn dẹp ở đây.

  console.log('Hoàn tất dọn dẹp Database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
