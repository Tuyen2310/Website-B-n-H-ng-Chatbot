/**
 * SmartShop – Script Chạy Kiểm thử và Xuất Excel
 * 
 * Cách dùng:
 *   node run-tests.js
 *
 * Yêu cầu:
 *   npm install newman exceljs
 */

const newman = require('newman');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const collectionPath = path.join(__dirname, 'SmartShop_Postman_Collection.json');
const outputExcel = path.join(__dirname, 'SmartShop_TestReport.xlsx');

console.log('🚀 Bắt đầu chạy kiểm thử SmartShop AI...\n');

newman.run(
  {
    collection: require(collectionPath),
    reporters: ['cli'],
    reporter: { cli: { noSummary: false } },
  },
  async function (err, summary) {
    if (err) {
      console.error('❌ Lỗi khi chạy Newman:', err);
      process.exit(1);
    }

    // Thu thập dữ liệu từ console logs của các test case
    const testResults = [];

    summary.run.executions.forEach((execution) => {
      const requestName = execution.item.name;
      const response = execution.response;
      const assertions = execution.assertions || [];

      // Trích xuất thông tin từ tên request (ID test case)
      const matchId = requestName.match(/^(UT|IT|ST)-(\d+)/);
      const testId = matchId ? matchId[0] : requestName;

      // Xác định loại test
      let testType = 'Unknown';
      if (testId.startsWith('UT')) testType = 'Unit Test';
      else if (testId.startsWith('IT')) testType = 'Integration Test';
      else if (testId.startsWith('ST')) testType = 'System Test';

      // Tổng hợp kết quả assertion
      const failedAssertions = assertions.filter(a => a.error);
      const passed = failedAssertions.length === 0 && response && response.code < 400;

      // Trích xuất expected/actual từ console logs
      let expected = 'Xem Postman script';
      let actual = response
        ? `HTTP ${response.code} – ${response.responseTime}ms`
        : 'Không có response';

      testResults.push({
        id: testId,
        name: requestName.replace(/^(UT|IT|ST)-\d+\s*\|\s*/, ''),
        type: testType,
        method: execution.request ? execution.request.method : '',
        url: execution.request ? execution.request.url.toString() : '',
        expected: expected,
        actual: actual,
        responseCode: response ? response.code : 'N/A',
        responseTime: response ? response.responseTime + 'ms' : 'N/A',
        assertions: assertions.length,
        failedAssertions: failedAssertions.length,
        status: passed ? 'PASS' : 'FAIL',
        errors: failedAssertions.map(a => a.error.message).join('; '),
      });
    });

    console.log('\n📊 Đang tạo báo cáo Excel...');
    await generateExcel(testResults, summary);
    console.log(`✅ Báo cáo đã được lưu tại: ${outputExcel}`);
  }
);

