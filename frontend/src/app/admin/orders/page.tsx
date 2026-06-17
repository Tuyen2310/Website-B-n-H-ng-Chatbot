"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi, adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ShoppingBag, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  MoreVertical,
  ChevronRight,
  Printer
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function AdminOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, limit],
    queryFn: () => adminApi.getOrders({
      skip: (page - 1) * limit,
      take: limit,
    }),
  });

  const orders = data?.items || [];
  const totalOrders = data?.total || 0;

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: number, paymentStatus: boolean }) => adminApi.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Đã cập nhật trạng thái thanh toán.");
    }
  });

  // Client filter for now
  const filteredOrders = orders?.filter((o: any) => {
    const matchesSearch = o.id.toString().includes(searchTerm) || o.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || o.status === selectedStatus;
    const matchesPayment = paymentFilter === "ALL" || (paymentFilter === "PAID" ? o.paymentStatus : !o.paymentStatus);
    const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
    const matchesDate = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Quản lý đơn hàng</h1>
          <p className="text-gray-400 font-medium italic">Theo dõi toàn bộ lịch sử giao dịch và vận chuyển.</p>
        </div>
        <Button 
            className="rounded-2xl h-14 px-8 font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 gap-2 text-white"
            onClick={() => {
                const query = new URLSearchParams({
                    status: selectedStatus,
                    payment: paymentFilter,
                    start: startDate,
                    end: endDate,
                    search: searchTerm
                }).toString();
                window.open(`/admin/orders/bulk-print?${query}`, '_blank');
            }}
        >
            <Printer className="h-5 w-5" /> In hàng loạt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tìm đơn hàng</Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Mã / Tên..." 
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Trạng thái</Label>
          <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v || "ALL")}>
            <SelectTrigger className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold text-sm shadow-inner">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem value="SHIPPING">Đang giao</SelectItem>
              <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Thanh toán</Label>
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v || "ALL")}>
            <SelectTrigger className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold text-sm shadow-inner">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="PAID">Đã trả</SelectItem>
              <SelectItem value="UNPAID">Chưa trả</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-4 space-y-2">
            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Khoảng ngày</Label>
            <div className="flex items-center gap-2">
                <input 
                    type="date" 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl outline-none font-bold text-sm shadow-inner"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input 
                    type="date" 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl outline-none font-bold text-sm shadow-inner"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
        </div>
        <div className="md:col-span-2 flex items-end">
            <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-gray-100 font-bold gap-2 text-gray-500 hover:bg-gray-50 transition-all shadow-sm" 
                onClick={() => { 
                    setSearchTerm(""); 
                    setSelectedStatus("ALL"); 
                    setPaymentFilter("ALL");
                    setStartDate("");
                    setEndDate("");
                }}
            >
                <Filter className="h-4 w-4" /> Đặt lại
            </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/20 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày đặt</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Tổng thanh toán</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Thanh toán</TableHead>
                <TableHead className="w-20 p-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    <TableCell className="p-8"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="p-8 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-6 w-24 rounded-full mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders?.length > 0 ? (
                filteredOrders.map((order: any) => (
                  <TableRow 
                    key={order.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/80 transition-all cursor-pointer group"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <TableCell className="p-8 font-black text-gray-900 text-sm">#{order.id}</TableCell>
                    <TableCell className="p-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">
                          {order.user?.name?.[0]}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm">{order.user?.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-8">
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-tighter">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </TableCell>
                    <TableCell className="p-8 text-right font-black text-gray-900 text-lg">${order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="p-8 text-center" onClick={(e) => e.stopPropagation()}>
                      <Select 
                        value={order.status} 
                        onValueChange={(newStatus) => {
                          adminApi.updateOrderStatus(order.id, newStatus)
                            .then(() => {
                              queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
                              toast.success("Đã cập nhật trạng thái đơn hàng.");
                            })
                            .catch(() => toast.error("Cập nhật thất bại."));
                        }}
                      >
                        <SelectTrigger className={`h-8 rounded-full border-none font-black uppercase tracking-widest text-[9px] px-3 ${
                          order.status === "COMPLETED" ? "bg-green-100 text-green-600" :
                          order.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                          order.status === "SHIPPING" ? "bg-indigo-100 text-indigo-600" :
                          "bg-orange-100 text-orange-600"
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl border-none">
                          <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                          <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                          <SelectItem value="SHIPPING">Đang giao hàng</SelectItem>
                          <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                          <SelectItem value="CANCELLED">Hủy đơn hàng</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-8 text-center" onClick={(e) => e.stopPropagation()}>
                      <Badge 
                        variant="outline" 
                        className={`rounded-full border-none font-black uppercase tracking-widest text-[9px] px-3 cursor-pointer ${
                          order.paymentStatus ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                        }`}
                        onClick={() => updatePaymentMutation.mutate({ id: order.id, paymentStatus: !order.paymentStatus })}
                      >
                        {order.paymentStatus ? "Đã trả" : "Chờ xử lý"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-8">
                      <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200">
                        <ShoppingBag className="h-12 w-12" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">Không tìm thấy đơn hàng</h3>
                      <p className="text-gray-400 font-bold text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm mã đơn khác.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationControls 
          total={totalOrders}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING": return "Chờ xác nhận";
    case "CONFIRMED": return "Đã xác nhận";
    case "SHIPPING": return "Đang giao hàng";
    case "COMPLETED": return "Hoàn thành";
    case "CANCELLED": return "Đã hủy";
    default: return status;
  }
}
