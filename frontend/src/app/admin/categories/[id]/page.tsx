"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogApi, adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Save, 
  Menu,
  Trash2
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => catalogApi.getCategories(),
  });

  useEffect(() => {
    if (categories) {
      const cat = categories.find((c: any) => c.id.toString() === id);
      if (cat) {
        setFormData({
          name: cat.name,
          description: cat.description || ""
        });
      }
    }
  }, [categories, id]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateCategory(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Cập nhật thành công!");
      router.push("/admin/categories");
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật.")
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteCategory(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Đã xóa danh mục.");
      router.push("/admin/categories");
    },
    onError: () => toast.error("Không thể xóa danh mục này.")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!categories) return <EditCategorySkeleton />;

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
            <h1 className="text-3xl font-black tracking-tighter uppercase">Chỉnh sửa danh mục</h1>
            <p className="text-gray-400 font-medium italic">ID: #{id} — Cập nhật thông tin phân loại.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            className="rounded-xl h-12 font-bold px-6 text-red-500 hover:bg-red-50" 
            onClick={() => {
                if (confirm("Bạn có chắc muốn xóa danh mục này?")) {
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
                />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditCategorySkeleton() {
    return (
        <div className="space-y-10 max-w-3xl mx-auto">
            <Skeleton className="h-20 w-1/2 rounded-2xl" />
            <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
        </div>
    );
}
