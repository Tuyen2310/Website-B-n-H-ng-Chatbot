"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import { useSettingsStore } from "@/store/settingsStore";
import { useSocket } from "@/hooks/use-socket";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");
  const showNavbar = !isAdminPage && !isAuthPage;

  const { setCurrency, setPublicSettings } = useSettingsStore();

  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: publicApi.getPublicSettings,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (publicSettings) {
      setPublicSettings(publicSettings);
      if (publicSettings.general?.currency) {
        setCurrency(publicSettings.general.currency);
      }
    }
  }, [publicSettings, setCurrency, setPublicSettings]);

  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('order_status_update', (data) => {
        toast.info(data.message);
      });
      socket.on('admin_new_order', (data) => {
        if (isAdminPage) {
          toast.success(data.message);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('order_status_update');
        socket.off('admin_new_order');
      }
    };
  }, [socket, isAdminPage]);

  if (publicSettings?.security?.maintenance && !isAdminPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100/50">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black uppercase text-gray-900 tracking-tight">Hệ thống đang bảo trì</h1>
          <p className="text-gray-500 font-medium">Chúng tôi đang tiến hành nâng cấp hệ thống để mang lại trải nghiệm tốt hơn. Vui lòng quay lại sau ít phút nhé!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={isAdminPage ? "" : "grow"}>{children}</main>
      {showNavbar && <Footer />}
      {showNavbar && <ChatbotWidget />}
      <Toaster position="top-right" />
    </>
  );
}
