"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const products = await prisma.product.findMany({
        where: { isDeleted: false },
        take: 30,
        include: { category: true },
    });
    const productContext = products.map((p) => {
        const attributes = p.attributes;
        const attrStr = attributes ? JSON.stringify(attributes) : 'Không có thông số';
        const shortDesc = p.description ? (p.description.length > 80 ? p.description.substring(0, 80) + '...' : p.description) : 'Đang cập nhật...';
        return `🛍️ **${p.name}**\n💸 Giá: *${p.price.toLocaleString('vi-VN')}đ*\n✨ ${shortDesc}\n🔗 Link: /shop/${p.id}`;
    }).join('\n\n');
    console.log('Product String Length after fix:', productContext.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=check_prompt.js.map