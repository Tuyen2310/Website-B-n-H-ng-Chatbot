"use client";

import { Button } from "@/components/ui/button";
import { Bot, ShoppingBag, Zap, ShieldCheck, Headphones, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { catalogApi, publicApi, PublicSettings } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { Price } from "@/components/ui/price";
import { useState, useEffect } from "react";

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);

  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: catalogApi.getCategories,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["trending-products"],
    queryFn: () => catalogApi.getProducts({ limit: 4 }),
  });

  const trendingProducts = productsData?.items || [];
  
  const { data: publicSettings } = useQuery<PublicSettings>({
    queryKey: ["public-settings"],
    queryFn: publicApi.getPublicSettings,
  });

  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bannerImage = publicSettings?.general?.banner || "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2000";

  const addItemToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const categoryImages: Record<string, string> = {
    "Điện thoại": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
    "Laptop": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000",
    "Âm thanh": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000",
    "Đồng hồ": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000",
    "Màn hình": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000",
    "Phụ kiện": "https://images.unsplash.com/photo-1619134769735-4765677ee94b?q=80&w=1000",
    "Gaming Gear": "https://images.unsplash.com/photo-1615663248861-273213abb44e?q=80&w=1000",
    "Tablet": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000",
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Modern Banner */}
      <section className="hero-wrapper">
        <div className="hero-glow-blob"></div>
        <div className="hero-glow-blob-2"></div>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent z-10" />
          {bannerImage && (
            <img 
               src={bannerImage} 
               alt="Hero Background" 
               className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="hero-badge">
              <Zap className="h-4 w-4 fill-current" /> Xu hướng công nghệ mới
            </span>
            <h1 className="hero-main-title dark:text-white">
              {publicSettings?.general?.shopName || "CommercePro"} <br />
              <span className="text-gradient-accent italic">đỉnh cao.</span>
            </h1>
            <p className="hero-desc dark:text-gray-300">
              {publicSettings?.general?.tagline || "Khám phá hệ sinh thái công nghệ vượt trội từ CommercePro. Mỗi thiết bị được chế tác để nâng tầm cuộc sống thông minh của bạn."}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/shop">
                <Button className="hero-btn btn-glow bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center">
                  Mua Sắm Ngay <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="hero-avatar-group">
                {[1,2,3,4].map(i => (
                  <div key={i} className="hero-avatar bg-gray-200">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User Avatar" />
                  </div>
                ))}
                <div className="flex flex-col justify-center ml-6">
                  <div className="flex gap-1 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current text-amber-400" />)}
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hơn 10k+ Đánh Giá</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-500 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <Zap className="h-10 w-10 text-yellow-300 fill-yellow-300 animate-pulse" />
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase italic">Flash Sale</h2>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl">
                <div className="flex flex-col items-center justify-center bg-white text-red-600 font-black text-xl w-12 h-12 rounded-xl shadow-inner">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <span className="text-white font-bold text-2xl">:</span>
                <div className="flex flex-col items-center justify-center bg-white text-red-600 font-black text-xl w-12 h-12 rounded-xl shadow-inner">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <span className="text-white font-bold text-2xl">:</span>
                <div className="flex flex-col items-center justify-center bg-white text-red-600 font-black text-xl w-12 h-12 rounded-xl shadow-inner">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
              </div>
            </div>
            <Link href="/shop" className="text-white font-bold flex items-center gap-2 hover:gap-4 transition-all">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {isProductsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-3xl bg-white/20" />
              ))
            ) : trendingProducts.map((product: any) => (
              <div key={product.id} className="bg-white rounded-3xl p-4 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-300 shadow-2xl shadow-black/20 relative cursor-pointer" onClick={() => window.location.href = `/shop/${product.id}`}>
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-md">
                  -20%
                </div>
                <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden relative">
                  <img src={product.images?.[0] || "https://via.placeholder.com/400"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-red-500 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-black text-lg"><Price amount={product.price * 0.8} /></span>
                    <span className="text-gray-400 text-xs line-through"><Price amount={product.price} /></span>
                  </div>
                  <div className="mt-3 bg-red-100 rounded-full h-2 w-full overflow-hidden relative">
                    <div className="bg-red-500 h-full w-[85%] rounded-full absolute left-0 top-0"></div>
                  </div>
                  <p className="text-[10px] text-center font-bold text-red-500 mt-1 uppercase tracking-widest">Đã bán 85%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Featured Categories */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#070f2b] dark:text-white tracking-tight uppercase mb-3">Danh mục nổi bật</h2>
              <p className="text-gray-400 font-semibold text-base md:text-lg">Khám phá các dòng sản phẩm công nghệ thịnh hành nhất</p>
            </div>
            <Link href="/shop" className="group flex items-center gap-3 text-blue-600 font-extrabold uppercase tracking-wider text-xs md:text-sm bg-white px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md hover:bg-blue-600 hover:text-white transition-all duration-300">
              Tất cả danh mục <Zap className="h-4 w-4 fill-current group-hover:animate-bounce" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {isCatsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))
            ) : categories?.slice(0, 4).map((cat: any, idx: number) => (
              <Link 
                key={cat.id} 
                href={`/shop?category=${cat.id}`}
                className={`cat-card animate-slide-up animate-stagger-${(idx % 4) + 1} ${idx === 0 ? 'md:col-span-2' : ''}`}
              >
                <Image 
                  src={categoryImages[cat.name] || "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000"} 
                  alt={cat.name} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="cat-card-overlay" />
                <div className="cat-card-content">
                  <h3 className="cat-card-title">{cat.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="cat-card-explore">
                      Khám phá
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase mb-4">Sản phẩm xu hướng</h2>
            <p className="text-slate-600 dark:text-gray-300 font-semibold text-base md:text-lg max-w-xl mx-auto">Những thiết bị công nghệ hàng đầu được khách hàng yêu thích và lựa chọn nhiều nhất trong tuần.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {isProductsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-3xl" />
              ))
            ) : trendingProducts.map((product: any, idx: number) => (
              <div key={product.id} className={`prod-card-premium flex flex-col justify-between animate-slide-up animate-stagger-${(idx % 4) + 1}`}>
                <div>
                  <div className="prod-image-wrap">
                    <img 
                      src={product.images?.[0] || "https://via.placeholder.com/400"} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading={idx === 0 ? "eager" : "lazy"}
                      fetchPriority={idx === 0 ? "high" : "low"}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                    <button 
                      onClick={() => addItemToCart(product)}
                      className="prod-action-btn"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4 dark:bg-slate-900">
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{product.name}</h3>
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
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 border-t border-gray-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12">
            {[
                { icon: ShieldCheck, title: "100% Chính Hãng", desc: "Cam kết hoàn tiền gấp đôi nếu phát hiện hàng nhái" },
                { icon: Zap, title: "Giao Hàng Siêu Tốc", desc: "Nhận hàng nhanh chóng từ 2-4 ngày trên toàn quốc" },
                { icon: Headphones, title: "Hỗ Trợ 24/7", desc: "Đội ngũ chuyên viên tư vấn phục vụ mọi yêu cầu" }
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all duration-500 group animate-fade-in-up">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <item.icon className="h-8 w-8 dark:text-white group-hover:text-white" />
                    </div>
                    <h4 className="text-lg font-extrabold text-[#070f2b] dark:text-white uppercase tracking-tight mb-2">{item.title}</h4>
                    <p className="text-gray-400 font-semibold text-xs md:text-sm">{item.desc}</p>
                </div>
            ))}
        </div>
      </section>


    </div>
  );
}
