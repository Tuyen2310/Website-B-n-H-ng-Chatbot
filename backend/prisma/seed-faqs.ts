import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultFaqs = [
  {
    question: 'Cửa hàng có hỗ trợ giao hàng miễn phí không?',
    answer: 'Dạ, chúng tôi áp dụng chính sách Freeship (giao hàng miễn phí) cho tất cả các đơn hàng có giá trị từ 200.000đ trở lên trên toàn quốc ạ.',
    topic: 'Giao hàng',
  },
  {
    question: 'Thời gian giao hàng mất bao lâu?',
    answer: 'Thời gian giao hàng dự kiến là từ 1-2 ngày đối với khu vực nội thành Hà Nội/TP.HCM và từ 3-5 ngày đối với các tỉnh thành khác.',
    topic: 'Giao hàng',
  },
  {
    question: 'Tôi có thể đổi trả hàng nếu không ưng ý không?',
    answer: 'Có ạ! Chúng tôi hỗ trợ đổi trả miễn phí trong vòng 30 ngày kể từ khi nhận hàng, với điều kiện sản phẩm còn nguyên tem mác và chưa qua sử dụng.',
    topic: 'Đổi trả',
  },
  {
    question: 'Làm thế nào để áp dụng mã giảm giá?',
    answer: 'Quý khách vui lòng thêm sản phẩm vào giỏ hàng, sau đó tại bước Thanh toán, nhập mã giảm giá vào ô "Mã khuyến mãi" và nhấn Áp dụng.',
    topic: 'Thanh toán',
  },
  {
    question: 'Tôi có thể thanh toán bằng những hình thức nào?',
    answer: 'Dạ, hiện tại chúng tôi hỗ trợ các hình thức: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng, VNPay và Ví MoMo.',
    topic: 'Thanh toán',
  },
  {
    question: 'Sản phẩm có được bảo hành không?',
    answer: 'Tất cả các sản phẩm điện tử đều được bảo hành chính hãng 12 tháng. Các sản phẩm khác áp dụng theo chính sách bảo hành đi kèm trong hộp sản phẩm.',
    topic: 'Bảo hành',
  },
  {
    question: 'Làm sao để biết sản phẩm còn hàng hay hết hàng?',
    answer: 'Trạng thái tồn kho được cập nhật trực tiếp trên trang chi tiết sản phẩm. Nếu nút "Thêm vào giỏ" sáng lên nghĩa là sản phẩm còn hàng.',
    topic: 'Sản phẩm',
  },
  {
    question: 'Shop có hỗ trợ xuất hóa đơn VAT không?',
    answer: 'Có ạ! Quý khách có thể yêu cầu xuất hóa đơn VAT ở bước thanh toán bằng cách điền thông tin công ty và mã số thuế.',
    topic: 'Khác',
  },
  {
    question: 'Tôi quên mật khẩu tài khoản thì phải làm sao?',
    answer: 'Quý khách vui lòng nhấn vào "Quên mật khẩu" ở trang Đăng nhập, nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu mới.',
    topic: 'Khác',
  },
  {
    question: 'Làm thế nào để tôi có thể liên hệ với nhân viên hỗ trợ trực tiếp?',
    answer: 'Quý khách có thể gọi đến Hotline: 0988.123.456 hoặc gửi email về support@commercepro.vn. Nhân viên của chúng tôi sẽ hỗ trợ 24/7.',
    topic: 'Khác',
  }
];

async function main() {
  console.log('Bắt đầu thêm dữ liệu FAQs...');
  
  let count = 0;
  for (const faq of defaultFaqs) {
    const exists = await prisma.fAQ.findFirst({
      where: { question: faq.question }
    });
    
    if (!exists) {
      await prisma.fAQ.create({
        data: faq
      });
      count++;
      console.log(`Đã thêm FAQ: "${faq.question}"`);
    }
  }

  console.log(`Hoàn thành! Đã thêm mới ${count} câu hỏi FAQ vào cơ sở dữ liệu.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
