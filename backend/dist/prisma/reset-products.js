"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Đang tiến hành xóa TOÀN BỘ sản phẩm và Reset mã ID về 1...');
    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE;`);
        console.log('[THÀNH CÔNG] Toàn bộ Sản phẩm đã bị xóa sạch.');
        console.log('[THÀNH CÔNG] Mã ID (Auto-increment) đã được Reset về 1.');
    }
    catch (error) {
        console.error('Đã xảy ra lỗi:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=reset-products.js.map