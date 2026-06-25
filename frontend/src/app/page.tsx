"use client";

import { Button } from "@/components/ui/button";
import { Bot, ShoppingBag, Zap, ShieldCheck, Headphones, ArrowRight, Star, TrendingUp } from "lucide-react";
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
    queryFn: () => catalogApi.getProducts({ limit: 8 }),
  });

  const trendingProducts = productsData?.items || [];
  
  const { data: publicSettings } = useQuery<PublicSettings>({
    queryKey: ["public-settings"],
    queryFn: publicApi.getPublicSettings,
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [flashSaleStatus, setFlashSaleStatus] = useState<"INACTIVE" | "UPCOMING" | "ACTIVE" | "EXPIRED">("INACTIVE");

  useEffect(() => {
    const flashSale = publicSettings?.flashSale;
    if (!flashSale?.startTime || !flashSale?.endTime) {
      setFlashSaleStatus("INACTIVE");
      setMounted(true);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(flashSale.startTime!);
      const end = new Date(flashSale.endTime!);

      let targetDate: Date;
      let status: "INACTIVE" | "UPCOMING" | "ACTIVE" | "EXPIRED";

      if (now < start) {
        status = "UPCOMING";
        targetDate = start;
      } else if (now >= start && now <= end) {
        status = "ACTIVE";
        targetDate = end;
      } else {
        status = "EXPIRED";
        return { diff: 0, status };
      }

      const diff = targetDate.getTime() - now.getTime();
      return { diff, status };
    };

    const updateTimer = () => {
      const res = calculateTimeLeft();
      setFlashSaleStatus(res.status);
      
      if (res.status === "EXPIRED" || !res.diff || res.diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const diff = res.diff;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    setMounted(true);

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [publicSettings]);

  const bannerImage = mounted && publicSettings?.general?.banner ? publicSettings.general.banner : "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000";

  const addItemToCart = (product: any) => {
    const isFlashSaleActive = flashSaleStatus === "ACTIVE";
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
      {/* Hero Section - Vibrant Glassmorphism */}
      <section className="hero-wrapper">
        <div className="hero-glow-blob"></div>
        <div className="hero-glow-blob-2"></div>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/90 via-slate-50/70 to-transparent dark:from-slate-950/95 dark:via-slate-950/80 dark:to-slate-900/40 z-10" />
          {bannerImage && (
            <img 
               src={bannerImage} 
               alt="Hero Background" 
               className="absolute inset-0 w-full h-full object-cover object-right"
            />
          )}
        </div>
        
        <div className="container mx-auto px-6 relative z-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl animate-fade-in-up">
              <span className="hero-badge animate-float-slow">
                <Zap className="h-4 w-4 fill-current text-blue-500" /> Tương lai của công nghệ
              </span>
              <h1 className="hero-main-title dark:text-white">
                {mounted && publicSettings?.general?.shopName ? publicSettings.general.shopName : "CommercePro"} <br />
                <span className="text-gradient-accent">kỷ nguyên số.</span>
              </h1>
              <p className="hero-desc">
                {mounted && publicSettings?.general?.tagline ? publicSettings.general.tagline : "Đắm chìm trong không gian mua sắm công nghệ đỉnh cao. Trải nghiệm những thiết bị tiên tiến nhất với dịch vụ hoàn hảo."}
              </p>
              <div className="flex flex-wrap items-center gap-6 mt-8">
                <Link href="/shop">
                  <Button className="hero-btn btn-glow text-white flex items-center justify-center border-0">
                    Khám Phá Ngay <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="hero-avatar-group glass-premium dark:glass-premium-dark px-4 py-2 rounded-full hidden sm:flex">
                  {[1,2,3].map(i => (
                    <div key={i} className="hero-avatar bg-gray-200">
                      <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User Avatar" />
                    </div>
                  ))}
                  <div className="flex flex-col justify-center ml-4">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-current text-amber-500" />)}
                    </div>
                    <span className="text-[11px] font-black text-slate-800 dark:text-slate-300 tracking-wide mt-0.5">+50K Đánh giá</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block relative animate-float">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/30 dark:bg-blue-600/20 rounded-full blur-3xl"></div>
               <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop" alt="Hero Product" className="relative z-10 w-full h-[500px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" />
               
               {/* Floating Cards */}
               <div className="absolute top-20 -left-10 glass-premium dark:glass-premium-dark p-4 rounded-2xl z-20 flex items-center gap-4 animate-float-slow" style={{ animationDelay: '1s' }}>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Bảo hành</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">24 Tháng</p>
                  </div>
               </div>
               
               <div className="absolute bottom-20 -right-5 glass-premium dark:glass-premium-dark p-4 rounded-2xl z-20 flex items-center gap-4 animate-float-slow" style={{ animationDelay: '2s' }}>
                  <div className="h-12 w-12 bg-pink-100 dark:bg-pink-900/50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Xu hướng</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Hot nhất tuần</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Section - Neon Vibe */}
      {mounted && (flashSaleStatus === "ACTIVE" || flashSaleStatus === "UPCOMING") && (
        <section className="py-20 bg-slate-950 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <Zap className="h-12 w-12 text-red-500 fill-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                    {flashSaleStatus === "UPCOMING" ? "Sắp diễn ra" : "Flash Sale"}
                  </h2>
                </div>
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-5 py-4 rounded-[1.5rem]">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">
                    {flashSaleStatus === "UPCOMING" ? "Mở bán sau:" : "Kết thúc sau:"}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center justify-center bg-black/60 text-white font-black text-2xl w-14 h-14 rounded-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                      {timeLeft.hours.toString().padStart(2, '0')}
                      <span className="text-[9px] text-gray-100 font-bold uppercase drop-shadow-sm">Giờ</span>
                    </div>
                    <span className="text-red-400 font-black text-2xl animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">:</span>
                    <div className="flex flex-col items-center justify-center bg-black/60 text-white font-black text-2xl w-14 h-14 rounded-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                      <span className="text-[9px] text-gray-100 font-bold uppercase drop-shadow-sm">Phút</span>
                    </div>
                    <span className="text-red-400 font-black text-2xl animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">:</span>
                    <div className="flex flex-col items-center justify-center bg-red-600/30 text-red-100 font-black text-2xl w-14 h-14 rounded-xl border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                      <span className="text-[9px] text-red-100 font-bold uppercase drop-shadow-sm">Giây</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/shop?flashSale=true" className="text-white hover:text-red-400 font-black flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-wider text-sm drop-shadow-md">
                Xem tất cả deal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {isProductsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-[2rem] bg-white/10" />
                ))
              ) : trendingProducts.filter((p: any) => p.isFlashSale).slice(0, 4).map((product: any, idx: number) => {
                const discountPercent = Math.round(((product.price - product.flashSalePrice) / product.price) * 100);
                return (
                <div key={product.id} className={`bg-slate-900/80 backdrop-blur-md rounded-[2rem] p-4 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500 relative cursor-pointer border border-white/10 hover:border-red-400 hover:shadow-[0_15px_40px_-10px_rgba(239,68,68,0.5)] animate-slide-up animate-stagger-${(idx % 4) + 1}`} onClick={() => window.location.href = `/shop/${product.id}`}>
                  <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.8)] backdrop-blur-md">
                    -{discountPercent}%
                  </div>
                  <div className="aspect-square bg-slate-800 rounded-[1.5rem] mb-5 overflow-hidden relative p-4 flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img src={product.images?.[0] || "https://via.placeholder.com/400"} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_10px_20px_rgba(255,255,255,0.1)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white line-clamp-1 mb-2 group-hover:text-red-300 transition-colors drop-shadow-sm">{product.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-black text-xl drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]"><Price amount={product.flashSalePrice} /></span>
                      <span className="text-gray-300 text-xs line-through font-bold drop-shadow-sm"><Price amount={product.price} /></span>
                    </div>
                    <div className="mt-4 bg-slate-700 rounded-full h-2 w-full overflow-hidden relative border border-white/5">
                      <div className="bg-gradient-to-r from-red-500 to-yellow-400 h-full w-[85%] rounded-full absolute left-0 top-0 shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[10px] font-black text-red-300 uppercase tracking-widest drop-shadow-sm">
                        {flashSaleStatus === "UPCOMING" ? "Sắp mở bán" : "Sắp hết hàng"}
                      </p>
                      <p className="text-[10px] font-black text-white drop-shadow-sm">Đã bán 85%</p>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Categories - Glassmorphism Cards */}
      <section className="py-24 layout-padding relative">
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="animate-fade-in-up">
              <span className="text-gradient-accent font-black tracking-widest uppercase text-sm mb-2 block">Khám phá</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase mb-3">Danh mục nổi bật</h2>
              <p className="text-slate-500 dark:text-gray-400 font-semibold text-base">Hệ sinh thái sản phẩm công nghệ đa dạng và cao cấp</p>
            </div>
            <Link href="/shop" className="group flex items-center gap-3 text-white font-extrabold uppercase tracking-wider text-sm bg-slate-900 dark:bg-blue-600 px-8 py-4 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              Xem tất cả <Zap className="h-4 w-4 fill-current group-hover:text-yellow-400 transition-colors" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
            {isCatsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[420px] rounded-[1.5rem]" />
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
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" 
                />
                <div className="cat-card-overlay" />
                <div className="cat-card-content">
                  <h3 className="cat-card-title">{cat.name}</h3>
                  <div className="cat-card-explore">
                    Khám phá ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative">
        <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase text-sm mb-2 block">Thịnh hành</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase mb-4">Sản phẩm xu hướng</h2>
            <p className="text-slate-600 dark:text-gray-400 font-medium text-base max-w-2xl mx-auto">Thiết bị được săn đón nhiều nhất với công năng vượt trội và thiết kế đẳng cấp.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isProductsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-[1.5rem]" />
              ))
            ) : trendingProducts.map((product: any, idx: number) => (
              <div key={product.id} className={`prod-card-premium flex flex-col justify-between animate-slide-up animate-stagger-${(idx % 8) + 1}`}>
                <div>
                  <div className="prod-image-wrap group">
                    <img 
                      src={product.images?.[0] || "https://via.placeholder.com/400"} 
                      alt={product.name} 
                      className="w-full h-full object-contain" 
                      loading={idx < 4 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-all duration-300" />
                    <button 
                      onClick={() => addItemToCart(product)}
                      className="prod-action-btn"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                    {product.isFlashSale && (
                      <span className="prod-badge-alert">HOT</span>
                    )}
                  </div>
                  <div className="p-5">
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">4.9</span>
                      </div>
                      <span className="text-slate-300 dark:text-slate-600 text-[10px]">|</span>
                      <span className="text-[11px] text-slate-500 font-medium">Đã bán {product.soldCount || 0}</span>
                    </div>
                    {product.isFlashSale && product.flashSalePrice ? (
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-black text-red-500">
                          <Price amount={product.flashSalePrice} />
                        </p>
                        <p className="text-xs font-bold text-slate-400 line-through">
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
            ))}
          </div>
          
          <div className="mt-14 text-center">
            <Link href="/shop">
              <Button variant="outline" className="rounded-full h-14 px-10 font-bold border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:shadow-md">
                Xem Thêm Sản Phẩm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges - Premium Look */}
      <section className="py-20 border-t border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
                { icon: ShieldCheck, title: "100% Chính Hãng", desc: "Cam kết hoàn tiền gấp đôi nếu phát hiện hàng nhái", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                { icon: Zap, title: "Giao Hàng Siêu Tốc", desc: "Nhận hàng nhanh chóng từ 2-4 ngày trên toàn quốc", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
                { icon: Headphones, title: "Hỗ Trợ 24/7", desc: "Đội ngũ chuyên viên tư vấn phục vụ mọi yêu cầu", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" }
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-8 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-xl transition-all duration-500 group animate-fade-in-up border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                    <div className={`h-20 w-20 rounded-[1.5rem] ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        <item.icon className={`h-10 w-10 ${item.color}`} />
                    </div>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-3">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}
