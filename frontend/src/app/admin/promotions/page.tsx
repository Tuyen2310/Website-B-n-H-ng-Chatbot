"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
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
  Plus, 
  Search, 
  Ticket,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import Switch from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function AdminPromotionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-promotions", page, limit],
    queryFn: () => adminApi.getPromotions({
      skip: (page - 1) * limit,
      take: limit,
    }),
  });

  const promotions = data?.items || [];
  const totalPromotions = data?.total || 0;

  const filteredPromotions = promotions.filter((p: any) => {
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const isExpired = now > new Date(p.endDate);
    const isNotStarted = now < new Date(p.startDate);
    
    let matchesStatus = true;
    if (statusFilter === "ACTIVE") matchesStatus = p.isActive && !isExpired && !isNotStarted;
    if (statusFilter === "EXPIRED") matchesStatus = p.isActive && isExpired;
    if (statusFilter === "NOT_STARTED") matchesStatus = p.isActive && isNotStarted;
    if (statusFilter === "DISABLED") matchesStatus = !p.isActive;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Quản lý khuyến mãi</h1>
          <p className="text-gray-400 font-medium italic">Tạo mã Voucher và các chương trình giảm giá.</p>
        </div>
        <Button 
          className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20 gap-2"
          onClick={() => router.push("/admin/promotions/new")}
        >
          <Plus className="h-5 w-5" /> Tạo mã giảm giá
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="md:col-span-6 space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tìm kiếm Voucher</Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Nhập mã Voucher..." 
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-4 space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Trạng thái mã</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
            <SelectTrigger className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold text-sm shadow-inner">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Đang chạy</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
              <SelectItem value="NOT_STARTED">Chưa bắt đầu</SelectItem>
              <SelectItem value="DISABLED">Đã tắt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 flex items-end">
            <Button variant="outline" className="w-full h-12 rounded-xl border-gray-100 font-bold gap-2 text-gray-500 hover:bg-gray-50 transition-all shadow-sm" onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}>
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
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã Voucher</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ưu đãi</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời hạn áp dụng</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Hoạt động</TableHead>
                <TableHead className="w-20 p-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    <TableCell className="p-8"><Skeleton className="h-12 w-40 rounded-xl" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-10 w-24 rounded-xl" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-10 w-48 rounded-xl" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-6 w-12 rounded-full mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-8 w-8 rounded-lg mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPromotions?.length > 0 ? (
                filteredPromotions.map((promo: any) => {
                  const now = new Date();
                  const isExpired = now > new Date(promo.endDate);
                  const isNotStarted = now < new Date(promo.startDate);

                  return (
                    <TableRow 
                      key={promo.id} 
                      className="border-b border-gray-50 hover:bg-gray-50/80 transition-all cursor-pointer group"
                      onClick={() => router.push(`/admin/promotions/${promo.id}`)}
                    >
                      <TableCell className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-orange-100/50 transition-transform group-hover:scale-110">
                            <Ticket className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-base tracking-widest uppercase">{promo.code}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID #{promo.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-8">
                        <span className="font-black text-primary text-2xl">-{promo.discountPercent}%</span>
                      </TableCell>
                      <TableCell className="p-8">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Calendar className="h-3 w-3" /> Từ: {new Date(promo.startDate).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest">
                            <Calendar className="h-3 w-3" /> Đến: {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-8 text-center">
                        <Badge className={`rounded-full border-none font-black uppercase tracking-widest text-[9px] px-3 ${
                          !promo.isActive ? "bg-gray-100 text-gray-400" :
                          isExpired ? "bg-red-100 text-red-600" :
                          isNotStarted ? "bg-blue-100 text-blue-600" :
                          "bg-green-100 text-green-600"
                        }`}>
                          {!promo.isActive ? "Đã tắt" : isExpired ? "Hết hạn" : isNotStarted ? "Chưa chạy" : "Đang chạy"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-8 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center">
                            <Switch 
                                checked={promo.isActive}
                                onCheckedChange={(v: boolean) => {
                                    adminApi.updatePromotion(promo.id, { isActive: v })
                                        .then(() => {
                                            queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
                                            toast.success(v ? "Đã kích hoạt" : "Đã tạm dừng");
                                        })
                                        .catch(() => toast.error("Thao tác thất bại."));
                                }}
                            />
                        </div>
                      </TableCell>
                      <TableCell className="p-8">
                          <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                              <ChevronRight className="h-5 w-5" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200">
                        <Ticket className="h-12 w-12" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">Không tìm thấy mã giảm giá</h3>
                      <p className="text-gray-400 font-bold text-sm">Thử thay đổi bộ lọc hoặc thêm mã mới.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationControls 
          total={totalPromotions}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}
