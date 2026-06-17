"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Save,
  Ticket,
  Calendar,
  Percent,
  Hash,
  Trash2
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Switch from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPromotionPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    isActive: true
  });

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: () => adminApi.getPromotions(),
  });

  const promo = promotions?.items?.find((p: any) => p.id.toString() === id);

  useEffect(() => {
    if (promo) {
      setFormData({
        code: promo.code,
        discountPercent: promo.discountPercent ? promo.discountPercent.toString() : "",
        startDate: promo.startDate ? promo.startDate.split('T')[0] : "",
        endDate: promo.endDate ? promo.endDate.split('T')[0] : "",
        isActive: promo.isActive
      });
    }
  }, [promo]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updatePromotion(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast.success("Cập nhật thành công!");
      router.push("/admin/promotions");
    },
    onError: () => toast.error("Có lỗi xảy ra.")
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deletePromotion(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast.success("Đã xóa mã giảm giá.");
      router.push("/admin/promotions");
    },
    onError: () => toast.error("Không thể xóa mã này.")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      discountPercent: parseFloat(formData.discountPercent),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    };
    updateMutation.mutate(data);
  };

  if (isLoading) return <div className="p-20"><Skeleton className="h-40 w-full rounded-[2.5rem]" /></div>;
  if (!promo) return <div className="p-20 text-center font-bold">Không tìm thấy mã giảm giá.</div>;

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
            <h1 className="text-3xl font-black tracking-tighter uppercase">Chỉnh sửa Voucher</h1>
            <p className="text-gray-400 font-medium italic">ID: #{id} — {promo.code}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="rounded-xl h-12 font-bold px-6 text-red-500 hover:bg-red-50"
            onClick={() => {
              if (confirm("Bạn có chắc muốn xóa mã này?")) {
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
                <p className="font-bold">Đang kích hoạt</p>
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
