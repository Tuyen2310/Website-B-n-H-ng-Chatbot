"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSettingsStore } from "@/store/settingsStore";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft, QrCode, Building, CreditCard, User, AlertCircle } from "lucide-react";
import { Price } from "@/components/ui/price";

function PaymentGatewayInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { publicSettings } = useSettingsStore();

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const method = searchParams.get("method");
  const amount = searchParams.get("amount");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!orderId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FF]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black text-[#070f2b]">Liên kết thanh toán không hợp lệ</h1>
          <Button onClick={() => router.push("/")} variant="outline">Về trang chủ</Button>
        </div>
      </div>
    );
  }

  const paymentConfig = publicSettings?.payment;
  const isBankEnabled = paymentConfig?.bankEnabled && paymentConfig?.bankId && paymentConfig?.accountNo;

  return (
    <div className="min-h-screen bg-[#F9F9FF] pt-32 pb-20 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl animate-fade-in-up">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-2 shadow-lg shadow-blue-100">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#070f2b]">Cổng thanh toán an toàn</h1>
          <p className="text-gray-500 font-medium">SmartShop Secure Payment Gateway</p>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-blue-900/5 bg-white overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Mã giao dịch</h2>
            <p className="text-xl font-mono font-black">{paymentId || `ORD-${orderId}`}</p>
          </div>
          
          <CardContent className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tổng thanh toán</p>
              <Price amount={Number(amount)} className="text-5xl font-black text-blue-600" />
            </div>

            {isBankEnabled ? (
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-6">
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100">
                    <img 
                      src={`https://img.vietqr.io/image/${paymentConfig.bankId}-${paymentConfig.accountNo}-compact2.jpg?amount=${amount}&accountName=${encodeURIComponent(paymentConfig.accountName || '')}&addInfo=${encodeURIComponent('Thanh toan don hang ' + orderId)}`}
                      alt="VietQR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Ngân hàng</p>
                      <p className="text-sm font-extrabold text-[#070f2b]">{paymentConfig.bankId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Số tài khoản</p>
                      <p className="text-lg font-black font-mono tracking-wider text-blue-600">{paymentConfig.accountNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Chủ tài khoản</p>
                      <p className="text-sm font-extrabold text-[#070f2b] uppercase">{paymentConfig.accountName}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <p className="text-xs text-yellow-800 font-medium">
                    * Vui lòng chuyển đúng số tiền và ghi chú: <br/>
                    <strong className="font-black text-sm">Thanh toan don hang {orderId}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-600">Hệ thống chưa cấu hình tài khoản ngân hàng. Vui lòng liên hệ Admin.</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-8 pt-0 flex flex-col gap-3">
            <Button 
              className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/20 flex items-center gap-2"
              onClick={async () => {
                if (!paymentId) return;
                try {
                  // Import and use paymentApi dynamically to avoid top-level import circular dependencies if any, or just import it at top.
                  // Actually since we are in page.tsx, we can just import paymentApi.
                  // Wait, I should add import { paymentApi } from "@/lib/api"; at the top, or just use it if it's already there. Let me check if it's imported.
                  // If not, I'll just use the same logic but dynamically import to be safe, or just import at the top. Let's look at line 122.
                  const { paymentApi } = await import('@/lib/api');
                  await paymentApi.mockWebhook(paymentId, 'SUCCESS');
                  alert('Thanh toán thành công! Trạng thái đơn hàng đã được cập nhật.');
                  router.push(`/orders/${orderId}`);
                } catch (err) {
                  console.error(err);
                  alert('Có lỗi xảy ra khi giả lập thanh toán.');
                }
              }}
            >
              <ShieldCheck className="h-5 w-5" /> Giả lập Thanh toán thành công
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-14 rounded-2xl text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50"
              onClick={() => router.push(`/orders/${orderId}`)}
            >
              Quay lại chi tiết đơn hàng
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-center text-[10px] font-bold text-gray-400 mt-8 uppercase tracking-widest">
          Giao dịch được mã hóa và bảo mật bởi SmartShop System
        </p>
      </div>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F9F9FF]">Đang tải...</div>}>
      <PaymentGatewayInner />
    </Suspense>
  );
}
