"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const topics = {
    'Giao hàng': [
        ['Bao lâu thì tôi nhận được hàng?', 'Dạ, thông thường thời gian giao hàng sẽ từ 1-3 ngày làm việc đối với khu vực nội thành, và 3-5 ngày làm việc đối với ngoại thành ạ.'],
        ['Cửa hàng có freeship không?', 'Dạ, cửa hàng em áp dụng Freeship cho tất cả đơn hàng có giá trị từ 500,000đ trở lên trên toàn quốc ạ.'],
        ['Giao hàng nhanh nhất là bao lâu?', 'Bên em có dịch vụ giao hàng hỏa tốc trong vòng 2H đối với các khu vực nội thành. Vui lòng chọn giao hỏa tốc khi thanh toán ạ.'],
        ['Tôi có được kiểm tra hàng trước khi nhận không?', 'Dạ có ạ! Quý khách hoàn toàn được đồng kiểm (kiểm tra hàng) cùng bưu tá trước khi thanh toán. Nếu hàng không đúng mô tả, quý khách có thể từ chối nhận ạ.'],
        ['Phí giao hàng là bao nhiêu?', 'Phí giao hàng tiêu chuẩn là 30,000đ. Đơn hàng trên 500,000đ sẽ được miễn phí vận chuyển ạ.'],
        ['Làm sao để theo dõi đơn hàng?', 'Quý khách có thể kiểm tra trạng thái đơn hàng trong mục Lịch sử đơn hàng, hoặc xem mã vận đơn trong Email xác nhận mà bên em đã gửi ạ.'],
        ['Giao sai địa chỉ thì làm sao?', 'Dạ, nếu phát hiện sai địa chỉ giao hàng, Quý khách vui lòng gọi ngay Hotline để bên em cập nhật lại với đơn vị vận chuyển sớm nhất nhé!'],
        ['Cửa hàng dùng đơn vị vận chuyển nào?', 'Bên em hợp tác với các đơn vị vận chuyển uy tín như Giao Hàng Nhanh, Viettel Post và GHTK để đảm bảo hàng đến tay Quý khách an toàn nhất ạ.']
    ],
    'Thanh toán': [
        ['Có những hình thức thanh toán nào?', 'Dạ bên em hỗ trợ Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng, và Thanh toán qua thẻ tín dụng/ví điện tử (VNPAY, MoMo) ạ.'],
        ['Tôi có thể thanh toán bằng thẻ tín dụng không?', 'Dạ hoàn toàn được ạ. Quý khách có thể thanh toán bằng thẻ Visa/Mastercard trực tiếp trên website qua cổng thanh toán bảo mật.'],
        ['Thanh toán online có an toàn không?', 'Dạ, website sử dụng công nghệ mã hóa SSL chuẩn quốc tế và cổng thanh toán được chứng nhận bảo mật, Quý khách hoàn toàn yên tâm nhé.'],
        ['Chuyển khoản xong bao lâu thì xác nhận?', 'Dạ, hệ thống bên em sẽ tự động xác nhận đơn hàng ngay trong vòng 5 phút sau khi nhận được chuyển khoản thành công ạ.'],
        ['Lỗi thanh toán bị trừ tiền nhưng chưa có đơn', 'Dạ Quý khách đừng lo lắng, trường hợp này thường do kết nối mạng bị chậm. Quý khách vui lòng cung cấp số điện thoại hoặc mã giao dịch để bên em kiểm tra và hoàn tiền hoặc tạo đơn ngay ạ!']
    ],
    'Đổi trả và Bảo hành': [
        ['Chính sách đổi trả như thế nào?', 'Dạ, bên em hỗ trợ 1 ĐỔI 1 trong vòng 30 ngày đầu tiên nếu sản phẩm có lỗi từ nhà sản xuất ạ.'],
        ['Tôi muốn trả hàng lấy lại tiền được không?', 'Dạ, nếu sản phẩm chưa qua sử dụng và còn nguyên tem mác, Quý khách có thể trả hàng hoàn tiền trong vòng 7 ngày kể từ khi nhận hàng.'],
        ['Sản phẩm bảo hành bao lâu?', 'Hầu hết các sản phẩm bên em đều được bảo hành chính hãng 12 tháng. Thông tin chi tiết được ghi rõ trong Phiếu bảo hành đi kèm ạ.'],
        ['Tôi làm mất phiếu bảo hành thì sao?', 'Dạ không sao ạ. Cửa hàng quản lý bảo hành điện tử theo Số điện thoại mua hàng, nên Quý khách chỉ cần đọc Số điện thoại là được hỗ trợ bảo hành ạ.']
    ],
    'Chung': [
        ['Cửa hàng ở đâu?', 'Dạ, cửa hàng bên em có địa chỉ tại Hà Nội. Tuy nhiên bên em bán Online và giao hàng toàn quốc ạ.'],
        ['Giờ làm việc của cửa hàng?', 'Bộ phận CSKH bên em hoạt động từ 8h00 sáng đến 22h00 tối tất cả các ngày trong tuần, kể cả ngày Lễ ạ.'],
        ['Hàng có sẵn không?', 'Dạ, các sản phẩm Quý khách có thể thêm vào giỏ hàng trên website đều là hàng có sẵn tại kho ạ.'],
        ['Hàng chính hãng không?', 'Cửa hàng cam kết 100% sản phẩm là hàng chính hãng, đầy đủ hóa đơn chứng từ. Nếu phát hiện hàng giả, bên em đền bù 200% giá trị đơn hàng ạ.']
    ]
};
const prefixes = ['Cho mình hỏi ', 'Bạn ơi ', 'Ad ơi ', 'Cho tôi hỏi ', 'Tư vấn giúp mình ', '', 'Shop ơi ', 'Shop cho hỏi ', 'Mình thắc mắc '];
const suffixes = [' nhé', ' nha', ' với', ' ạ', ' được không', '', ' nhé shop', ' nha shop'];
const faqs = [];
for (const [topic, qas] of Object.entries(topics)) {
    for (const [q, a] of qas) {
        faqs.push({ question: q, answer: a, topic });
        for (let i = 0; i < 9; i++) {
            const p = prefixes[Math.floor(Math.random() * prefixes.length)];
            const s = suffixes[Math.floor(Math.random() * suffixes.length)];
            let lowerQ = q.charAt(0).toLowerCase() + q.slice(1);
            if (p === '')
                lowerQ = q;
            faqs.push({ question: (p + lowerQ + s).trim(), answer: a, topic });
        }
    }
}
async function main() {
    console.log('Đang khởi tạo danh sách FAQs (' + faqs.length + ' kịch bản)...');
    let count = 0;
    for (const faq of faqs) {
        const exists = await prisma.fAQ.findFirst({ where: { question: faq.question } });
        if (!exists) {
            await prisma.fAQ.create({ data: { question: faq.question, answer: faq.answer, topic: faq.topic } });
            count++;
        }
    }
    console.log('Thành công! Đã thêm ' + count + ' kịch bản mới vào cơ sở dữ liệu.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-200-faqs.js.map