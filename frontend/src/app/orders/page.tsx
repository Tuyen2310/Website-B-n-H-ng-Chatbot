"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Calendar,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Price } from "@/components/ui/price";

const STATUS_TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ xác nhận" },
  { id: "CONFIRMED", label: "Chờ lấy hàng" },
  { id: "SHIPPING", label: "Đang giao" },
  { id: "COMPLETED", label: "Hoàn thành" },
  { id: "CANCELLED", label: "Đã hủy" },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
        router.push("/login?redirect=/orders");
    }
  }, [mounted, isAuthenticated, router]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => catalogApi.getMyOrders(),
    enabled: !!isAuthenticated
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => catalogApi.cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng thành công.");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng.");
    }
  });

  if (!mounted || !isAuthenticated) return null;

  const orderList = Array.isArray(orders) ? orders : (orders?.items || []);
  const filteredOrders = activeTab === "ALL" 
    ? orderList 
    : orderList.filter((o: any) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-[#F9F9FF] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col gap-8 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-blue-600 font-extrabold text-xs uppercase tracking-widest mb-4">
              <ShoppingBag className="h-4 w-4" /> Lịch sử mua hàng
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#070f2b] tracking-tight uppercase leading-none">Quản lý <span className="text-blue-600 italic">đơn hàng.</span></h1>
            <p className="text-gray-500 font-semibold text-base max-w-xl">Theo dõi tình trạng vận chuyển và lịch sử mua sắm của bạn một cách trực quan và hiện đại.</p>
          </div>

          <Tabs defaultValue="ALL" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-white p-1.5 rounded-[2rem] h-auto border border-gray-150 shadow-xl shadow-gray-200/40 w-full flex flex-wrap md:grid md:grid-cols-6 overflow-hidden">
              {STATUS_TABS.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="rounded-[1.5rem] py-4 font-extrabold text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300 flex-1"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-12 space-y-8 outline-none">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />
                ))
              ) : filteredOrders?.length > 0 ? (
                filteredOrders.map((order: any) => (
                  <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/30 overflow-hidden hover:scale-[1.01] transition-all duration-300 group">
                    {/* Header đơn hàng */}
                    <div className="bg-gray-50/80 px-10 py-6 flex flex-wrap items-center justify-between gap-6 border-b border-gray-100">
                      <div className="flex items-center gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn hàng</p>
                          <span className="text-lg font-extrabold text-[#070f2b]">#{order.id}</span>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày đặt</p>
                          <div className="flex items-center gap-2 text-sm font-extrabold text-[#070f2b]">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                          {getStatusIcon(order.status)}
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <Badge className={`rounded-full border-none font-black uppercase tracking-widest text-[9px] px-4 py-2 ${
                          order.paymentStatus ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                        }`}>
                          {order.paymentStatus ? "Đã thanh toán" : "Chờ thanh toán"}
                        </Badge>
                      </div>
                    </div>

                    {/* Danh sách sản phẩm (tóm tắt) */}
                    <div className="p-10">
                      <div className="grid gap-6">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex gap-6 items-center group/item">
                            <div className="h-20 w-20 bg-gray-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-gray-100 group-hover/item:scale-105 transition-transform duration-300">
                              {item.product?.images?.[0] && (
                                <img src={item.product.images[0]} className="w-full h-full object-cover" alt="" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-extrabold text-[#070f2b] truncate group-hover/item:text-blue-600 transition-colors">{item.product?.name}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-400 font-bold">Số lượng: <span className="text-[#070f2b]">{item.quantity}</span></span>
                                <Separator orientation="vertical" className="h-3" />
                                <Price amount={item.price} className="text-xs text-gray-400 font-bold" />
                              </div>
                            </div>
                            <div className="text-right">
                              <Price amount={item.price * item.quantity} className="text-lg font-extrabold text-[#070f2b]" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-10 bg-gray-150" />

                      {/* Footer đơn hàng */}
                      <div className="flex flex-wrap items-center justify-between gap-8">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng thanh toán</p>
                          <Price amount={order.totalAmount} className="text-4xl font-extrabold text-blue-600 tracking-tight" />
                        </div>

                        <div className="flex gap-4">
                          {order.status === "PENDING" && (
                            <Button 
                              variant="outline" 
                              className="rounded-2xl h-14 px-8 border-red-100 text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-xs transition-all"
                              onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                                  cancelMutation.mutate(order.id);
                                }
                              }}
                            >
                              Hủy đơn
                            </Button>
                          )}
                          <Button 
                            className="rounded-2xl h-14 px-10 bg-[#070f2b] hover:bg-[#070f2b]/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 transition-all duration-300 text-white"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            Chi tiết đơn hàng
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-40 text-center bg-white rounded-[4rem] border border-gray-100 shadow-2xl">
                  <div className="h-32 w-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 mx-auto mb-8 animate-bounce">
                    <Package className="h-16 w-16" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-[#070f2b] mb-4 uppercase tracking-tight">Không tìm thấy đơn hàng</h3>
                  <p className="text-gray-400 font-bold text-lg mb-12 max-w-md mx-auto">Bạn chưa có đơn hàng nào trong trạng thái này. Hãy tiếp tục mua sắm để lấp đầy lịch sử của mình nhé!</p>
                  <Button 
                    className="rounded-2xl h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest text-sm shadow-2xl shadow-blue-600/30 transition-all scale-110"
                    onClick={() => router.push('/shop')}
                  >
                    Khám phá sản phẩm ngay
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
    case "COMPLETED": return "Thành công";
    case "CANCELLED": return "Đã hủy";
    default: return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING": return "text-orange-500";
    case "CONFIRMED": return "text-blue-500";
    case "SHIPPING": return "text-indigo-500";
    case "COMPLETED": return "text-green-500";
    case "CANCELLED": return "text-red-500";
    default: return "text-gray-500";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "PENDING": return <Clock className="h-3 w-3 text-orange-500" />;
    case "CONFIRMED": return <Package className="h-3 w-3 text-blue-500" />;
    case "SHIPPING": return <Truck className="h-3 w-3 text-indigo-500" />;
    case "COMPLETED": return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    case "CANCELLED": return <XCircle className="h-3 w-3 text-red-500" />;
    default: return null;
  }
}
