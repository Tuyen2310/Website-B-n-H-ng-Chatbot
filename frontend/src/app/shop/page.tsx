"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Filter, Heart, Star, Search } from "lucide-react";
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

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryParam ? parseInt(categoryParam) : null
  );
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("latest");
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    setSelectedCategoryId(categoryParam ? parseInt(categoryParam) : null);
    setSearchTerm(searchParam);
  }, [categoryParam, searchParam]);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: catalogApi.getCategories,
  });

  const debouncedMinPrice = useDebounce(priceRange.min, 500);
  const debouncedMaxPrice = useDebounce(priceRange.max, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["products", selectedCategoryId, debouncedSearch, debouncedMinPrice, debouncedMaxPrice, sortBy],
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
        take: 50 // Get more products for shop page
      });
    },
  });

  const products = data?.items || [];
  const processedProducts = products;

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  return (
    <div className="container mx-auto py-32 px-6">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-80 space-y-8">
          <div className="shop-sidebar animate-fade-in-up">
            <h2 className="filter-title flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" /> Danh mục
            </h2>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`category-filter-btn ${selectedCategoryId === null ? 'active' : ''}`}
              >
                Tất cả sản phẩm
              </button>
              {categories?.slice(0, showAllCategories ? categories.length : 6).map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`category-filter-btn ${selectedCategoryId === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
              {categories && categories.length > 6 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showAllCategories ? "Thu gọn ⌃" : `Xem thêm (${categories.length - 6}) ⌄`}
                </button>
              )}
            </div>
          </div>

          <div className="shop-sidebar animate-fade-in-up">
            <h3 className="filter-title">Khoảng giá (VND)</h3>
            <div className="flex gap-3">
                <input 
                    type="number" 
                    placeholder="Từ" 
                    className="w-1/2 h-12 px-4 input-premium text-sm outline-none"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                />
                <input 
                    type="number" 
                    placeholder="Đến" 
                    className="w-1/2 h-12 px-4 input-premium text-sm outline-none"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                />
            </div>
          </div>

          <div className="bg-gradient-to-tr from-slate-900 to-blue-950 p-8 rounded-[2rem] text-white shadow-xl animate-fade-in-up">
            <h3 className="text-base font-extrabold mb-2 uppercase tracking-wide">Ưu đãi thành viên</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">Đăng ký thành viên ngay hôm nay để nhận mã giảm giá 10% cho đơn hàng đầu tiên!</p>
            <Link href="/register" className="block w-full">
              <Button size="sm" className="w-full mt-6 h-11 rounded-xl font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30">Đăng ký ngay</Button>
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 animate-fade-in-up">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight uppercase text-[#070f2b]">
              {selectedCategoryId ? categories?.find((c: any) => c.id === selectedCategoryId)?.name : "Cửa hàng"}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v || "latest")}>
                <SelectTrigger className="h-12 rounded-2xl border-gray-200 bg-white font-bold text-xs px-5 w-44 shadow-sm">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  <SelectItem value="latest">Mới nhất</SelectItem>
                  <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 bg-white px-4 h-12 rounded-2xl shadow-sm border border-gray-100 focus-within:border-blue-600/35 transition-colors">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm sản phẩm..." 
                  className="bg-transparent border-none text-xs font-bold outline-none w-36 md:w-56"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] w-full rounded-[2rem]" />
              ))
            ) : processedProducts?.length > 0 ? (
              processedProducts.map((product: any) => (
                <div key={product.id} className="prod-card-premium flex flex-col justify-between animate-fade-in-up">
                  <div>
                    <div className="prod-image-wrap">
                      <Link href={`/shop/${product.id}`} className="block w-full h-full relative">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-gray-200" />
                          </div>
                        )}
                      </Link>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="prod-action-btn"
                        disabled={product.stock === 0 || user?.role === 'ADMIN'}
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </button>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="prod-badge-alert bg-orange-600">
                          Chỉ còn {product.stock}
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="prod-badge-alert bg-slate-500">
                          Hết hàng
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <Link href={`/shop/${product.id}`}>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[12px] font-bold text-gray-700">4.9</span>
                        </div>
                        <span className="text-gray-300 text-[10px]">|</span>
                        <span className="text-[11px] text-gray-500 font-medium">Đã bán {product.soldCount || 0}</span>
                      </div>
                      <p className="text-base font-black text-blue-600">
                        <Price amount={product.price} />
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center animate-fade-in-up">
                <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-400 font-semibold mt-1">Vui lòng thử chọn danh mục khác hoặc xóa bộ lọc để tìm kiếm.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-40 text-center font-bold text-gray-500">Đang tải cửa hàng...</div>}>
      <ShopContent />
    </Suspense>
  );
}
