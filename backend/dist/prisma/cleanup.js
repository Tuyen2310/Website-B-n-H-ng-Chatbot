"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Bắt đầu dọn dẹp Database...');
    const deletedProducts = await prisma.product.deleteMany({
        where: { isDeleted: true },
    });
    console.log(`- Đã dọn dẹp ${deletedProducts.count} sản phẩm bị đánh dấu xóa.`);
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
//# sourceMappingURL=cleanup.js.map