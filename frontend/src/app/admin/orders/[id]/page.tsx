"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi, adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Package,
  User,
  MapPin,
  CreditCard,
  History,
  AlertCircle,
  Printer
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => catalogApi.getOrderById(Number(id)),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateOrderStatus(Number(id), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Đã cập nhật trạng thái đơn hàng.");
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật.")
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (paymentStatus: boolean) => adminApi.updatePaymentStatus(Number(id), paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Đã cập nhật trạng thái thanh toán.");
    }
  });

  if (isLoading) return <OrderDetailSkeleton />;
  if (!order) return <div className="p-20 text-center">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-12 w-12 bg-white shadow-sm border border-gray-100"
            onClick={() => router.push("/admin/orders")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Chi tiết đơn hàng #{id}</h1>
            <p className="text-gray-400 font-medium italic">
              Đặt ngày {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {order.status === 'PENDING' && (
            <Button 
              className="rounded-xl h-12 px-6 font-black bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-100"
              onClick={() => updateStatusMutation.mutate('CONFIRMED')}
            >
              <CheckCircle2 className="h-4 w-4" /> Xác nhận đơn
            </Button>
          )}
          {order.status === 'CONFIRMED' && (
            <Button 
              className="rounded-xl h-12 px-6 font-black bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-100"
              onClick={() => updateStatusMutation.mutate('SHIPPING')}
            >
              <Truck className="h-4 w-4" /> Bắt đầu giao hàng
            </Button>
          )}
          {order.status === 'SHIPPING' && (
            <Button 
              className="rounded-xl h-12 px-6 font-black bg-green-600 hover:bg-green-700 gap-2 shadow-lg shadow-green-100"
              onClick={() => updateStatusMutation.mutate('COMPLETED')}
            >
              <CheckCircle2 className="h-4 w-4" /> Hoàn tất đơn
            </Button>
          )}
          {(order.status !== 'COMPLETED' && order.status !== 'CANCELLED') && (
            <Button 
              variant="outline"
              className="rounded-xl h-12 px-6 font-bold text-red-500 border-red-100 hover:bg-red-50 hidden print:hidden"
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                    updateStatusMutation.mutate('CANCELLED');
                }
              }}
            >
              <XCircle className="h-4 w-4 mr-2" /> Hủy đơn
            </Button>
          )}
          <Button 
            variant="outline"
            className="rounded-xl h-12 px-6 font-bold text-gray-700 border-gray-200 hover:bg-gray-100 print:hidden shadow-sm"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" /> In hóa đơn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Items & Payment */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" /> Sản phẩm trong đơn
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="space-y-6">
                    {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                                    <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-lg">{item.product?.name}</p>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        Đơn giá: ${item.price.toLocaleString()} — Số lượng: {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                    <Separator className="bg-gray-100 my-8" />
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-gray-500 font-bold">
                            <span>Tạm tính</span>
                            <span>${order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500 font-bold">
                            <span>Phí vận chuyển</span>
                            <span className="text-green-600">Miễn phí</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <span className="text-xl font-black text-gray-900 uppercase tracking-tighter">Tổng cộng</span>
                            <span className="text-3xl font-black text-primary tracking-tighter">${order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> Thanh toán
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${order.paymentStatus ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 uppercase text-xs tracking-widest">Phương thức: {order.paymentMethod}</p>
                            <p className={`text-sm font-bold ${order.paymentStatus ? 'text-green-600' : 'text-orange-600'}`}>
                                {order.paymentStatus ? 'Đã xác nhận thanh toán' : 'Đang chờ xử lý'}
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        className="rounded-xl font-black text-xs uppercase tracking-widest border-gray-200"
                        onClick={() => updatePaymentMutation.mutate(!order.paymentStatus)}
                    >
                        Đổi trạng thái
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Customer & Tracking */}
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Khách hàng
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
                        {order.user?.name?.[0]}
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-lg">{order.user?.name}</p>
                        <p className="text-xs text-gray-400 font-bold">{order.user?.email}</p>
                    </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">{order.shippingAddress}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">{order.user?.phone || "Chưa có số điện thoại"}</span>
                    </div>
                </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Trạng thái hiện tại
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${getStatusColor(order.status)}`}>
                             <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Trạng thái vận chuyển</p>
                            <p className="text-base font-black text-primary">{getStatusLabel(order.status)}</p>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                        <p className="text-xs font-bold text-blue-900 leading-relaxed uppercase tracking-widest mb-1">Ghi chú vận chuyển</p>
                        <p className="text-sm text-blue-700 font-medium italic">Sản phẩm đang được kiểm tra lần cuối trước khi đóng gói.</p>
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
    case "SHIPPING": return "Đang giao hàng";
    case "COMPLETED": return "Đã hoàn thành";
    case "CANCELLED": return "Đã hủy";
    default: return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING": return "bg-orange-100 text-orange-600";
    case "CONFIRMED": return "bg-blue-100 text-blue-600";
    case "SHIPPING": return "bg-indigo-100 text-indigo-600";
    case "COMPLETED": return "bg-green-100 text-green-600";
    case "CANCELLED": return "bg-red-100 text-red-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

function OrderDetailSkeleton() {
    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            <Skeleton className="h-20 w-1/2 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="h-[600px] lg:col-span-2 rounded-[2.5rem]" />
                <div className="space-y-8">
                    <Skeleton className="h-40 w-full rounded-[2.5rem]" />
                    <Skeleton className="h-40 w-full rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
}
