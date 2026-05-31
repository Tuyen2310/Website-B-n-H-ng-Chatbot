const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const attributes = [
    { name: 'Màu sắc', values: ['Đen', 'Trắng', 'Xanh dương', 'Titan tự nhiên', 'Hồng', 'Vàng', 'Đỏ'] },
    { name: 'Dung lượng RAM', values: ['4GB', '8GB', '12GB', '16GB', '32GB', '64GB'] },
    { name: 'Bộ nhớ trong', values: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'] },
    { name: 'Kích thước màn hình', values: ['6.1 inch', '6.7 inch', '13 inch', '14 inch', '16 inch'] },
    { name: 'Loại sản phẩm', values: ['Chính hãng VN/A', 'Xách tay', 'Cũ 99%', 'Refurbished'] },
  ];

  console.log('Đang nạp thuộc tính mẫu...');

  for (const attr of attributes) {
    await prisma.productAttribute.upsert({
      where: { name: attr.name },
      update: { values: attr.values },
      create: { name: attr.name, values: attr.values },
    });
  }

  console.log('Đã nạp xong!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
