"use client";

import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Shield, Save, Key, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'password') {
      setActiveTab('password');
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otpCode: "",
  });
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
    } else if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, isAuthenticated, router]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => catalogApi.updateMe(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success("Cập nhật thông tin thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật.");
    }
  });

  const passwordMutation = useMutation({
    mutationFn: (data: any) => catalogApi.changePassword(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "", otpCode: "" });
      setIsOtpSent(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpSent) {
      toast.error("Vui lòng nhận mã OTP trước khi đổi mật khẩu.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    passwordMutation.mutate({
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
      otpCode: passwordData.otpCode,
    });
  };

  const sendOtpMutation = useMutation({
    mutationFn: () => catalogApi.sendOtp(),
    onSuccess: (res) => {
      setIsOtpSent(true);
      toast.success(res.message || "Đã gửi mã OTP!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi gửi OTP.");
    }
  });

  if (!isAuthenticated || !user) return null;

  return (
    <div className="container mx-auto py-32 px-4 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100/50 text-center">
            <div className="h-24 w-24 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center text-blue-600 font-extrabold text-3xl shadow-inner mb-6">
              {user.name?.[0]}
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">{user.name}</h2>
            <div className="flex flex-col items-center gap-2">
              <Badge className="bg-blue-50 text-blue-600 border-none rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest">
                {user.role}
              </Badge>
              {user.role !== 'ADMIN' && (
                <div className="flex items-center gap-1.5 mt-2 bg-yellow-50 text-yellow-600 px-4 py-1.5 rounded-xl border border-yellow-100 shadow-sm">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 animate-pulse" />
                  <span className="font-black text-sm">{user.points || 0} Điểm thưởng</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100/50 overflow-hidden">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-blue-50/50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <User className="h-4 w-4" /> Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 font-bold text-sm transition-all ${activeTab === 'password' ? 'bg-blue-50/50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Key className="h-4 w-4" /> Đổi mật khẩu
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter">
                {activeTab === 'profile' ? 'Cài đặt tài khoản' : 'Bảo mật tài khoản'}
              </CardTitle>
              <p className="text-gray-400 text-sm font-semibold leading-relaxed mt-1">
                {activeTab === 'profile' ? 'Quản lý thông tin công khai và địa chỉ giao hàng.' : 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn.'}
              </p>
            </CardHeader>
            <CardContent className="p-8">
              {activeTab === 'profile' ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <User className="h-3 w-3" /> Họ và tên
                      </Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold input-premium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Mail className="h-3 w-3" /> Địa chỉ Email
                      </Label>
                      <Input
                        value={formData.email}
                        disabled
                        className="h-12 px-4 rounded-xl bg-gray-50 border-none opacity-50 font-bold cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Phone className="h-3 w-3" /> Số điện thoại
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Chưa cập nhật"
                        className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold input-premium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Shield className="h-3 w-3" /> Vai trò hệ thống
                      </Label>
                      <Input
                        value={user.role}
                        disabled
                        className="h-12 px-4 rounded-xl bg-gray-50 border-none opacity-50 font-black tracking-widest uppercase text-[10px] cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Địa chỉ giao hàng mặc định
                    </Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Nhập địa chỉ của bạn..."
                      className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold input-premium"
                    />
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="h-14 px-10 rounded-2xl font-extrabold uppercase tracking-wider gap-2 shadow-xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] transition-transform"
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-5 w-5" />
                      {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-8 max-w-md">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Key className="h-3 w-3" /> Mật khẩu hiện tại
                    </Label>
                    <Input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold input-premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Key className="h-3 w-3" /> Mật khẩu mới
                    </Label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold input-premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Key className="h-3 w-3" /> Xác nhận mật khẩu mới
                    </Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold input-premium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
                      <span className="flex items-center gap-2"><Key className="h-3 w-3" /> Mã xác thực OTP (Email)</span>
                      {!isOtpSent && (
                        <button type="button" onClick={() => sendOtpMutation.mutate()} disabled={sendOtpMutation.isPending} className="text-blue-600 hover:text-blue-700">
                          {sendOtpMutation.isPending ? "Đang gửi..." : "Nhận mã OTP"}
                        </button>
                      )}
                    </Label>
                    <Input
                      type="text"
                      placeholder="Nhập 6 chữ số OTP"
                      value={passwordData.otpCode}
                      onChange={(e) => setPasswordData({ ...passwordData, otpCode: e.target.value })}
                      className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold input-premium"
                      disabled={!isOtpSent}
                    />
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="h-14 px-10 rounded-2xl font-extrabold uppercase tracking-wider gap-2 shadow-xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] transition-transform"
                      disabled={passwordMutation.isPending}
                    >
                      <Key className="h-5 w-5" />
                      {passwordMutation.isPending ? "Đang cập nhật..." : "Đổi mật khẩu ngay"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

