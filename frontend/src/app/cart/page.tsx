"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Price } from "@/components/ui/price";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getVolumeDiscountPercent } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-32 px-6 text-center max-w-lg">
        <div className="flex justify-center mb-10">
          <div className="h-32 w-32 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 shadow-inner animate-pulse">
            <ShoppingBag className="h-16 w-16" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#070f2b] mb-4">GIỎ HÀNG TRỐNG</h1>
        <p className="text-gray-400 font-semibold mb-12 leading-relaxed">Có vẻ như bạn chưa chọn được sản phẩm ưng ý. Hãy tiếp tục mua sắm để khám phá những thiết bị công nghệ mới nhất!</p>
        <Link href="/shop">
          <Button size="lg" className="h-14 px-10 rounded-2xl font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-transform">
            Tiếp tục mua sắm
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-32 px-6 max-w-6xl">
      <div className="cart-header-section animate-fade-in-up">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight uppercase text-[#070f2b]">Giỏ hàng của bạn</h1>
        <span className="bg-blue-50 text-blue-600 font-extrabold px-5 py-2 rounded-full text-xs md:text-sm shadow-sm">
          {items.length} sản phẩm
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in-up">
          {items.map((item) => (
            <div key={item.id} className="cart-item-card-row p-6 flex flex-col sm:flex-row gap-6 items-center">
              <div className="cart-item-thumb">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 w-full flex flex-col justify-between py-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2">{item.name}</h3>
                    <p className="text-xl font-extrabold text-[#070f2b]"><Price amount={item.price} /></p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(item.id)}
                    className="h-10 w-10 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                  <div className="cart-qty-counter">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-white text-gray-500" 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-10 text-center font-extrabold text-sm">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-white text-gray-500" 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Thành tiền</p>
                    <p className="text-lg font-extrabold text-blue-600"><Price amount={item.price * item.quantity} /></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 animate-fade-in-up">
          <Card className="summary-panel-card sticky top-32">
            <CardHeader className="summary-header">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="summary-body space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">Tạm tính</span>
                  <span className="text-gray-900 font-extrabold dark:text-slate-100">
                    <Price amount={items.reduce((acc, item) => acc + item.price * item.quantity, 0)} />
                  </span>
                </div>
                {getVolumeDiscountPercent() > 0 && (
                  <div className="flex justify-between text-sm font-bold animate-fade-in">
                    <span className="text-red-500 flex items-center gap-1">
                      <Zap className="h-4 w-4" /> Mua nhiều giảm nhiều ({getVolumeDiscountPercent() * 100}%)
                    </span>
                    <span className="text-red-500 font-extrabold">
                      - <Price amount={items.reduce((acc, item) => acc + item.price * item.quantity, 0) * getVolumeDiscountPercent()} />
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400">Vận chuyển</span>
                  <span className="text-green-600 font-extrabold">Miễn phí</span>
                </div>
              </div>
              
              <Separator className="bg-gray-100 dark:bg-slate-800" />
              
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-black uppercase tracking-tighter">Tổng cộng</span>
                <span className="text-3xl font-black text-gray-900"><Price amount={getTotal()} /></span>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  Bảo mật thanh toán 100%
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                  <Truck className="h-5 w-5 text-blue-500" />
                  Giao hàng toàn quốc
                </div>
              </div>
            </CardContent>
            <CardFooter className="summary-body pt-0">
              <Link href="/checkout" className="w-full">
                <Button className="w-full h-16 rounded-2xl text-lg font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 hover:scale-[1.01] transition-transform" size="lg">
                  Tiến hành thanh toán
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
