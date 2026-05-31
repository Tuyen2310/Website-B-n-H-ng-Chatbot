"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  Share2,
  Minus,
  Plus,
  PlayCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ReviewSection from "@/components/ReviewSection";
import { Price } from "@/components/ui/price";
import Link from "next/link";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const addViewedProduct = useRecentlyViewedStore((state) => state.addProduct);
  const recentlyViewed = useRecentlyViewedStore((state) => state.products);
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => catalogApi.getProduct(Number(id)),
  });

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", id],
    queryFn: () => catalogApi.getProductRecommendations(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0]);
    }
    if (product) {
      addViewedProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || ""
      });
    }
  }, [product, addViewedProduct]);

  useEffect(() => {
    if (user) {
      catalogApi.getWishlist().then((list) => {
        if (list.some((p: any) => p.id === Number(id))) {
          setIsFavorite(true);
        }
      }).catch(() => {});
    }
  }, [user, id]);

  const handleFavorite = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }
    try {
      const res = await catalogApi.toggleWishlist(Number(id));
      setIsFavorite(res.added);
      toast.success(res.added ? "Đã thêm sản phẩm vào danh sách yêu thích!" : "Đã gỡ sản phẩm khỏi danh sách yêu thích");
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết sản phẩm vào khay nhớ tạm!");
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0],
    });
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0],
    });
    router.push('/checkout');
  };

  if (isLoading) return <ProductSkeleton />;
  if (!product) return <div className="py-20 text-center font-extrabold text-2xl text-[#070f2b] animate-fade-in-up">Sản phẩm không tồn tại.</div>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.[0],
    "description": product.description,
    "sku": product.id.toString(),
    "offers": {
      "@type": "Offer",
      "priceCurrency": "VND",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "E-Commerce Store"
      }
    }
  };

  return (
    <div className="container mx-auto py-32 px-6 max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: Images */}
        <div className="space-y-6 animate-fade-in-up">
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-black/5 dark:bg-slate-800 border border-gray-100 shadow-2xl group flex items-center justify-center">
            {selectedImage === product?.videoUrl && product?.videoUrl ? (
              <iframe 
                src={product.videoUrl.replace('watch?v=', 'embed/')} 
                className="w-full h-full border-none"
                allowFullScreen
              />
            ) : selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <ShoppingBag className="h-20 w-20" />
              </div>
            )}
            <div className="absolute top-8 right-8 flex flex-col gap-3">
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={handleFavorite}
                className="rounded-full shadow-xl bg-white/90 backdrop-blur hover:bg-red-500 hover:text-white transition-all group"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500 group-hover:fill-white group-hover:text-white" : ""}`} />
              </Button>
              <Button 
                variant="secondary" 
                size="icon" 
                onClick={handleShare}
                className="rounded-full shadow-xl bg-white/90 backdrop-blur hover:bg-blue-600 hover:text-white transition-all"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {product.videoUrl && (
              <div 
                onClick={() => setSelectedImage(product.videoUrl)}
                className={`aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 cursor-pointer transition-all duration-300 flex items-center justify-center ${
                  selectedImage === product.videoUrl ? "border-blue-600 shadow-lg scale-95" : "border-transparent hover:border-gray-300"
                }`}
              >
                <PlayCircle className="h-8 w-8 text-white/80" />
              </div>
            )}
            {product.images?.map((img: string, i: number) => (
              <div 
                key={i} 
                onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-2xl overflow-hidden bg-white border-2 cursor-pointer transition-all duration-300 ${
                  selectedImage === img ? "border-blue-600 shadow-lg scale-95" : "border-transparent hover:border-gray-200"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <Badge className="rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-6 py-2 font-black uppercase text-[10px] tracking-widest shadow-sm">
              {product.category?.name}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#070f2b] leading-[1.1] tracking-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 5 ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Sản phẩm chính hãng
              </span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                  {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <Price amount={product.price} className="text-5xl font-extrabold text-blue-600 tracking-tight" />
            <span className="text-gray-400 font-bold line-through text-xl opacity-60">
               <Price amount={product.price * 1.2} />
            </span>
          </div>

          <p className="text-gray-500 leading-relaxed text-base font-semibold max-w-xl">
            {product.description}
          </p>

          {/* Dynamic Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="space-y-6">
              {Object.entries(product.attributes).map(([key, values]: [string, any]) => (
                <div key={key} className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#070f2b]">
                    {key}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(values) ? (
                      values.map((v) => (
                        <button
                          key={v}
                          className="px-6 py-3 rounded-xl border-2 border-gray-100 font-bold text-sm hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95"
                        >
                          {v}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-600 font-bold bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                        {values}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator className="bg-gray-100" />

          {/* Actions */}
          <div className="space-y-8">
            <div className="flex items-center gap-8">
              <div className="flex items-center bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-inner w-fit">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="w-14 text-center font-extrabold text-xl">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kho hàng</p>
                <p className="text-sm font-extrabold text-[#070f2b]">
                  Còn {product.stock} sản phẩm trong kho
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className={`flex-1 h-16 rounded-[1.25rem] text-lg font-extrabold transition-all duration-300 shadow-xl uppercase tracking-widest ${
                  user?.role === 'ADMIN' 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:scale-[1.01]"
                }`}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || user?.role === 'ADMIN'}
              >
                {user?.role === 'ADMIN' ? "Chế độ Quản trị" : "Thêm giỏ hàng"}
                <ShoppingBag className="ml-3 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                className={`flex-1 h-16 rounded-[1.25rem] text-lg font-extrabold transition-all duration-300 shadow-xl uppercase tracking-widest ${
                  user?.role === 'ADMIN' 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30 hover:scale-[1.01]"
                }`}
                onClick={handleBuyNow}
                disabled={product.stock === 0 || user?.role === 'ADMIN'}
              >
                Mua ngay
              </Button>
            </div>
          </div>

          {/* Policies */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
            <div className="flex flex-col items-center sm:items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-gray-150 hover:bg-white transition-all shadow-sm">
              <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center sm:text-left">Bảo hành 12 tháng</span>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-gray-150 hover:bg-white transition-all shadow-sm">
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Truck className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center sm:text-left">Miễn phí vận chuyển</span>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-gray-150 hover:bg-white transition-all shadow-sm">
              <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <RotateCcw className="h-7 w-7" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center sm:text-left">30 ngày đổi trả</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={Number(id)} />

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-20 space-y-8 animate-fade-in-up">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[#070f2b]">Có thể bạn sẽ thích</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((rec: any) => (
              <Link href={`/shop/${rec.id}`} key={rec.id} className="group cursor-pointer">
                <div className="aspect-square bg-gray-50 rounded-3xl mb-4 overflow-hidden relative">
                  {rec.images?.[0] ? (
                    <img src={rec.images[0]} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="h-10 w-10" />
                    </div>
                  )}
                  {rec.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-full text-xs font-black uppercase text-gray-500 shadow-sm">Tạm hết hàng</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-extrabold text-[#070f2b] line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                  {rec.name}
                </h3>
                <Price amount={rec.price} className="text-lg font-black text-blue-600" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.filter(p => p.id !== Number(id)).length > 0 && (
        <div className="mt-20 space-y-8 animate-fade-in-up border-t border-gray-100 pt-16">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[#070f2b]">Sản phẩm bạn vừa xem</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewed.filter(p => p.id !== Number(id)).slice(0, 4).map((rec: any) => (
              <Link href={`/shop/${rec.id}`} key={rec.id} className="group cursor-pointer">
                <div className="aspect-square bg-gray-50 rounded-3xl mb-4 overflow-hidden relative border border-gray-100">
                  {rec.image ? (
                    <img src={rec.image} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-extrabold text-[#070f2b] line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                  {rec.name}
                </h3>
                <Price amount={rec.price} className="text-lg font-black text-blue-600" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container mx-auto py-32 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <Skeleton className="aspect-square rounded-[3rem] w-full" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="aspect-square rounded-2xl" />
          </div>
        </div>
        <div className="space-y-10">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-6 w-2/3 rounded-xl" />
          </div>
          <Skeleton className="h-16 w-1/3 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-[2.5rem]" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
