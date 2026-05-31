"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Save, 
  User as UserIcon,
  Shield,
  Mail,
  Lock,
  Phone,
  MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "USER"
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Tạo tài khoản thành công!");
      router.push("/admin/users");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Tạo tài khoản thất bại.")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-12 w-12 bg-white shadow-sm border border-gray-100"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Thêm tài khoản mới</h1>
            <p className="text-gray-400 font-medium italic">Tạo hồ sơ người dùng hoặc quản trị viên mới.</p>
          </div>
        </div>
        <Button 
          className="rounded-xl h-12 px-8 font-black gap-2 shadow-xl shadow-primary/20"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          <Save className="h-5 w-5" />
          {createMutation.isPending ? "Đang lưu..." : "Lưu tài khoản"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                    <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-primary" /> Thông tin cá nhân
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Họ và tên</Label>
                        <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required 
                            className="rounded-xl h-14 bg-gray-50 border-none text-lg font-bold"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input 
                                    type="email"
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required 
                                    className="rounded-xl h-14 bg-gray-50 border-none pl-12 font-bold"
                                    placeholder="example@gmail.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Số điện thoại</Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="rounded-xl h-14 bg-gray-50 border-none pl-12 font-bold"
                                    placeholder="0912345678"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Địa chỉ liên hệ</Label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                            <Input 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="rounded-xl h-14 bg-gray-50 border-none pl-12 font-bold"
                                placeholder="Số nhà, đường, quận, thành phố..."
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                    <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" /> Bảo mật & Quyền
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Mật khẩu ban đầu</Label>
                        <Input 
                            type="password"
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required 
                            className="rounded-xl h-14 bg-gray-50 border-none font-bold"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Vai trò hệ thống</Label>
                        <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v || "USER"})}>
                            <SelectTrigger className="rounded-xl h-14 bg-gray-50 border-none font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="USER">Người dùng (Khách hàng)</SelectItem>
                                <SelectItem value="ADMIN">Quản trị viên (Admin)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
