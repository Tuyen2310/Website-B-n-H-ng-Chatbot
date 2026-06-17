"use client";

import { useQuery } from "@tanstack/react-query";
import { publicApi, PublicSettings } from "@/lib/api";
import { Mail, Phone, MapPin, MessageCircle, Share2, Camera, Bot } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const { data: settings } = useQuery<PublicSettings>({
    queryKey: ["public-settings"],
    queryFn: publicApi.getPublicSettings,
  });

  const shopName = settings?.general?.shopName || "CommercePro";
  const tagline = settings?.general?.tagline || "Nâng tầm trải nghiệm công nghệ.";
  const address = settings?.general?.address || "123 Đường Công Nghệ, TP. Hồ Chí Minh";
  const email = settings?.general?.email || "contact@commercepro.vn";
  const phone = settings?.general?.phone || "0123 456 789";

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-24 pb-12 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-3">
              {(settings as any)?.general?.logo ? (
                <img src={(settings as any).general.logo} alt={shopName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">{shopName}</span>
            </Link>
            <p className="text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
              {tagline}
            </p>
            <div className="flex gap-4">
              {settings?.general?.facebook && (
                <a href={settings.general.facebook} className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center hover:bg-primary transition-all group">
                  <MessageCircle className="h-5 w-5 text-slate-500 dark:text-gray-400 group-hover:text-white" />
                </a>
              )}
              {settings?.general?.instagram && (
                <a href={settings.general.instagram} className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center hover:bg-primary transition-all group">
                  <Camera className="h-5 w-5 text-slate-500 dark:text-gray-400 group-hover:text-white" />
                </a>
              )}
              {settings?.general?.twitter && (
                <a href={settings.general.twitter} className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center hover:bg-primary transition-all group">
                  <Share2 className="h-5 w-5 text-slate-500 dark:text-gray-400 group-hover:text-white" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-slate-900 dark:text-white">Khám phá</h4>
            <ul className="space-y-4">
              <li><Link href="/shop" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm">Cửa hàng</Link></li>
              <li><Link href="/shop?category=1" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm">Điện thoại</Link></li>
              <li><Link href="/shop?category=2" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm">Laptop</Link></li>
              <li><Link href="/shop?category=3" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm">Phụ kiện</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-slate-900 dark:text-white">Chính sách</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm">Vận chuyển</Link></li>
              <li><Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm">Đổi trả 30 ngày</Link></li>
              <li><Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm">Bảo mật thông tin</Link></li>
              <li><Link href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-slate-900 dark:text-white">Liên hệ</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <MapPin className="h-5 w-5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 text-sm font-bold">{address}</span>
              </div>
              <div className="flex gap-4">
                <Mail className="h-5 w-5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 text-sm font-bold">{email}</span>
              </div>
              <div className="flex gap-4">
                <Phone className="h-5 w-5 text-slate-500 dark:text-slate-300 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-300 text-sm font-bold">{phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 dark:text-gray-500 text-xs font-black uppercase tracking-widest">
            © 2026 {shopName}. All rights reserved.
          </p>
          <div className="flex gap-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
}
