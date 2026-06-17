"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Bot, LogIn, Mail, Lock, ArrowRight } from "lucide-react";

import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const redirect = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setAuth(response.user, response.access_token);
      localStorage.setItem("token", response.access_token);
      toast.success("Đăng nhập thành công!");
      
      // Smart redirect logic
      if (response.user.role === "ADMIN") {
        // Admins can go to redirect target or /admin
        router.push(redirect || "/admin");
      } else {
        // Normal users should NOT go to admin paths even if redirected
        const safeRedirect = (redirect && !redirect.startsWith("/admin")) ? redirect : "/";
        router.push(safeRedirect);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
      
      <Card className="w-full max-w-md shadow-2xl border-none rounded-3xl overflow-hidden animate-fade-in-up">
        <CardHeader className="bg-gradient-to-br from-[#070f2b] to-[#1d2d5f] text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-[#070f2b] shadow-lg">
              <Bot className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight mb-2">Chào mừng trở lại</CardTitle>
          <CardDescription className="text-blue-100/80 font-semibold">
            Đăng nhập vào hệ thống SmartShop của bạn
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-12 rounded-xl input-premium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold text-gray-700">Mật khẩu</Label>
                <Link href="#" className="text-xs text-blue-600 hover:underline font-bold">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 rounded-xl input-premium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-extrabold shadow-lg shadow-blue-600/30 bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              {!isLoading && <LogIn className="ml-2 h-5 w-5" />}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="p-8 pt-0 flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-bold">Hoặc</span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline"
            className="w-full h-12 rounded-xl text-base font-extrabold bg-white hover:bg-gray-50 text-gray-700 hover:scale-[1.01] transition-all"
            onClick={() => window.location.href = 'http://smartshop.local:3001/api/auth/google'}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
            Đăng nhập bằng Google
          </Button>

          <p className="text-center text-sm text-gray-500 font-semibold">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline inline-flex items-center">
              Đăng ký ngay <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-semibold text-gray-500">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