async function generateExcel(testResults, summary) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SmartShop AI Test Suite';
  workbook.created = new Date();

  // ========================
  // Sheet 1: Kết quả chi tiết
  // ========================
  const sheet1 = workbook.addWorksheet('Kết quả Kiểm thử', {
    pageSetup: { fitToPage: true, fitToWidth: 1 },
  });

  // Tiêu đề chính
  sheet1.mergeCells('A1:K1');
  sheet1.getCell('A1').value = 'BÁO CÁO KIỂM THỬ HỆ THỐNG SMARTSHOP AI';
  sheet1.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  sheet1.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A8C' } };
  sheet1.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(1).height = 35;

  sheet1.mergeCells('A2:K2');
  sheet1.getCell('A2').value = `Ngày kiểm thử: ${new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}   |   Tổng: ${testResults.length} test case   |   Pass: ${testResults.filter(r=>r.status==='PASS').length}   |   Fail: ${testResults.filter(r=>r.status==='FAIL').length}`;
  sheet1.getCell('A2').font = { size: 11, color: { argb: 'FFFFFFFF' } };
  sheet1.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2952B3' } };
  sheet1.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(2).height = 25;

  // Header bảng
  const headers = [
    { header: 'Mã TC', key: 'id', width: 10 },
    { header: 'Tên Test Case', key: 'name', width: 38 },
    { header: 'Loại Kiểm thử', key: 'type', width: 18 },
    { header: 'Chức năng Kiểm thử', key: 'function', width: 36 },
    { header: 'Method', key: 'method', width: 10 },
    { header: 'Endpoint URL', key: 'url', width: 38 },
    { header: 'Kết quả Mong muốn', key: 'expected', width: 38 },
    { header: 'Kết quả Đạt được', key: 'actual', width: 38 },
    { header: 'Response Code', key: 'responseCode', width: 14 },
    { header: 'Thời gian', key: 'responseTime', width: 12 },
    { header: 'PASS / FAIL', key: 'status', width: 14 },
  ];

  sheet1.columns = headers;

  // Style header
  const headerRow = sheet1.getRow(3);
  headerRow.values = headers.map(h => h.header);
  headerRow.height = 30;
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B7280' } },
      bottom: { style: 'thin', color: { argb: 'FF6B7280' } },
      left: { style: 'thin', color: { argb: 'FF6B7280' } },
      right: { style: 'thin', color: { argb: 'FF6B7280' } },
    };
  });

  // Màu nền theo loại test
  const typeColors = {
    'Unit Test':        { bg: 'FFDBEAFE', text: 'FF1E40AF' }, // xanh dương nhạt
    'Integration Test': { bg: 'FFDCFCE7', text: 'FF166534' }, // xanh lá nhạt
    'System Test':      { bg: 'FFFEF9C3', text: 'FF854D0E' }, // vàng nhạt
  };

  // Điền dữ liệu
  const functionMap = {
    'UT-01': 'Xác thực người dùng (Login)',
    'UT-02': 'Xem danh sách sản phẩm (GET Products)',
    'UT-03': 'Xem danh mục sản phẩm (GET Categories)',
    'IT-01': 'Tích hợp Auth Module với User Module',
    'IT-02': 'Tích hợp Product Module với Category Module',
    'IT-03': 'Tích hợp Promotion Module với Order Module',
    'ST-01': 'Đặt hàng không cần đăng nhập (Guest Checkout)',
    'ST-02': 'Admin xem Dashboard (Login → Get Stats)',
    'ST-03': 'AI Chatbot tư vấn sản phẩm end-to-end',
  };

  const expectedMap = {
    'UT-01': 'HTTP 200 và access_token hợp lệ',
    'UT-02': 'HTTP 200, trả về mảng items và tổng số total',
    'UT-03': 'HTTP 200, trả về mảng danh mục không rỗng',
    'IT-01': 'HTTP 200, trả về thông tin user với email và role chính xác',
    'IT-02': 'HTTP 200, danh sách sản phẩm lọc đúng theo categoryId=1',
    'IT-03': 'HTTP 200 nếu mã hợp lệ; HTTP 404 nếu mã không tồn tại',
    'ST-01': 'HTTP 201, tạo đơn hàng mới với status PENDING',
    'ST-02': 'HTTP 200, trả về totalRevenue, totalOrders, totalProducts, totalUsers',
    'ST-03': 'HTTP 200, AI trả về câu trả lời không rỗng',
  };

  testResults.forEach((result, idx) => {
    const rowIndex = idx + 4;
    const row = sheet1.getRow(rowIndex);
    const colors = typeColors[result.type] || { bg: 'FFFFFFFF', text: 'FF000000' };

    row.values = [
      result.id,
      result.name,
      result.type,
      functionMap[result.id] || '',
      result.method,
      result.url,
      expectedMap[result.id] || result.expected,
      result.actual,
      result.responseCode,
      result.responseTime,
      result.status,
    ];
    row.height = 28;

    row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      cell.alignment = { vertical: 'middle', wrapText: true, horizontal: colIdx === 1 ? 'center' : 'left' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } };
      cell.font = { size: 10, color: { argb: colors.text } };
      cell.border = {
        top: { style: 'hair', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'hair', color: { argb: 'FFCBD5E1' } },
        left: { style: 'hair', color: { argb: 'FFCBD5E1' } },
        right: { style: 'hair', color: { argb: 'FFCBD5E1' } },
      };
    });

    // Style ô PASS/FAIL
    const statusCell = row.getCell(11);
    if (result.status === 'PASS') {
      statusCell.font = { bold: true, color: { argb: 'FF166534' }, size: 11 };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } };
    } else {
      statusCell.font = { bold: true, color: { argb: 'FF991B1B' }, size: 11 };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } };
    }
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Freeze header
  sheet1.views = [{ state: 'frozen', ySplit: 3 }];

  // ========================
  // Sheet 2: Tổng kết
  // ========================
  const sheet2 = workbook.addWorksheet('Tổng kết');

  sheet2.mergeCells('A1:D1');
  sheet2.getCell('A1').value = 'BẢNG TỔNG KẾT KIỂM THỬ';
  sheet2.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  sheet2.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A8C' } };
  sheet2.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet2.getRow(1).height = 30;
  sheet2.columns = [
    { key: 'a', width: 24 },
    { key: 'b', width: 18 },
    { key: 'c', width: 18 },
    { key: 'd', width: 18 },
  ];

  const summaryData = [
    ['Loại Kiểm thử', 'Tổng TC', 'Số PASS', 'Số FAIL'],
    ['Unit Test', 3, testResults.filter(r=>r.id.startsWith('UT')&&r.status==='PASS').length, testResults.filter(r=>r.id.startsWith('UT')&&r.status==='FAIL').length],
    ['Integration Test', 3, testResults.filter(r=>r.id.startsWith('IT')&&r.status==='PASS').length, testResults.filter(r=>r.id.startsWith('IT')&&r.status==='FAIL').length],
    ['System Test', 3, testResults.filter(r=>r.id.startsWith('ST')&&r.status==='PASS').length, testResults.filter(r=>r.id.startsWith('ST')&&r.status==='FAIL').length],
    ['TỔNG CỘNG', testResults.length, testResults.filter(r=>r.status==='PASS').length, testResults.filter(r=>r.status==='FAIL').length],
  ];

  summaryData.forEach((rowData, rIdx) => {
    const row = sheet2.getRow(rIdx + 2);
    row.values = rowData;
    row.height = 26;
    const isHeader = rIdx === 0;
    const isTotal = rIdx === summaryData.length - 1;
    row.eachCell(cell => {
      cell.font = { bold: isHeader || isTotal, size: 11, color: { argb: isHeader ? 'FFFFFFFF' : 'FF111827' } };
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: isHeader ? 'FF374151' : isTotal ? 'FFDBEAFE' : 'FFF9FAFB' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });
  });

  await workbook.xlsx.writeFile(outputExcel);
}
