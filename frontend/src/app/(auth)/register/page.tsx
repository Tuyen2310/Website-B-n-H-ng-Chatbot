"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Bot, UserPlus, Mail, Lock, User, Phone, MapPin, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.register(formData);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 py-12">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
      
      <Card className="w-full max-w-lg shadow-2xl border-none rounded-3xl overflow-hidden animate-fade-in-up">
        <CardHeader className="bg-gradient-to-br from-[#070f2b] to-[#1d2d5f] text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-[#070f2b] shadow-lg">
              <UserPlus className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight mb-2">Tạo tài khoản mới</CardTitle>
          <CardDescription className="text-blue-100/80 font-semibold">
            Tham gia cộng đồng mua sắm thông minh ngay hôm nay
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-gray-700">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input 
                    id="name" 
                    placeholder="Nguyễn Văn A" 
                    className="pl-10 h-12 rounded-xl input-premium"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold text-gray-700">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input 
                    id="phone" 
                    placeholder="09xx xxx xxx" 
                    className="pl-10 h-12 rounded-xl input-premium"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-12 rounded-xl input-premium"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-gray-700">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Tối thiểu 6 ký tự" 
                  className="pl-10 h-12 rounded-xl input-premium"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="font-bold text-gray-700">Địa chỉ</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input 
                  id="address" 
                  placeholder="Số nhà, đường, quận/huyện..." 
                  className="pl-10 h-12 rounded-xl input-premium"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-extrabold shadow-lg shadow-blue-600/30 bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] transition-all mt-4" 
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="p-8 pt-0 flex flex-col space-y-4">
          <p className="text-center text-sm text-gray-500 font-semibold">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline inline-flex items-center">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
