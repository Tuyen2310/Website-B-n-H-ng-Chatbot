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
  Plus, 
  Trash2, 
  Search, 
  Menu, 
  Filter,
  ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => catalogApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Đã xóa danh mục.");
    },
    onError: () => toast.error("Không thể xóa danh mục này.")
  });

  const filteredCategories = categories?.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Quản lý danh mục</h1>
          <p className="text-gray-400 font-medium italic">Phân loại sản phẩm để khách hàng dễ dàng tìm kiếm.</p>
        </div>
        <Button 
          className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-105"
          onClick={() => router.push("/admin/categories/new")}
        >
          <Plus className="h-5 w-5" /> Thêm danh mục mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="md:col-span-3 space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tìm kiếm danh mục</Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Tên danh mục cần tìm..." 
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-end">
            <Button variant="outline" className="w-full h-12 rounded-xl border-gray-100 font-bold gap-2 text-gray-500 hover:bg-gray-50 transition-all" onClick={() => setSearchTerm("")}>
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
                <TableHead className="w-24 p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên danh mục</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mô tả</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ngày tạo</TableHead>
                <TableHead className="w-20 p-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    <TableCell className="p-8"><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-4 w-60" /></TableCell>
                    <TableCell className="p-8 text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCategories?.length > 0 ? (
                filteredCategories.map((cat: any) => (
                  <TableRow 
                    key={cat.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/80 transition-all cursor-pointer group"
                    onClick={() => router.push(`/admin/categories/${cat.id}`)}
                  >
                    <TableCell className="p-8 font-black text-gray-400 text-sm">#{cat.id}</TableCell>
                    <TableCell className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary font-black text-xs shadow-inner">
                          {cat.name[0]}
                        </div>
                        <span className="font-black text-gray-900 text-base">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-8">
                      <p className="text-gray-500 text-sm line-clamp-1 max-w-xs font-medium">{cat.description || "Không có mô tả"}</p>
                    </TableCell>
                    <TableCell className="p-8 text-center font-bold text-gray-400 text-xs">
                      {new Date(cat.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50"
                                onClick={() => {
                                    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
                                        deleteMutation.mutate(cat.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200">
                        <Menu className="h-12 w-12" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">Không tìm thấy danh mục</h3>
                      <p className="text-gray-400 font-bold text-sm">Thử thay đổi bộ lọc hoặc thêm danh mục mới.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
