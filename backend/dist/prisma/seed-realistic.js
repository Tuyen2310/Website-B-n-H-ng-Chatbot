"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const realisticData = {
    'Điện thoại': [
        { name: 'iPhone 15 Pro Max 256GB', price: 32990000, keyword: 'iphone' },
        { name: 'Samsung Galaxy S24 Ultra', price: 29990000, keyword: 'samsung,phone' },
        { name: 'Xiaomi 14 Pro', price: 22990000, keyword: 'smartphone' },
        { name: 'Oppo Find X7 Ultra', price: 24990000, keyword: 'mobile' },
        { name: 'Google Pixel 8 Pro', price: 21990000, keyword: 'pixel,phone' }
    ],
    'Laptop': [
        { name: 'MacBook Pro 16 M3 Max', price: 79990000, keyword: 'macbook' },
        { name: 'Dell XPS 15 9530', price: 45990000, keyword: 'dell,laptop' },
        { name: 'Asus ROG Strix SCAR 16', price: 65990000, keyword: 'gaming,laptop' },
        { name: 'ThinkPad X1 Carbon Gen 11', price: 39990000, keyword: 'thinkpad' },
        { name: 'LG Gram 16 2023', price: 32990000, keyword: 'laptop' }
    ],
    'Âm thanh': [
        { name: 'Sony WH-1000XM5', price: 7490000, keyword: 'headphones' },
        { name: 'AirPods Pro 2', price: 5990000, keyword: 'airpods' },
        { name: 'Marshall Stanmore III', price: 9990000, keyword: 'speaker' },
        { name: 'JBL PartyBox 310', price: 12990000, keyword: 'jbl' },
        { name: 'Sennheiser Momentum 4', price: 8990000, keyword: 'headset' }
    ],
    'Đồng hồ': [
        { name: 'Apple Watch Ultra 2', price: 19990000, keyword: 'smartwatch' },
        { name: 'Garmin Fenix 7X Pro', price: 22990000, keyword: 'garmin' },
        { name: 'Samsung Galaxy Watch 6 Classic', price: 8990000, keyword: 'watch' },
        { name: 'Casio G-Shock Mudmaster', price: 12990000, keyword: 'gshock' },
        { name: 'Orient Star Classic', price: 15990000, keyword: 'orient,watch' }
    ],
    'Gia dụng': [
        { name: 'Robot hút bụi Roborock S8 Pro Ultra', price: 24990000, keyword: 'robot,vacuum' },
        { name: 'Nồi chiên không dầu Philips HD9860', price: 6990000, keyword: 'airfryer' },
        { name: 'Tủ lạnh Panasonic Inverter 550L', price: 18990000, keyword: 'refrigerator' },
        { name: 'Máy lọc không khí Dyson Purifier', price: 15990000, keyword: 'dyson' },
        { name: 'Máy giặt LG Inverter 10kg', price: 11990000, keyword: 'washing,machine' }
    ],
    'Phụ kiện': [
        { name: 'Pin sạc dự phòng Anker 20000mAh', price: 1290000, keyword: 'powerbank' },
        { name: 'Củ sạc nhanh Ugreen 100W GaN', price: 990000, keyword: 'charger' },
        { name: 'Chuột không dây Logitech MX Master 3S', price: 2490000, keyword: 'mouse' },
        { name: 'Bàn phím cơ Keychron Q1 Pro', price: 4590000, keyword: 'keyboard' },
        { name: 'Cáp sạc Belkin Type-C to Lightning', price: 490000, keyword: 'cable' }
    ],
    'Văn phòng': [
        { name: 'Ghế công thái học Herman Miller Aeron', price: 35990000, keyword: 'ergonomic,chair' },
        { name: 'Bàn nâng hạ thông minh Epione', price: 7990000, keyword: 'standing,desk' },
        { name: 'Máy in laser trắng đen HP', price: 3490000, keyword: 'printer' },
        { name: 'Màn hình Dell UltraSharp 27"', price: 12990000, keyword: 'monitor' },
        { name: 'Bút ký cao cấp Parker', price: 1590000, keyword: 'pen' }
    ],
    'Sức khỏe': [
        { name: 'Máy tăm nước Waterpik', price: 2590000, keyword: 'waterpik' },
        { name: 'Bàn chải điện Oral-B Pro 3', price: 1290000, keyword: 'toothbrush' },
        { name: 'Máy đo huyết áp Omron', price: 1190000, keyword: 'blood,pressure' },
        { name: 'Cân sức khỏe thông minh Xiaomi', price: 590000, keyword: 'scale' },
        { name: 'Máy massage cổ vai gáy', price: 1890000, keyword: 'massage' }
    ],
    'Làm đẹp': [
        { name: 'Máy rửa mặt Foreo Luna 4', price: 5990000, keyword: 'foreo' },
        { name: 'Máy sấy tóc Dyson Supersonic', price: 10990000, keyword: 'hair,dryer' },
        { name: 'Nước hoa Dior Sauvage 100ml', price: 3590000, keyword: 'perfume' },
        { name: 'Son MAC Matte Lipstick', price: 650000, keyword: 'lipstick' },
        { name: 'Serum Estee Lauder Advanced Night Repair', price: 3290000, keyword: 'serum' }
    ],
    'Đồ chơi': [
        { name: 'Lego Technic Porsche 911 RSR', price: 4590000, keyword: 'lego' },
        { name: 'Mô hình Gundam MG 1/100', price: 1290000, keyword: 'gundam' },
        { name: 'Xe điều khiển từ xa Traxxas', price: 8990000, keyword: 'rc,car' },
        { name: 'Búp bê Barbie Collector', price: 1590000, keyword: 'barbie' },
        { name: 'Bộ cờ vua gỗ cao cấp', price: 890000, keyword: 'chess' }
    ],
    'Sách': [
        { name: 'Sách Đắc Nhân Tâm - Dale Carnegie', price: 120000, keyword: 'book' },
        { name: 'Sách Nhà Giả Kim - Paulo Coelho', price: 95000, keyword: 'novel' },
        { name: 'Tiểu thuyết Harry Potter (Trọn bộ)', price: 1590000, keyword: 'harrypotter' },
        { name: 'Sách Tư Duy Nhanh Và Chậm', price: 185000, keyword: 'thinking' },
        { name: 'Sách Lược Sử Loài Người', price: 210000, keyword: 'history,book' }
    ],
    'Thể thao': [
        { name: 'Giày chạy bộ Nike Air Zoom Pegasus 40', price: 3290000, keyword: 'nike,shoes' },
        { name: 'Vợt cầu lông Yonex Astrox 99 Pro', price: 4590000, keyword: 'badminton' },
        { name: 'Quả bóng đá Adidas Al Rihla', price: 3590000, keyword: 'soccer' },
        { name: 'Xe đạp thể thao Trek Marlin 7', price: 18990000, keyword: 'bicycle' },
        { name: 'Thảm tập yoga Liforme', price: 3990000, keyword: 'yoga' }
    ],
    'Thời trang': [
        { name: 'Áo thun Polo Ralph Lauren', price: 2590000, keyword: 'polo,shirt' },
        { name: 'Quần jeans Levi\'s 501', price: 1890000, keyword: 'jeans' },
        { name: 'Túi xách Chanel Classic Flap Bag', price: 185000000, keyword: 'chanel,bag' },
        { name: 'Giày sneaker Nike Air Force 1', price: 2990000, keyword: 'sneaker' },
        { name: 'Kính mát Ray-Ban Aviator', price: 4290000, keyword: 'sunglasses' }
    ],
    'Thực phẩm': [
        { name: 'Sữa ong chúa Healthy Care 1000mg', price: 690000, keyword: 'supplement' },
        { name: 'Hạt dinh dưỡng mix Macca, Óc chó', price: 350000, keyword: 'nuts' },
        { name: 'Mật ong rừng nguyên chất 1L', price: 550000, keyword: 'honey' },
        { name: 'Thịt bò Wagyu Nhật Bản A5 (1kg)', price: 4500000, keyword: 'beef' },
        { name: 'Rượu vang đỏ Chateau Margaux', price: 18500000, keyword: 'wine' }
    ]
};
async function main() {
    console.log('--- Cập nhật dữ liệu thật ---');
    await prisma.orderItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    for (const [catName, products] of Object.entries(realisticData)) {
        let category = await prisma.category.findFirst({ where: { name: catName } });
        if (!category) {
            category = await prisma.category.create({
                data: { name: catName, description: `Chuyên cung cấp các sản phẩm ${catName} chính hãng.` }
            });
        }
        for (const [index, p] of products.entries()) {
            const image1 = `https://loremflickr.com/600/600/${p.keyword.split(',')[0]}?random=${index}1`;
            const image2 = `https://loremflickr.com/800/800/${p.keyword.split(',')[0]}?random=${index}2`;
            await prisma.product.create({
                data: {
                    name: p.name,
                    price: p.price,
                    description: `Sản phẩm ${p.name} chính hãng chất lượng cao. Bảo hành 12 tháng theo tiêu chuẩn nhà sản xuất. Giao hàng toàn quốc nhanh chóng.`,
                    stock: Math.floor(Math.random() * 50) + 10,
                    soldCount: Math.floor(Math.random() * 500) + 10,
                    categoryId: category.id,
                    images: [image1, image2],
                    attributes: {
                        "Tình trạng": "Mới 100%",
                        "Bảo hành": "12 tháng"
                    }
                }
            });
        }
        console.log(`[OK] Đã nạp 5 sản phẩm thật cho danh mục: ${catName}`);
        console.log(`[OK] Đã nạp 5 sản phẩm thật cho danh mục: ${catName}`);
    }
    const testUser = await prisma.user.findFirst({ where: { email: 'user@example.com' } });
    if (testUser) {
        const allProducts = await prisma.product.findMany({ take: 10 });
        for (const prod of allProducts) {
            await prisma.wishlist.upsert({
                where: { userId_productId: { userId: testUser.id, productId: prod.id } },
                update: {},
                create: { userId: testUser.id, productId: prod.id }
            });
        }
        console.log(`[OK] Đã nạp 10 sản phẩm yêu thích (Wishlist) cho user@example.com`);
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-realistic.js.map