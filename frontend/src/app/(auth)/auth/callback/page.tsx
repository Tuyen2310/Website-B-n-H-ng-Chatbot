"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Bot, Loader2 } from "lucide-react";
import { Suspense } from "react";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth(user, token);
        localStorage.setItem("token", token);
        toast.success("Đăng nhập Google thành công!");
        
        if (user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } catch (err) {
        toast.error("Đã xảy ra lỗi khi xác thực thông tin từ Google.");
        router.push("/login");
      }
    } else {
      toast.error("Thông tin đăng nhập không hợp lệ.");
      router.push("/login");
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-[#070f2b] shadow-lg">
          <Bot className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-xl font-extrabold text-[#070f2b]">Đang hoàn tất đăng nhập...</h2>
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50/50 font-semibold text-gray-500">Đang tải...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
