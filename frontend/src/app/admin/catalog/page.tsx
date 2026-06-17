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
  Pencil, 
  Trash2, 
  Search, 
  Package, 
  Filter, 
  Image as ImageIcon,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
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

import { Price } from "@/components/ui/price";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function AdminCatalogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading("Đang import sản phẩm từ Excel...");

    try {
      const res = await adminApi.importProductsExcel(file);
      setIsImporting(false);
      
      if (res.success > 0) {
        toast.success(`Import thành công ${res.success} sản phẩm!`, { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      } else {
        toast.error("Không có sản phẩm nào được import thành công.", { id: toastId });
      }
      
      if (res.failed > 0) {
        toast.warning(`${res.failed} dòng gặp lỗi. Nhấp 'Xem chi tiết' để xem mô tả lỗi.`, {
          duration: 6000
        });
      }
    } catch (err: any) {
      setIsImporting(false);
      toast.error(err?.response?.data?.message || "Lỗi khi import file Excel.", { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, limit, searchTerm, selectedCategory, minPrice, maxPrice],
    queryFn: () => catalogApi.getProducts({
      skip: (page - 1) * limit,
      take: limit,
      search: searchTerm || undefined,
      category: selectedCategory !== "ALL" ? selectedCategory : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => catalogApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Đã xóa sản phẩm.");
    },
    onError: () => toast.error("Không thể xóa sản phẩm này.")
  });

  const products = data?.items || [];
  const totalProducts = data?.total || 0;

  // Filter logic (Server-side handled most, stock filter handles current page for now, ideally backend should support stock filtering)
  const filteredProducts = products?.filter((p: any) => {
    const matchesStock = stockFilter === "ALL" || 
      (stockFilter === "IN_STOCK" && p.stock > 10) ||
      (stockFilter === "LOW_STOCK" && p.stock > 0 && p.stock <= 10) ||
      (stockFilter === "OUT_OF_STOCK" && p.stock === 0);
    return matchesStock;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Quản lý sản phẩm</h1>
          <p className="text-gray-400 font-medium italic">Theo dõi và cập nhật danh mục sản phẩm của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm transition-all"
            onClick={() => router.push("/admin/flash-sale")}
          >
            <Zap className="h-4 w-4 fill-current text-red-500" /> Cấu hình Flash Sale
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-sm transition-all"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <FileSpreadsheet className="h-4 w-4" /> Import Excel
          </Button>
          <Link
            href="/admin/catalog/import"
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors underline mr-2"
          >
            Xem hướng dẫn
          </Link>
          <Button 
            className="btn-action gap-2"
            onClick={() => router.push("/admin/catalog/new")}
          >
            <Plus className="h-5 w-5" /> Thêm sản phẩm mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tìm kiếm sản phẩm</Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Tên sản phẩm hoặc mã ID..." 
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Danh mục</Label>
          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "ALL")}>
            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="ALL">Tất cả danh mục</SelectItem>
              {categories?.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Kho hàng</Label>
          <Select value={stockFilter} onValueChange={(val) => setStockFilter(val || "ALL")}>
            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="ALL">Tất cả kho</SelectItem>
              <SelectItem value="IN_STOCK">Còn hàng ({'>'}10)</SelectItem>
              <SelectItem value="LOW_STOCK">Sắp hết ({'<='}10)</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Hết hàng (0)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Khoảng giá ($)</Label>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl outline-none font-bold text-sm"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                />
                <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl outline-none font-bold text-sm"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />
            </div>
        </div>
        <div className="flex items-end">
            <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-gray-100 font-bold gap-2 text-gray-500 hover:bg-gray-50 transition-all"
                onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("ALL");
                    setStockFilter("ALL");
                    setMinPrice("");
                    setMaxPrice("");
                }}
            >
                <Filter className="h-4 w-4" /> Đặt lại
            </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/20 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-24 p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin sản phẩm</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Danh mục</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Giá niêm yết</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tồn kho</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</TableHead>
                <TableHead className="w-20 p-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    <TableCell className="p-8"><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-14 w-full rounded-xl" /></TableCell>
                    <TableCell className="p-8 text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell className="p-8 text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="p-8 text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts?.length > 0 ? (
                filteredProducts.map((product: any) => (
                  <TableRow 
                    key={product.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/80 transition-all cursor-pointer group"
                    onClick={() => router.push(`/admin/catalog/${product.id}`)}
                  >
                    <TableCell className="p-8 font-black text-gray-400 text-sm">#{product.id}</TableCell>
                    <TableCell className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-gray-900 line-clamp-1 text-base">{product.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Cập nhật: {new Date(product.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-8 text-center">
                      <Badge variant="outline" className="rounded-full bg-indigo-50 text-indigo-600 border-none font-black uppercase tracking-widest text-[9px] px-3">
                        {product.category?.name || categories?.find((c: any) => c.id === product.categoryId)?.name || `ID: ${product.categoryId}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-8 text-right font-black text-gray-900 text-lg">
                      <Price amount={product.price} />
                    </TableCell>
                    <TableCell className="p-8 text-center font-black text-gray-900">{product.stock}</TableCell>
                    <TableCell className="p-8">
                      <Badge className={`rounded-full border-none font-black uppercase tracking-widest text-[9px] px-3 ${
                        product.stock > 10 ? "bg-green-100 text-green-600" :
                        product.stock > 0 ? "bg-orange-100 text-orange-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {product.stock > 10 ? "Còn hàng" : product.stock > 0 ? "Sắp hết" : "Hết hàng"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-8" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-xl text-gray-400 hover:text-primary h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition-all outline-none">
                          <MoreVertical className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-gray-100">
                          <DropdownMenuItem 
                            className="rounded-xl gap-2 cursor-pointer font-bold py-3"
                            onClick={() => router.push(`/admin/catalog/${product.id}`)}
                          >
                            <Pencil className="h-4 w-4" /> Chỉnh sửa nhanh
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="rounded-xl gap-2 cursor-pointer font-bold py-3"
                            onClick={() => window.open(`/shop/${product.id}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" /> Xem trên cửa hàng
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="rounded-xl gap-2 cursor-pointer text-red-500 focus:bg-red-50 font-bold py-3"
                            onClick={() => {
                              if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Xóa vĩnh viễn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                        <Package className="h-12 w-12" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">Không tìm thấy sản phẩm</h3>
                      <p className="text-gray-400 font-bold max-w-xs mx-auto text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm theo từ khóa khác.</p>
                      <Button variant="outline" className="rounded-xl font-black" onClick={() => { setSearchTerm(""); setSelectedCategory("ALL"); }}>Xóa tất cả bộ lọc</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationControls 
          total={totalProducts}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}
