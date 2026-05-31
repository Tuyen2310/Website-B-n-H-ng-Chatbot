"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  MapPin,
  Trash2,
  Lock as LockIcon,
  Unlock
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "USER"
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers(),
  });

  const userList = usersData?.items || [];
  const user = userList.find((u: any) => u.id.toString() === id);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Cập nhật thành công!");
      router.push("/admin/users");
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật.")
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUser(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Đã xóa tài khoản.");
      router.push("/admin/users");
    },
    onError: () => toast.error("Không thể xóa tài khoản này.")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...formData };
    if (!payload.password) delete payload.password;
    updateMutation.mutate(payload);
  };

  const handleToggleBlock = () => {
    if (!user) return;
    updateMutation.mutate({ isBlocked: !user.isBlocked });
  };

  if (isLoading) return <EditUserSkeleton />;
  if (!user) return <div className="p-20 text-center">Không tìm thấy người dùng.</div>;

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
            <h1 className="text-3xl font-black tracking-tighter uppercase">Chỉnh sửa tài khoản</h1>
            <p className="text-gray-400 font-medium italic">ID: #{id} — {user.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            className="rounded-xl h-12 font-bold px-6 text-red-500 hover:bg-red-50" 
            onClick={() => {
                if (confirm("Bạn có chắc muốn xóa tài khoản này?")) {
                    deleteMutation.mutate();
                }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Xóa
          </Button>
          <Button 
            className="rounded-xl h-12 px-8 font-black gap-2 shadow-xl shadow-primary/20"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            <Save className="h-5 w-5" />
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
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
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Email (Không thể đổi)</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                <Input 
                                    value={formData.email} 
                                    disabled
                                    className="rounded-xl h-14 bg-gray-50/50 border-none pl-12 font-bold text-gray-400"
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
                        <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Mật khẩu mới (Để trống nếu không đổi)</Label>
                        <Input 
                            type="password"
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
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

                    <div className="pt-6 border-t border-gray-50">
                         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái tài khoản</p>
                                <p className={`font-black ${user.isBlocked ? 'text-red-500' : 'text-green-600'}`}>
                                    {user.isBlocked ? 'Đang bị khóa' : 'Đang hoạt động'}
                                </p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`rounded-xl ${user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                                onClick={handleToggleBlock}
                            >
                                {user.isBlocked ? <Unlock className="h-5 w-5" /> : <LockIcon className="h-5 w-5" />}
                            </Button>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function EditUserSkeleton() {
    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            <Skeleton className="h-20 w-1/2 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="h-[500px] lg:col-span-2 rounded-[2.5rem]" />
                <Skeleton className="h-[400px] rounded-[2.5rem]" />
            </div>
        </div>
    );
}
