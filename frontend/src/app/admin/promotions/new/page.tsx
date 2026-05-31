"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Save,
  Ticket,
  Calendar,
  Percent,
  Hash
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Switch from "@/components/ui/switch";

export default function NewPromotionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast.success("Tạo mã giảm giá thành công!");
      router.push("/admin/promotions");
    },
    onError: () => toast.error("Có lỗi xảy ra khi tạo mã.")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      discountPercent: parseFloat(formData.discountPercent),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    };
    createMutation.mutate(data);
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
            <h1 className="text-3xl font-black tracking-tighter uppercase">Tạo mã giảm giá</h1>
            <p className="text-gray-400 font-medium italic">Thiết lập chương trình ưu đãi mới cho cửa hàng.</p>
          </div>
        </div>
        <Button
          className="rounded-xl h-12 px-8 font-black gap-2 shadow-xl shadow-primary/20"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          <Save className="h-5 w-5" />
          {createMutation.isPending ? "Đang tạo..." : "Lưu mã giảm giá"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" /> Thông tin mã Voucher
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Mã định danh (Code)</Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="rounded-xl h-14 bg-gray-50 border-none pl-12 text-xl font-black tracking-widest uppercase"
                    placeholder="SUMMER2026"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Phần trăm giảm (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    required
                    className="rounded-xl h-14 bg-gray-50 border-none pl-12 text-xl font-black"
                    placeholder="10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Thời hạn áp dụng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="rounded-xl h-14 bg-gray-50 border-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="rounded-xl h-14 bg-gray-50 border-none font-bold"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-black uppercase">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold">Kích hoạt ngay</p>
                <p className="text-xs text-gray-400">Cho phép áp dụng mã ngay lập tức.</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v: boolean) => setFormData({ ...formData, isActive: v })}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
