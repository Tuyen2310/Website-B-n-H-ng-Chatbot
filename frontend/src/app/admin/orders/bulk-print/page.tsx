"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";

function BulkPrintContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "ALL";
  const payment = searchParams.get("payment") || "ALL";
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";
  const search = searchParams.get("search") || "";

  const [shouldPrint, setShouldPrint] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders-bulk"],
    queryFn: () => adminApi.getOrders({
      skip: 0,
      take: 10000, // Fetch a large chunk for bulk print
    }),
  });

  const orders = data?.items || [];

  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch = o.id.toString().includes(search) || o.user?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "ALL" || o.status === status;
    const matchesPayment = payment === "ALL" || (payment === "PAID" ? o.paymentStatus : !o.paymentStatus);
    const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
    const matchesDate = (!start || orderDate >= start) && (!end || orderDate <= end);
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  useEffect(() => {
    if (!isLoading && filteredOrders.length > 0) {
      // Small delay to ensure images/fonts are loaded before printing
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, filteredOrders]);

  if (isLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 print:hidden">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="font-bold">Đang tải dữ liệu in hóa đơn...</p>
        </div>
    );
  }

  if (filteredOrders.length === 0) {
      return (
          <div className="p-20 text-center font-bold text-gray-500 print:hidden">
              Không có đơn hàng nào khớp với bộ lọc để in.
              <br />
              <button onClick={() => window.close()} className="mt-4 text-blue-500 underline">Đóng trang</button>
          </div>
      );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden p-4 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-center font-bold shadow-sm">
        Đang chuẩn bị {filteredOrders.length} hóa đơn để in. Hộp thoại in sẽ tự động mở...
        <button onClick={() => window.print()} className="ml-4 underline text-blue-600">In ngay</button>
        <button onClick={() => window.close()} className="ml-4 underline text-gray-500">Đóng</button>
      </div>

      <div className="print:p-0 p-8 max-w-[800px] mx-auto">
        {filteredOrders.map((order: any, index: number) => (
          <div 
            key={order.id} 
            className={`w-full bg-white text-black font-sans ${index < filteredOrders.length - 1 ? 'break-after-page mb-20 print:mb-0 border-b-8 border-gray-200 print:border-none pb-20 print:pb-0' : ''}`}
          >
            <div className="text-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase mb-2">HÓA ĐƠN MUA HÀNG</h1>
                <p className="text-sm font-bold">Mã đơn: #{order.id}</p>
                <p className="text-sm">Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            
            <div className="mb-8 flex justify-between">
                <div className="w-1/2">
                    <h3 className="font-bold uppercase border-b border-black inline-block mb-2 text-sm">Khách hàng</h3>
                    <p className="font-bold text-lg">{order.user?.name}</p>
                    <p><strong>Điện thoại:</strong> {order.user?.phone || "N/A"}</p>
                    <p><strong>Email:</strong> {order.user?.email || "N/A"}</p>
                </div>
                <div className="w-1/2">
                    <h3 className="font-bold uppercase border-b border-black inline-block mb-2 text-sm">Giao hàng & Thanh toán</h3>
                    <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
                    <p><strong>Thanh toán:</strong> {order.paymentMethod} - {order.paymentStatus ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                </div>
            </div>

            <table className="w-full text-left border-collapse mb-8">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2 uppercase text-xs font-bold w-[50%]">Sản phẩm</th>
                        <th className="py-2 uppercase text-xs font-bold text-center">Số lượng</th>
                        <th className="py-2 uppercase text-xs font-bold text-right">Đơn giá</th>
                        <th className="py-2 uppercase text-xs font-bold text-right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-300">
                            <td className="py-3 pr-4">{item.product?.name}</td>
                            <td className="py-3 text-center">{item.quantity}</td>
                            <td className="py-3 text-right">${item.price.toLocaleString()}</td>
                            <td className="py-3 text-right">${(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end text-lg mt-8">
                <div className="w-72 border-t-2 border-black pt-2">
                    <div className="flex justify-between font-black text-xl">
                        <span className="uppercase">Tổng cộng:</span>
                        <span>${order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="mt-16 pt-8 text-center border-t border-gray-300">
                <p className="italic font-bold text-gray-800">Cảm ơn quý khách đã mua sắm tại cửa hàng!</p>
                <p className="text-xs text-gray-500 mt-1">Xin vui lòng giữ lại hóa đơn để phục vụ cho việc bảo hành, đổi trả.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BulkPrintPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold">Đang tải cấu hình...</div>}>
            <BulkPrintContent />
        </Suspense>
    );
}
