import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';

// Định nghĩa interface cho row dữ liệu từ Excel
export interface ProductImportRow {
  name: string;
  price: number;
  description: string;
  stock: number;
  categoryId: number;
  images?: string;        // Phân cách bởi dấu '|' nếu có nhiều ảnh
  videoUrl?: string;
  isFlashSale?: boolean | string | number;
  flashSalePrice?: number;
  attributes?: string;   // JSON string
  sku?: string;          // Không dùng trong Product model, nhưng để tham khảo
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return this.prisma.product.create({ data });
  }

  async findAll(query: {
    category?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    take?: number;
    isFlashSale?: boolean | string;
  }) {
    const { category, search, minPrice, maxPrice, sortBy, sortOrder = 'desc', skip = 0, take = 10, isFlashSale } = query;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(category && { categoryId: category }),
      ...(isFlashSale !== undefined && { isFlashSale: isFlashSale === 'true' || isFlashSale === true }),
      ...(search && {
        AND: search.split(' ').filter(s => s.length > 0).map(word => ({
          name: { contains: word, mode: 'insensitive' },
        })),
      }),
      ...( (minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: { include: { user: true } } },
    });
  }

  async getRecommendations(id: number, limit: number = 4) {
    const sourceProduct = await this.prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });
    if (!sourceProduct) return [];
    
    return this.prisma.product.findMany({
      where: {
        categoryId: sourceProduct.categoryId,
        id: { not: id },
        isDeleted: false,
      },
      take: limit,
      orderBy: { soldCount: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        soldCount: true,
        isFlashSale: true,
        flashSalePrice: true,
        category: { select: { id: true, name: true } },
      }
    });
  }

  async update(id: number, data: Prisma.ProductUncheckedUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Trả về template Excel mẫu dưới dạng Buffer để tải xuống
   */
  generateExcelTemplate(): Buffer {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Hướng dẫn
    const guideData = [
      ['📋 HƯỚNG DẪN IMPORT SẢN PHẨM', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Cột', 'Bắt buộc', 'Kiểu dữ liệu', 'Mô tả', 'Ví dụ', '', '', '', '', ''],
      ['name', 'CÓ', 'Văn bản', 'Tên sản phẩm', 'iPhone 15 Pro Max 256GB', '', '', '', '', ''],
      ['price', 'CÓ', 'Số', 'Giá gốc (VNĐ)', '35990000', '', '', '', '', ''],
      ['description', 'CÓ', 'Văn bản', 'Mô tả chi tiết sản phẩm', 'iPhone 15 Pro Max màu Titan tự nhiên...', '', '', '', '', ''],
      ['stock', 'CÓ', 'Số nguyên', 'Số lượng tồn kho', '50', '', '', '', '', ''],
      ['categoryId', 'CÓ', 'Số nguyên', 'ID Danh mục (xem sheet "Danh mục")', '1', '', '', '', '', ''],
      ['images', 'KHÔNG', 'Văn bản', 'URL ảnh, nhiều ảnh cách nhau bằng "|"', 'https://url1.jpg|https://url2.jpg', '', '', '', '', ''],
      ['videoUrl', 'KHÔNG', 'Văn bản', 'URL video sản phẩm', 'https://youtube.com/...', '', '', '', '', ''],
      ['isFlashSale', 'KHÔNG', 'TRUE/FALSE', 'Có phải Flash Sale không? (TRUE/FALSE)', 'TRUE', '', '', '', '', ''],
      ['flashSalePrice', 'KHÔNG', 'Số', 'Giá Flash Sale (VNĐ, điền nếu isFlashSale=TRUE)', '29990000', '', '', '', '', ''],
      ['attributes', 'KHÔNG', 'JSON', 'Thuộc tính sản phẩm (định dạng JSON)', '{"brand":"Apple","color":"Đen"}', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['⚠️ LƯU Ý:', '', '', '', '', '', '', '', '', ''],
      ['- Không được để trống các cột bắt buộc (CÓ)', '', '', '', '', '', '', '', '', ''],
      ['- categoryId phải là một số ID hợp lệ trong hệ thống', '', '', '', '', '', '', '', '', ''],
      ['- Nếu isFlashSale = TRUE thì flashSalePrice không được để trống', '', '', '', '', '', '', '', '', ''],
      ['- attributes phải là chuỗi JSON hợp lệ hoặc để trống', '', '', '', '', '', '', '', '', ''],
    ];
    const guideSheet = XLSX.utils.aoa_to_sheet(guideData);
    guideSheet['!cols'] = [
      { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'Hướng dẫn');

    // Sheet 2: Dữ liệu sản phẩm (template)
    const headers = [
      'name', 'price', 'description', 'stock', 'categoryId',
      'images', 'videoUrl', 'isFlashSale', 'flashSalePrice', 'attributes'
    ];
    const sampleRows = [
      [
        'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
        35990000,
        'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP, màn hình 6.7 inch Super Retina XDR.',
        30,
        1,
        'https://picsum.photos/seed/iphone15/600/600|https://picsum.photos/seed/iphone15b/600/600',
        '',
        'FALSE',
        '',
        '{"brand":"Apple","color":"Titan Tự Nhiên","storage":"256GB","os":"iOS 17"}'
      ],
      [
        'Samsung Galaxy S24 Ultra 512GB',
        32990000,
        'Samsung Galaxy S24 Ultra với bút S-Pen, camera 200MP, màn hình 6.8 inch Dynamic AMOLED 2X.',
        25,
        1,
        'https://picsum.photos/seed/s24ultra/600/600',
        '',
        'TRUE',
        28990000,
        '{"brand":"Samsung","color":"Đen Phantom","storage":"512GB","os":"Android 14"}'
      ],
      [
        'Laptop ASUS ROG Zephyrus G14 2024',
        45990000,
        'Laptop gaming cao cấp với AMD Ryzen 9 8945H, RTX 4060, 16GB RAM, 1TB SSD.',
        15,
        2,
        'https://picsum.photos/seed/rogzephyrus/600/600',
        '',
        'FALSE',
        '',
        '{"brand":"ASUS","cpu":"AMD Ryzen 9 8945H","gpu":"RTX 4060","ram":"16GB","storage":"1TB SSD"}'
      ],
    ];

    const productData = [headers, ...sampleRows];
    const productSheet = XLSX.utils.aoa_to_sheet(productData);
    productSheet['!cols'] = [
      { wch: 40 }, { wch: 15 }, { wch: 60 }, { wch: 10 }, { wch: 12 },
      { wch: 50 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 50 },
    ];
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Dữ liệu sản phẩm');

    // Sheet 3: Danh sách danh mục (tra cứu)
    const categoryData = [
      ['ID Danh mục', 'Tên danh mục', 'Ghi chú'],
      ['(Xem trong Admin > Danh mục để lấy ID chính xác)', '', ''],
      ['Ví dụ phổ biến:', '', ''],
      [1, 'Điện thoại', 'Smartphone, điện thoại di động'],
      [2, 'Laptop', 'Laptop, máy tính xách tay'],
      [3, 'Âm thanh', 'Tai nghe, loa, microphone'],
      [4, 'Đồng hồ', 'Đồng hồ thông minh, đồng hồ cơ'],
      [5, 'Gia dụng', 'Đồ gia dụng thông minh'],
      ['...', '...', 'Kiểm tra trong hệ thống để lấy ID chính xác'],
    ];
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    categorySheet['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Danh mục tham khảo');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Import sản phẩm từ file Excel
   */
  async importFromExcel(fileBuffer: Buffer): Promise<{
    success: number;
    failed: number;
    errors: { row: number; error: string }[];
    imported: any[];
  }> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // Tìm sheet dữ liệu sản phẩm
    const sheetName = workbook.SheetNames.find(
      name => name === 'Dữ liệu sản phẩm' || name === 'Sheet1' || name === 'Products'
    ) || workbook.SheetNames[0];
    
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new BadRequestException('Không tìm thấy sheet dữ liệu trong file Excel');
    }

    const rows: ProductImportRow[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
    }) as ProductImportRow[];

    if (!rows || rows.length === 0) {
      throw new BadRequestException('File Excel không có dữ liệu hoặc format không đúng');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { row: number; error: string }[],
      imported: [] as any[],
    };

    // Lấy tất cả danh mục hợp lệ để validate
    const categories = await this.prisma.category.findMany({ select: { id: true, name: true } });
    const validCategoryIds = new Set(categories.map(c => c.id));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 vì dòng 1 là header

      try {
        // Validate các trường bắt buộc
        if (!row.name || String(row.name).trim() === '') {
          throw new Error('Trường "name" (Tên sản phẩm) không được để trống');
        }
        if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) {
          throw new Error('Trường "price" (Giá) phải là số dương hợp lệ');
        }
        if (!row.description || String(row.description).trim() === '') {
          throw new Error('Trường "description" (Mô tả) không được để trống');
        }
        if (row.stock === undefined || row.stock === null || row.stock === '' as any || isNaN(Number(row.stock))) {
          throw new Error('Trường "stock" (Tồn kho) phải là số nguyên');
        }
        if (!row.categoryId || isNaN(Number(row.categoryId))) {
          throw new Error('Trường "categoryId" (ID Danh mục) phải là số nguyên hợp lệ');
        }
        
        const categoryId = Number(row.categoryId);
        if (!validCategoryIds.has(categoryId)) {
          throw new Error(`categoryId=${categoryId} không tồn tại trong hệ thống. Danh mục hợp lệ: ${categories.map(c => `${c.id}(${c.name})`).join(', ')}`);
        }

        // Parse isFlashSale
        let isFlashSale = false;
        const isFlashRaw = String(row.isFlashSale || '').toUpperCase().trim();
        if (isFlashRaw === 'TRUE' || isFlashRaw === '1' || isFlashRaw === 'CÓ') {
          isFlashSale = true;
        }

        // Validate flashSalePrice nếu isFlashSale = true
        let flashSalePrice: number | null = null;
        if (isFlashSale) {
          if (!row.flashSalePrice || isNaN(Number(row.flashSalePrice)) || Number(row.flashSalePrice) <= 0) {
            throw new Error('Khi isFlashSale=TRUE thì "flashSalePrice" (Giá Flash Sale) phải là số dương hợp lệ');
          }
          flashSalePrice = Number(row.flashSalePrice);
          if (flashSalePrice >= Number(row.price)) {
            throw new Error('flashSalePrice phải nhỏ hơn price (giá gốc)');
          }
        }

        // Parse images (dạng URL phân cách bởi '|')
        const images: string[] = [];
        if (row.images && String(row.images).trim() !== '') {
          const imgList = String(row.images).split('|').map(s => s.trim()).filter(s => s !== '');
          images.push(...imgList);
        }

        // Parse attributes (JSON string)
        let attributes: any = undefined;
        if (row.attributes && String(row.attributes).trim() !== '') {
          try {
            attributes = JSON.parse(String(row.attributes));
          } catch {
            throw new Error(`Trường "attributes" không phải JSON hợp lệ: ${row.attributes}`);
          }
        }

        // Tạo sản phẩm
        const created = await (this.prisma.product.create as any)({
          data: {
            name: String(row.name).trim(),
            price: Number(row.price),
            description: String(row.description).trim(),
            stock: Math.floor(Number(row.stock)),
            categoryId,
            images,
            videoUrl: row.videoUrl ? String(row.videoUrl).trim() : null,
            isFlashSale,
            flashSalePrice,
            attributes: attributes || undefined,
          },
        });

        results.success++;
        results.imported.push({
          row: rowNum,
          id: created.id,
          name: created.name,
        });

      } catch (err: any) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          error: err.message || 'Lỗi không xác định',
        });
      }
    }

    return results;
  }
}
