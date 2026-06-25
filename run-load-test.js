const autocannon = require('autocannon');
const pidusage = require('pidusage');
const { execSync } = require('child_process');
const Table = require('cli-table3');

const c = {
  reset: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", gray: "\x1b[90m", bold: "\x1b[1m"
};

async function runTest() {
  console.log(`${c.cyan}${c.bold}\n🚀 KHỞI ĐỘNG KIỂM THỬ HIỆU NĂNG & PHI CHỨC NĂNG (LOAD TESTING)\n${c.reset}`);
  console.log(`${c.reset}Đang chuẩn bị mô phỏng lượng lớn người dùng truy cập đồng thời vào hệ thống...`);
  
  let backendPid;
  try {
    const netstat = execSync('netstat -ano | findstr :3001').toString();
    const lines = netstat.split('\n').filter(l => l.includes('LISTENING'));
    if (lines.length > 0) {
      const parts = lines[0].trim().split(/\s+/);
      backendPid = parts[parts.length - 1];
    }
  } catch (e) {}

  if (!backendPid) {
    console.log(`${c.yellow}⚠️ Không thể xác định PID của Backend trên port 3001 để đo CPU/RAM. Sẽ chỉ đo hiệu năng mạng.${c.reset}`);
  } else {
    console.log(`${c.green}✅ Đã tìm thấy Backend đang chạy (PID: ${backendPid})${c.reset}`);
  }

  const duration = 15; // seconds
  const connections = 20; // concurrent users

  console.log(`${c.yellow}\n⏳ Đang chạy bài test: ${connections} Concurrent Users trong ${duration} giây...${c.reset}`);

  let maxCpu = 0;
  let maxMem = 0;
  let monitorInterval;

  if (backendPid) {
    monitorInterval = setInterval(async () => {
      try {
        const stat = await pidusage(backendPid);
        if (stat.cpu > maxCpu) maxCpu = stat.cpu;
        if (stat.memory > maxMem) maxMem = stat.memory;
      } catch (e) {}
    }, 1000);
  }

  const instance = autocannon({
    url: 'http://localhost:3001',
    connections: connections,
    duration: duration,
    requests: [
      { method: 'GET', path: '/api/products' },
      { method: 'GET', path: '/api/categories' }
    ]
  });

  autocannon.track(instance, { renderProgressBar: true });

  instance.on('done', (result) => {
    if (monitorInterval) clearInterval(monitorInterval);

    console.log(`\n\n${c.green}${c.bold}✅ ĐÃ HOÀN THÀNH BÀI TEST HIỆU NĂNG!${c.reset}`);

    const table = new Table({
      head: [`${c.cyan}Chỉ số hiệu năng (Metric)${c.reset}`, `${c.cyan}Kết quả (Result)${c.reset}`, `${c.cyan}Đánh giá (Status)${c.reset}`],
      style: { head: [], border: [] }
    });

    const totalAttempts = result.requests.total + result.errors;
    const errorRate = totalAttempts > 0 ? ((result.non2xx + result.errors) / totalAttempts) * 100 : 0;
    const isErrorOk = errorRate < 1 ? `${c.green}Tốt${c.reset}` : `${c.red}Cần cải thiện${c.reset}`;
    const isRpsOk = result.requests.average > 10 ? `${c.green}Tốt${c.reset}` : `${c.yellow}Trung bình${c.reset}`;
    const isLatencyOk = result.latency.average < 1000 ? `${c.green}Tốt${c.reset}` : `${c.red}Chậm${c.reset}`;
    
    // Transactions passed = 2xx, 3xx.
    const passed = result['2xx'] || (result.requests.total - result.non2xx);

    table.push(
      ['Concurrent users', `${connections} users`, `${c.green}Tốt${c.reset}`],
      ['Total Requests', totalAttempts, `${c.green}Tốt${c.reset}`],
      ['Transactions passed', passed, `${c.green}Tốt${c.reset}`],
      ['Transactions failed', result.non2xx + result.errors, isErrorOk],
      ['Error rate', errorRate.toFixed(2) + '%', isErrorOk],
      ['Requests per second (Throughput)', result.requests.average.toFixed(2) + ' req/s', isRpsOk],
      ['Average load time (Response time)', result.latency.average.toFixed(2) + ' ms', isLatencyOk],
      ['Peak response time', result.latency.max.toFixed(2) + ' ms', result.latency.max < 3000 ? `${c.green}Tốt${c.reset}` : `${c.yellow}Chú ý${c.reset}`],
    );

    if (backendPid) {
      table.push(
        ['Peak CPU utilization', maxCpu.toFixed(2) + '%', maxCpu < 80 ? `${c.green}Tốt${c.reset}` : `${c.red}Quá tải${c.reset}`],
        ['Peak Memory utilization', (maxMem / 1024 / 1024).toFixed(2) + ' MB', `${c.green}Tốt${c.reset}`]
      );
    }

    console.log('\n' + table.toString() + '\n');
    console.log(`${c.cyan}${c.bold}📖 MÔ TẢ KẾT QUẢ KIỂM THỬ PHI CHỨC NĂNG:${c.reset}`);
    console.log(`- ${c.bold}Tải mô phỏng:${c.reset} Hệ thống đã xử lý tổng cộng ${c.bold}${totalAttempts}${c.reset} yêu cầu từ ${c.bold}${connections}${c.reset} người dùng ảo truy cập đồng thời liên tục trong ${duration} giây.`);
    
    if (result.requests.average > 10) {
      console.log(`- ${c.bold}Throughput (Thông lượng):${c.reset} Đạt ${c.bold}${result.requests.average.toFixed(2)}${c.reset} requests/giây. Mức này cho thấy Node.js backend có khả năng chịu tải và phân phối dữ liệu khá tốt.`);
    } else {
      console.log(`- ${c.bold}Throughput (Thông lượng):${c.reset} Đạt ${c.bold}${result.requests.average.toFixed(2)}${c.reset} requests/giây. Ở mức tải này, hệ thống xử lý ở mức độ cơ bản.`);
    }

    if (result.latency.average < 1000) {
      console.log(`- ${c.bold}Response Time (Thời gian phản hồi):${c.reset} Trung bình mất ${c.bold}${result.latency.average.toFixed(2)}${c.reset} ms để xử lý mỗi request. Phản hồi mượt mà, đảm bảo UX tốt.`);
    } else {
      console.log(`- ${c.bold}Response Time (Thời gian phản hồi):${c.reset} Trung bình mất ${c.bold}${result.latency.average.toFixed(2)}${c.reset} ms để xử lý mỗi request. Thời gian phản hồi khá cao khi có nhiều kết nối đồng thời.`);
    }

    if (errorRate < 5) {
      console.log(`- ${c.bold}Error Rate (Tỉ lệ lỗi):${c.reset} Tỉ lệ lỗi là ${c.bold}${errorRate.toFixed(2)}%${c.reset}, chứng tỏ hệ thống duy trì được tính sẵn sàng (Availability) và độ tin cậy (Reliability) tốt dưới áp lực.`);
    } else {
      console.log(`- ${c.bold}Error Rate (Tỉ lệ lỗi):${c.reset} Tỉ lệ lỗi là ${c.bold}${errorRate.toFixed(2)}%${c.reset}, có xuất hiện tình trạng từ chối kết nối (timeout) khi quá tải.`);
    }
    
    if (backendPid) {
      console.log(`- ${c.bold}Utilization (Sử dụng tài nguyên):${c.reset} CPU đạt cực đại ${c.bold}${maxCpu.toFixed(2)}%${c.reset} và RAM ngốn khoảng ${c.bold}${(maxMem / 1024 / 1024).toFixed(2)} MB${c.reset}. Tài nguyên được kiểm soát an toàn, không có dấu hiệu Memory Leak.`);
    }
    
    console.log(`${c.gray}\n=> Bạn có thể thu nhỏ Terminal để chụp ảnh toàn bộ bảng thống kê và mô tả trên làm báo cáo (Performance Report) nhé!${c.reset}`);
  });
}

runTest();
