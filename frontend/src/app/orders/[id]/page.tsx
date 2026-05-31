"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { catalogApi, paymentApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Truck,
  ShieldCheck,
  Printer
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Price } from "@/components/ui/price";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => catalogApi.getOrderById(parseInt(id as string)),
  });

  const queryClient = useQueryClient();
  const completeMutation = useMutation({
    mutationFn: () => catalogApi.completeOrder(parseInt(id as string)),
    onSuccess: () => {
      toast.success("Đã xác nhận nhận hàng thành công. Bạn có thể đánh giá sản phẩm ngay bây giờ!");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xác nhận.");
    }
  });

  if (isLoading) return <OrderSkeleton />;
  if (isLoading) return <OrderSkeleton />;
  if (!order) return <div className="container mx-auto py-40 text-center font-extrabold text-2xl text-[#070f2b] animate-fade-in-up">Đơn hàng không tồn tại.</div>;

  return (
    <div className="min-h-screen bg-[#F9F9FF] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-10 text-gray-400 hover:text-blue-600 font-extrabold uppercase tracking-widest text-xs transition-all flex items-center gap-2 group"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Quay lại danh sách
        </Button>

        <div className="space-y-10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
              <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-extrabold text-[10px] uppercase tracking-widest">Xác nhận đơn hàng</div>
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-[#070f2b] tracking-tight uppercase leading-none">Đơn hàng <span className="text-blue-600 italic">#{order.id}</span></h1>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-2">
                      Đặt ngày {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
              </div>
              <div className="flex flex-wrap gap-4">
                  <Badge className={`rounded-full border-none font-extrabold uppercase tracking-widest text-[10px] px-6 h-12 flex items-center shadow-lg ${
                      order.status === "COMPLETED" ? "bg-green-500 text-white shadow-green-200" :
                      order.status === "CANCELLED" ? "bg-red-500 text-white shadow-red-200" :
                      "bg-amber-500 text-white shadow-amber-200"
                  }`}>
                      {getStatusLabel(order.status)}
                  </Badge>
                  {order.paymentStatus && (
                      <Badge className="bg-[#070f2b] text-white border-none rounded-full px-6 h-12 flex items-center font-extrabold uppercase text-[10px] gap-2 shadow-lg shadow-gray-200">
                          <CheckCircle2 className="h-4 w-4 text-blue-500" /> Đã thanh toán
                      </Badge>
                  )}
                  {!order.paymentStatus && order.paymentMethod !== "COD" && order.status !== "CANCELLED" && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full px-6 h-12 flex items-center font-extrabold uppercase text-[10px] gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 animate-pulse"
                      onClick={async () => {
                        try {
                           const { paymentUrl } = await paymentApi.createPaymentLink(order.id, order.paymentMethod);
                           router.push(paymentUrl);
                        } catch (err) {
                           toast.error("Không thể khởi tạo thanh toán.");
                        }
                      }}
                    >
                      <CreditCard className="h-4 w-4" /> Thanh toán ngay
                    </Button>
                  )}
                  {order.status === "SHIPPING" && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full px-6 h-12 flex items-center font-extrabold uppercase text-[10px] gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                      onClick={() => {
                        if (confirm("Xác nhận bạn đã nhận được hàng?")) {
                          completeMutation.mutate();
                        }
                      }}
                      disabled={completeMutation.isPending}
                    >
                      {completeMutation.isPending ? "Đang xử lý..." : "Xác nhận đã nhận hàng"}
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    className="rounded-full px-6 h-12 flex items-center font-extrabold uppercase text-[10px] gap-2 border-gray-200 text-gray-700 hover:bg-gray-100 transition-all shadow-sm print:hidden"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4" /> In hóa đơn
                  </Button>
              </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-200/30 p-8 flex flex-col items-center text-center gap-6 bg-white hover:translate-y-[-5px] transition-all duration-300">
                  <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Truck className="h-8 w-8" />
                  </div>
                  <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Vận chuyển</h3>
                      <p className="text-sm font-extrabold text-gray-900 leading-relaxed">{order.shippingAddress}</p>
                  </div>
              </Card>
              <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-200/30 p-8 flex flex-col items-center text-center gap-6 bg-white hover:translate-y-[-5px] transition-all duration-300">
                  <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                      <CreditCard className="h-8 w-8" />
                  </div>
                  <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Thanh toán</h3>
                      <p className="text-sm font-extrabold text-gray-900 leading-relaxed uppercase">{order.paymentMethod}</p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-2 italic">{order.paymentStatus ? "Giao dịch thành công" : "Đang chờ xác nhận"}</p>
                  </div>
              </Card>
              <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-200/30 p-8 flex flex-col items-center text-center gap-6 bg-white hover:translate-y-[-5px] transition-all duration-300">
                  <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                      <Clock className="h-8 w-8" />
                  </div>
                  <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Cập nhật</h3>
                      <p className="text-sm font-extrabold text-gray-900 leading-relaxed uppercase">{getStatusLabel(order.status)}</p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-2 italic">Lúc {new Date(order.updatedAt).toLocaleTimeString("vi-VN")}</p>
                  </div>
              </Card>
          </div>

          <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white p-10">
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                      <Package className="h-8 w-8 text-blue-500" /> Sản phẩm trong đơn
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                  <div className="grid gap-8">
                      {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center group">
                               <div className="flex items-center gap-6">
                                   <div className="h-20 w-20 rounded-[1.5rem] bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                       <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                   </div>
                                   <div>
                                       <p className="text-lg font-extrabold text-[#070f2b] group-hover:text-blue-600 transition-colors">{item.product?.name}</p>
                                       <div className="flex items-center gap-3 mt-1">
                                           <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">x{item.quantity}</span>
                                           <Separator orientation="vertical" className="h-3" />
                                           <Price amount={item.price} className="text-xs text-gray-400 font-bold" />
                                       </div>
                                   </div>
                               </div>
                               <Price amount={item.price * item.quantity} className="text-xl font-extrabold text-[#070f2b]" />
                          </div>
                      ))}
                  </div>

                  <Separator className="bg-gray-100" />

                  <div className="flex justify-between items-end">
                      <div className="space-y-4">
                          <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Xác thực bởi</p>
                              <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs bg-blue-50 px-4 py-2 rounded-xl w-fit">
                                  <ShieldCheck className="h-4 w-4" /> SmartShop Secure
                              </div>
                          </div>
                      </div>
                      <div className="text-right space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng giá trị đơn hàng</p>
                          <Price amount={order.totalAmount} className="text-5xl font-extrabold text-blue-600 tracking-tight" />
                      </div>
                  </div>
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING": return "Chờ xác nhận";
    case "CONFIRMED": return "Đã xác nhận";
    case "SHIPPING": return "Đang giao";
    case "COMPLETED": return "Hoàn thành";
    case "CANCELLED": return "Đã hủy";
    default: return status;
  }
}

function OrderSkeleton() {
  return (
    <div className="container mx-auto py-32 px-4 max-w-4xl space-y-8">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <Skeleton className="h-24 w-full rounded-[2rem]" />
      <div className="grid grid-cols-3 gap-8">
        <Skeleton className="h-32 rounded-[2rem]" />
        <Skeleton className="h-32 rounded-[2rem]" />
        <Skeleton className="h-32 rounded-[2rem]" />
      </div>
      <Skeleton className="h-96 w-full rounded-[2.5rem]" />
    </div>
  );
}
