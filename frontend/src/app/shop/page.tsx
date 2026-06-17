"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi, publicApi, PublicSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Filter, Star, Search, Zap } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Price } from "@/components/ui/price";
import { Suspense } from "react";
import { PaginationControls } from "@/components/ui/pagination-controls";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const flashSaleParam = searchParams.get("flashSale") === "true";
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryParam ? parseInt(categoryParam) : null
  );
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [flashSaleOnly, setFlashSaleOnly] = useState(flashSaleParam);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("latest");
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    setSelectedCategoryId(categoryParam ? parseInt(categoryParam) : null);
    setSearchTerm(searchParam);
    setFlashSaleOnly(searchParams.get("flashSale") === "true");
    setPage(1); // Reset page on URL param changes
  }, [categoryParam, searchParam, searchParams]);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedMinPrice = useDebounce(priceRange.min, 500);
  const debouncedMaxPrice = useDebounce(priceRange.max, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, debouncedSearch, debouncedMinPrice, debouncedMaxPrice, sortBy, flashSaleOnly]);

  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();

  const { data: publicSettings } = useQuery<PublicSettings>({
    queryKey: ["public-settings"],
    queryFn: publicApi.getPublicSettings,
  });

  const isFlashSaleActive = (() => {
    if (!publicSettings?.flashSale?.startTime || !publicSettings?.flashSale?.endTime) return false;
    const now = new Date();
    const start = new Date(publicSettings.flashSale.startTime);
    const end = new Date(publicSettings.flashSale.endTime);
    return now >= start && now <= end;
  })();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: catalogApi.getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", selectedCategoryId, debouncedSearch, debouncedMinPrice, debouncedMaxPrice, sortBy, page, limit, flashSaleOnly],
    queryFn: () => {
      let backendSortBy = undefined;
      let backendSortOrder = undefined;
      if (sortBy === "price_asc") {
        backendSortBy = "price";
        backendSortOrder = "asc";
      } else if (sortBy === "price_desc") {
        backendSortBy = "price";
        backendSortOrder = "desc";
      }

      return catalogApi.getProducts({ 
        category: selectedCategoryId || undefined,
        search: debouncedSearch || undefined,
        minPrice: debouncedMinPrice || undefined,
        maxPrice: debouncedMaxPrice || undefined,
        sortBy: backendSortBy,
        sortOrder: backendSortOrder,
        skip: (page - 1) * limit,
        take: limit,
        isFlashSale: flashSaleOnly ? true : undefined,
      });
    },
  });

  const products = data?.items || [];
  const totalProducts = data?.total || 0;

  const handleAddToCart = (product: any) => {
    const price = isFlashSaleActive && product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
    addItem({
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      image: product.images?.[0],
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  return (
    <div className="container mx-auto py-32 px-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-72 space-y-6">
          <div className="shop-sidebar animate-fade-in-up">
            <h2 className="filter-title flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Danh mục
            </h2>
            <div className="space-y-1">
              {isFlashSaleActive && (
                <button
                  onClick={() => {
                    setFlashSaleOnly(!flashSaleOnly);
                    setSelectedCategoryId(null);
                  }}
                  className={`category-filter-btn flex items-center gap-2 border border-red-200/60 dark:border-red-900/40 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 ${flashSaleOnly ? 'active bg-red-50 dark:bg-red-900/30' : ''}`}
                >
                  <Zap className="h-4 w-4 fill-current text-red-500 animate-pulse" />
                  Sản phẩm Flash Sale
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setFlashSaleOnly(false);
                }}
                className={`category-filter-btn ${selectedCategoryId === null && !flashSaleOnly ? 'active' : ''}`}
              >
                Tất cả sản phẩm
              </button>
              {categories?.slice(0, showAllCategories ? categories.length : 6).map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setFlashSaleOnly(false);
                  }}
                  className={`category-filter-btn ${selectedCategoryId === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
              {categories && categories.length > 6 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-left px-4 py-2 mt-2 text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {showAllCategories ? "Thu gọn ⌃" : `Xem thêm (${categories.length - 6}) ⌄`}
                </button>
              )}
            </div>
          </div>

          <div className="shop-sidebar animate-fade-in-up animate-stagger-1">
            <h3 className="filter-title">Khoảng giá (VND)</h3>
            <div className="flex gap-3">
                <input 
                    type="number" 
                    placeholder="Từ" 
                    className="w-1/2 h-11 px-3 input-premium text-sm outline-none"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                />
                <input 
                    type="number" 
                    placeholder="Đến" 
                    className="w-1/2 h-11 px-3 input-premium text-sm outline-none"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                />
            </div>
          </div>

          <div className="glass-premium-dark p-8 rounded-[1.5rem] text-white shadow-xl animate-fade-in-up animate-stagger-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="text-sm font-black mb-3 uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">Ưu đãi thành viên</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">Đăng ký thành viên ngay hôm nay để nhận mã giảm giá 10% cho đơn hàng đầu tiên!</p>
            <Link href="/register" className="block w-full relative z-10">
              <Button size="sm" className="w-full mt-6 h-11 rounded-xl font-bold bg-white text-blue-900 hover:bg-gray-100 shadow-lg transition-all hover:scale-[1.02]">Đăng ký ngay</Button>
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fade-in-up">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight uppercase text-slate-900 dark:text-white">
                {selectedCategoryId ? categories?.find((c: any) => c.id === selectedCategoryId)?.name : "Cửa hàng"}
              </h1>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">
                Hiển thị {products.length} trên tổng số {totalProducts} sản phẩm
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v || "latest")}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs px-4 w-40 shadow-sm focus:ring-2 focus:ring-blue-500/50">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="latest">Mới nhất</SelectItem>
                  <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 h-11 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm sản phẩm..." 
                  className="bg-transparent border-none text-sm font-bold outline-none w-32 sm:w-48 text-slate-900 dark:text-white placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <Skeleton key={i} className="h-[380px] w-full rounded-[1.5rem]" />
              ))
            ) : products.length > 0 ? (
              products.map((product: any, idx: number) => (
                <div key={product.id} className={`prod-card-premium flex flex-col justify-between animate-slide-up animate-stagger-${(idx % 4) + 1}`}>
                  <div>
                    <div className="prod-image-wrap group">
                      <Link href={`/shop/${product.id}`} className="block w-full h-full relative">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-contain" 
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-gray-200 dark:text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-all duration-300" />
                      </Link>
                      
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="prod-action-btn"
                        disabled={product.stock === 0 || user?.role === 'ADMIN'}
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </button>
                      
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="prod-badge-alert bg-orange-500 shadow-orange-500/30">
                          Sắp hết ({product.stock})
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="prod-badge-alert bg-slate-500 shadow-none">
                          Hết hàng
                        </span>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <Link href={`/shop/${product.id}`}>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-[11px] font-black">4.9</span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">Đã bán {product.soldCount || 0}</span>
                      </div>
                      
                      {isFlashSaleActive && product.isFlashSale && product.flashSalePrice ? (
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-black text-red-500">
                            <Price amount={product.flashSalePrice} />
                          </p>
                          <p className="text-xs font-bold text-gray-400 line-through">
                            <Price amount={product.price} />
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                          <Price amount={product.price} />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center animate-fade-in-up glass-premium rounded-[2rem]">
                <ShoppingBag className="h-20 w-20 text-blue-200 dark:text-blue-900 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Vui lòng thử chọn danh mục khác hoặc xóa bộ lọc tìm kiếm.</p>
                <Button 
                   className="mt-6 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
                   onClick={() => {
                     setSearchTerm("");
                     setSelectedCategoryId(null);
                     setPriceRange({ min: "", max: "" });
                   }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalProducts > limit && (
            <div className="mt-14 flex justify-center animate-fade-in-up">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <PaginationControls 
                  total={totalProducts} 
                  page={page} 
                  limit={limit} 
                  onPageChange={setPage} 
                  onLimitChange={(l) => { setLimit(l); setPage(1); }} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-40 flex justify-center">
        <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
