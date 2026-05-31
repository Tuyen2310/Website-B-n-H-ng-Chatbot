"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search,
  SlidersHorizontal,
  CheckCircle2,
  X,
  PlusCircle,
  Layers
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AttributesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAttr, setEditingAttr] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", values: [] as string[] });
  const [newValue, setNewValue] = useState("");

  const { data: attributes, isLoading } = useQuery({
    queryKey: ["admin-attributes"],
    queryFn: () => adminApi.getAttributes(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] });
      toast.success("Đã thêm bộ thuộc tính mới!");
      resetForm();
    },
    onError: () => toast.error("Có lỗi xảy ra.")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] });
      toast.success("Cập nhật thành công!");
      resetForm();
    },
    onError: () => toast.error("Không thể cập nhật.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attributes"] });
      toast.success("Đã xóa thuộc tính.");
    },
    onError: () => toast.error("Không thể xóa thuộc tính này.")
  });

  const resetForm = () => {
    setFormData({ name: "", values: [] });
    setNewValue("");
    setEditingAttr(null);
    setIsDialogOpen(false);
  };

  const handleAddValue = () => {
    if (newValue.trim() && !formData.values.includes(newValue.trim())) {
      setFormData({ ...formData, values: [...formData.values, newValue.trim()] });
      setNewValue("");
    }
  };

  const removeValue = (val: string) => {
    setFormData({ ...formData, values: formData.values.filter(v => v !== val) });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || formData.values.length === 0) {
      toast.error("Vui lòng nhập tên và ít nhất một giá trị.");
      return;
    }

    if (editingAttr) {
      updateMutation.mutate({ id: editingAttr.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (attr: any) => {
    setEditingAttr(attr);
    setFormData({ name: attr.name, values: attr.values });
    setIsDialogOpen(true);
  };

  const filteredAttributes = attributes?.filter((a: any) => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-50">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <SlidersHorizontal className="h-10 w-10 text-primary" />
            Quản lý thuộc tính
          </h1>
          <p className="text-gray-400 font-medium">Định nghĩa các thông số sản phẩm như Màu sắc, RAM, Dung lượng...</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="rounded-2xl h-14 px-8 font-black gap-2 shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="h-6 w-6" /> Thêm bộ thuộc tính
            </Button>
          } />
          <DialogContent className="rounded-[2.5rem] max-w-md p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                {editingAttr ? "Chỉnh sửa thuộc tính" : "Thêm thuộc tính mới"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tên thuộc tính</label>
                <Input 
                  placeholder="Ví dụ: Màu sắc, Dung lượng..." 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="rounded-xl h-12 bg-gray-50 border-none font-bold"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Giá trị gợi ý</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nhập giá trị..." 
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
                    className="rounded-xl h-12 bg-gray-50 border-none font-bold"
                  />
                  <Button onClick={handleAddValue} variant="secondary" className="rounded-xl h-12 px-4">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {formData.values.map(val => (
                    <Badge key={val} className="rounded-lg py-1 px-3 bg-white text-primary border-primary/20 flex items-center gap-1 font-bold shadow-sm">
                      {val}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeValue(val)} />
                    </Badge>
                  ))}
                  {formData.values.length === 0 && <span className="text-xs text-gray-400 italic">Chưa có giá trị nào</span>}
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100">
              <Button variant="ghost" onClick={resetForm} className="rounded-xl font-bold">Hủy</Button>
              <Button onClick={handleSubmit} className="rounded-xl font-black px-8">Lưu thay đổi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input 
          placeholder="Tìm kiếm thuộc tính..." 
          className="pl-14 h-16 rounded-2xl bg-white border-none shadow-xl shadow-gray-100/50 font-bold text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttributes?.map((attr: any) => (
            <Card key={attr.id} className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden bg-white">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Layers className="h-7 w-7" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-100" onClick={() => startEdit(attr)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl hover:bg-red-50 text-red-500"
                        onClick={() => confirm("Xóa bộ thuộc tính này?") && deleteMutation.mutate(attr.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#041B3C]">{attr.name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> {attr.values.length} giá trị có sẵn
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {attr.values.slice(0, 5).map((v: string) => (
                    <Badge key={v} variant="secondary" className="rounded-lg bg-gray-50 text-gray-600 border-none font-medium text-[10px]">
                      {v}
                    </Badge>
                  ))}
                  {attr.values.length > 5 && (
                    <Badge variant="secondary" className="rounded-lg bg-gray-50 text-gray-400 border-none font-medium text-[10px]">
                      +{attr.values.length - 5}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAttributes?.length === 0 && !isLoading && (
        <div className="text-center py-40 bg-white rounded-[3rem] shadow-xl shadow-gray-100/50 border border-gray-50">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-200" />
            </div>
            <h2 className="text-2xl font-black text-[#041B3C]">Không tìm thấy thuộc tính nào</h2>
            <p className="text-gray-400 font-medium">Hãy thử tìm với từ khóa khác hoặc thêm bộ thuộc tính mới.</p>
        </div>
      )}
    </div>
  );
}
