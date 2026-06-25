"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const latestProducts = await prisma.product.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    });
    console.log(`Tìm thấy ${latestProducts.length} sản phẩm mới nhất.`);
    let createdCount = 0;
    for (const product of latestProducts) {
        const existingFaq = await prisma.fAQ.findFirst({
            where: { productId: product.id }
        });
        if (existingFaq) {
            console.log(`Sản phẩm ${product.name} đã có FAQ. Bỏ qua.`);
            continue;
        }
        const faqsToCreate = [
            {
                question: `Sản phẩm ${product.name} có những tính năng nổi bật gì?`,
                answer: `Dạ, ${product.name} thuộc dòng ${product.category?.name || 'sản phẩm'} cao cấp của bên em. Điểm nổi bật nhất là: ${product.description.substring(0, 100)}... Sản phẩm này hiện đang rất được ưa chuộng ạ!`,
                topic: 'Sản phẩm',
                productId: product.id,
            },
            {
                question: `${product.name} bảo hành bao lâu?`,
                answer: `Sản phẩm ${product.name} được bảo hành chính hãng 12 tháng tại tất cả các trung tâm của SmartShop trên toàn quốc ạ. Quý khách còn được hỗ trợ 1 đổi 1 trong 30 ngày đầu nếu có lỗi từ nhà sản xuất.`,
                topic: 'Bảo hành',
                productId: product.id,
            },
            {
                question: `Có chương trình khuyến mãi nào khi mua ${product.name} không?`,
                answer: `Dạ, khi mua ${product.name} trong thời điểm này, mức giá cực kỳ ưu đãi. Bên em còn có các mã giảm giá Freeship và giảm trực tiếp vào đơn hàng nữa ạ.`,
                topic: 'Khuyến mãi',
                productId: product.id,
            }
        ];
        await prisma.fAQ.createMany({
            data: faqsToCreate
        });
        createdCount += faqsToCreate.length;
        console.log(`Đã tạo ${faqsToCreate.length} FAQ cho ${product.name}`);
    }
    console.log(`\n=> TỔNG CỘNG ĐÃ TẠO MỚI ${createdCount} CÂU HỎI FAQ!`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=generate_faqs.js.map