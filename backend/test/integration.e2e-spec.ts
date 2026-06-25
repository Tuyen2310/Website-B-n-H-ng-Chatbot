import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Integration Tests (e2e) cho 5 chức năng', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let createdProductId: number;
  let orderId: number;
  let testCategoryId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // 1. Đăng nhập Admin để lấy Token
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@smartshop.com', password: 'admin123' });

    if (adminRes.status === 201) {
      adminToken = adminRes.body.access_token;
    }

    // 2. Đăng nhập User để lấy Token
    const userRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'user123' });

    if (userRes.status === 201) {
      userToken = userRes.body.access_token;
    }

    // Lấy ID danh mục đầu tiên để tạo sản phẩm
    const categoryRes = await request(app.getHttpServer()).get('/categories');
    if (categoryRes.status === 200 && categoryRes.body.length > 0) {
      testCategoryId = categoryRes.body[0].id;
    } else {
      testCategoryId = 1;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // ==========================================
  // TEST 1: Thêm sản phẩm (AddProduct)
  // ==========================================
  it('1. AddProduct: Admin có thể thêm sản phẩm mới', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sản phẩm Test Integration',
        price: 150000,
        description: 'Mô tả sản phẩm test',
        stock: 10,
        categoryId: testCategoryId,
        images: ['https://example.com/image.jpg']
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Sản phẩm Test Integration');
    createdProductId = res.body.id;
  });

  // ==========================================
  // TEST 2: Cập nhật sản phẩm (UpdateProduct)
  // ==========================================
  it('2. UpdateProduct: Admin có thể cập nhật thông tin sản phẩm', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        price: 120000,
        stock: 20
      });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(120000);
    expect(res.body.stock).toBe(20);
  });

  // ==========================================
  // TEST 3: Tìm kiếm sản phẩm (SearchProducts)
  // ==========================================
  it('3. SearchProducts: Tìm kiếm trả về kết quả chính xác', async () => {
    const res = await request(app.getHttpServer())
      .get('/products')
      .query({ search: 'Test Integration' });

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);

    const foundProduct = res.body.items.find((p: any) => p.id === createdProductId);
    expect(foundProduct).toBeDefined();
    expect(foundProduct.name).toContain('Test Integration');
  });

  // ==========================================
  // TEST 4: Đặt hàng (CreateOrder)
  // ==========================================
  it('4. CreateOrder: User có thể tạo đơn hàng mua sản phẩm', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [
          { productId: createdProductId, quantity: 2 }
        ],
        paymentMethod: 'COD',
        shippingAddress: '123 Đường Test, Hà Nội',
        shippingProvince: 'Hà Nội'
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.totalAmount).toBe(120000 * 2 + 20000); // 2 sản phẩm * 120k + 20k phí ship Hà Nội
    orderId = res.body.id;
  });

  // ==========================================
  // TEST 5: Xóa sản phẩm (DeleteProduct)
  // ==========================================
  it('5. DeleteProduct: Xóa mềm sản phẩm đã có đơn hàng', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // Xác nhận sản phẩm bị "Xóa mềm" (isDeleted = true)
    const checkRes = await request(app.getHttpServer())
      .get(`/products/${createdProductId}`);

    expect(checkRes.status).toBe(200);
    expect(checkRes.body.isDeleted).toBe(true);
  });
  // ==========================================
  // TEST 6: Đăng ký tài khoản (Register)
  // ==========================================
  it('6. Register: Người dùng có thể đăng ký tài khoản mới', async () => {
    const randomEmail = `test_user_${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: randomEmail,
        password: 'password123',
        fullName: 'Test User'
      });

    // Check if created successfully
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(randomEmail);
    expect(res.body.access_token).toBeDefined();
  });

  // ==========================================
  // TEST 7: Giỏ hàng / Mua hàng số lượng lớn (Cart)
  // ==========================================
  it('7. Cart/Order: Checkout giỏ hàng với nhiều sản phẩm', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [
          { productId: createdProductId, quantity: 3 },
          { productId: createdProductId, quantity: 2 }
        ],
        paymentMethod: 'VNPAY',
        shippingAddress: '456 Test Blvd, HCM',
        shippingProvince: 'Hồ Chí Minh'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
    // It should sum up properly
    expect(res.body.items).toBeDefined();
  });

  // ==========================================
  // TEST 8: Thống kê & Báo cáo (Reports)
  // ==========================================
  it('8. Reports: Admin có thể lấy dữ liệu thống kê Dashboard', async () => {
    const res = await request(app.getHttpServer())
      .get('/reports/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    // Assuming the reports endpoint returns an object with total revenue, etc.
    expect(res.status).toBe(200);
    expect(res.body.totalRevenue).toBeDefined();
    expect(res.body.totalOrders).toBeDefined();
    expect(res.body.totalUsers).toBeDefined();
  });

  // ==========================================
  // TEST 9: Chatbot AI (Chatbot)
  // ==========================================
  it('9. Chatbot: Gửi tin nhắn và nhận phản hồi từ Chatbot', async () => {
    const res = await request(app.getHttpServer())
      .post('/chatbot/chat')
      .send({
        userId: 'test_user_id',
        message: 'Xin chào, bạn có bán điện thoại không?'
      });

    expect(res.status).toBe(201);
    expect(res.body.response).toBeDefined();
    expect(typeof res.body.response).toBe('string');
  });
});
