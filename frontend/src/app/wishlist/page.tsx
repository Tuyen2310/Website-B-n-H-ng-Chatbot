"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { Heart, ShoppingBag, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { Price } from "@/components/ui/price";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => catalogApi.getWishlist(),
    enabled: !!user,
  });

  const handleRemove = async (productId: number, productName: string) => {
    try {
      await catalogApi.toggleWishlist(productId);
      toast.success(`Đã xóa ${productName} khỏi danh sách yêu thích`);
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-40 text-center animate-fade-in-up">
        <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h2>
        <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem danh sách sản phẩm yêu thích.</p>
        <Link href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-32 px-6 max-w-7xl min-h-[70vh]">
      <div className="flex items-center gap-3 mb-10 animate-fade-in-up">
        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Sản phẩm yêu thích</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-gray-100 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : wishlist?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wishlist.map((product: any) => (
            <div key={product.id} className="prod-card-premium flex flex-col justify-between animate-slide-up">
              <div>
                <div className="prod-image-wrap group">
                  <Link href={`/shop/${product.id}`} className="block w-full h-full">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-gray-200" />
                      </div>
                    )}
                  </Link>
                  <button 
                    onClick={() => handleRemove(product.id, product.name)}
                    className="absolute top-3 right-3 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md"
                    title="Bỏ yêu thích"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 dark:bg-slate-900">
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">4.9</span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600 text-[10px]">|</span>
                    <span className="text-[11px] text-gray-500 font-medium">Đã bán {product.soldCount || 0}</span>
                  </div>
                  <p className="text-base font-black text-blue-600">
                    <Price amount={product.price} />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in-up">
          <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-gray-500 mb-6">Hãy thêm những sản phẩm bạn yêu thích vào đây để dễ dàng mua sắm sau nhé.</p>
          <Link href="/shop" className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors">
            Khám phá cửa hàng
          </Link>
        </div>
      )}
    </div>
  );
}
