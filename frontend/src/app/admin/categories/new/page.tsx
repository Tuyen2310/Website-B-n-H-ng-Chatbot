"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Save, 
  Menu
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Thêm danh mục thành công!");
      router.push("/admin/categories");
    },
    onError: () => toast.error("Có lỗi xảy ra khi thêm danh mục.")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-20">
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
            <h1 className="text-3xl font-black tracking-tighter uppercase">Thêm danh mục mới</h1>
            <p className="text-gray-400 font-medium italic">Phân loại sản phẩm của bạn.</p>
          </div>
        </div>
        <Button 
          className="rounded-xl h-12 px-8 font-black gap-2 shadow-xl shadow-primary/20"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          <Save className="h-5 w-5" />
          {createMutation.isPending ? "Đang lưu..." : "Lưu danh mục"}
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
        <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                <Menu className="h-5 w-5 text-primary" /> Thông tin danh mục
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-sm text-gray-500 uppercase tracking-widest">Tên danh mục</Label>
                <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                    className="rounded-xl h-14 bg-gray-50 border-none text-lg font-bold"
                    placeholder="Ví dụ: Điện thoại, Laptop..."
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-sm text-gray-500 uppercase tracking-widest">Mô tả</Label>
                <Textarea 
                    id="description" 
                    rows={5} 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="rounded-2xl bg-gray-50 border-none text-base p-6"
                    placeholder="Nhập mô tả ngắn gọn về danh mục này..."
                />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
