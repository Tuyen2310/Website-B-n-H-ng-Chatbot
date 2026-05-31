"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogApi, adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Save, 
  Upload, 
  X, 
  Plus,
  Package,
  Trash2
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    categoryId: "",
    images: [] as string[]
  });
  const mainFileRef = useRef<HTMLInputElement>(null);
  const extraFileRef = useRef<HTMLInputElement>(null);

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => catalogApi.getProduct(Number(id)),
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: globalAttributes } = useQuery({
    queryKey: ["admin-attributes"],
    queryFn: () => adminApi.getAttributes(),
  });

  const [attributes, setAttributes] = useState<{key: string, values: string}[]>([]);
  const [customKeys, setCustomKeys] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        stock: product.stock.toString(),
        categoryId: product.categoryId.toString(),
        images: product.images || []
      });

      // Load attributes if they exist
      if (product.attributes && typeof product.attributes === 'object') {
        const loadedAttrs = Object.entries(product.attributes).map(([key, val]) => ({
          key,
          values: Array.isArray(val) ? val.join(', ') : String(val)
        }));
        setAttributes(loadedAttrs);
        
        // Check which ones are custom (not in globalAttributes)
        // Note: globalAttributes might not be loaded yet, so we'll check in a separate effect or just assume
      } else {
        setAttributes([]);
      }
    }
  }, [product]);

  // Sync customKeys when globalAttributes and attributes are both loaded
  useEffect(() => {
    if (globalAttributes && attributes.length > 0) {
      const newCustomKeys: Record<number, boolean> = {};
      attributes.forEach((attr, idx) => {
        const isPredefined = globalAttributes.some((ga: any) => ga.name === attr.key);
        if (!isPredefined && attr.key !== "") {
          newCustomKeys[idx] = true;
        }
      });
      setCustomKeys(newCustomKeys);
    }
  }, [globalAttributes, attributes.length]);

  const addAttribute = () => setAttributes([...attributes, {key: "", values: ""}]);
  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
    const newCustomKeys = { ...customKeys };
    delete newCustomKeys[index];
    setCustomKeys(newCustomKeys);
  };
  const updateAttribute = (index: number, field: 'key' | 'values', value: string) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateProduct(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      toast.success("Cập nhật sản phẩm thành công!");
      router.push("/admin/catalog");
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật.")
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteProduct(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Đã xóa sản phẩm.");
      router.push("/admin/catalog");
    },
    onError: () => toast.error("Không thể xóa sản phẩm này.")
  });

  const handleMainImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setFormData(prev => ({
        ...prev,
        images: [src, ...prev.images.slice(1)]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleExtraImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, src]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert attributes list to JSON object
    const attrJson: Record<string, any> = {};
    attributes.forEach(attr => {
      if (attr.key.trim()) {
        const valueList = attr.values.split(',').map(v => v.trim()).filter(v => v !== "");
        attrJson[attr.key] = valueList.length > 1 ? valueList : valueList[0] || "";
      }
    });

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      images: formData.images.filter(img => img.trim() !== ""),
      attributes: attrJson
    };
    updateMutation.mutate(data);
  };

  if (isProductLoading) return <EditProductSkeleton />;

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-12 w-12 bg-white shadow-sm border border-gray-100"
            onClick={() => router.push("/admin/catalog")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Chỉnh sửa sản phẩm</h1>
            <p className="text-gray-400 font-medium italic">ID: #{id} — Cập nhật thông tin chi tiết.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            className="rounded-xl h-12 font-bold px-6 text-red-500 hover:bg-red-50" 
            onClick={() => {
                if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                    deleteMutation.mutate();
                }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Xóa sản phẩm
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
        {/* Left: Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" /> Thông tin cơ bản
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-sm text-gray-500 uppercase tracking-widest">Tên sản phẩm</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  className="rounded-xl h-14 bg-gray-50 border-none text-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-bold text-sm text-gray-500 uppercase tracking-widest">Giá bán ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required 
                    className="rounded-xl h-14 bg-gray-50 border-none text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="font-bold text-sm text-gray-500 uppercase tracking-widest">Số lượng tồn kho</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required 
                    className="rounded-xl h-14 bg-gray-50 border-none text-lg font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-sm text-gray-500 uppercase tracking-widest">Mô tả sản phẩm</Label>
                <Textarea 
                  id="description" 
                  rows={8} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required 
                  className="rounded-2xl bg-gray-50 border-none text-base leading-relaxed p-6"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" /> Thuộc tính nâng cao
                </CardTitle>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addAttribute}
                    className="rounded-xl font-bold border-primary text-primary hover:bg-primary hover:text-white"
                >
                    Thêm thuộc tính
                </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {attributes.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold text-sm">Chưa có thuộc tính nào được thêm.</p>
                    <p className="text-gray-400 text-xs mt-1">Bấm nút "Thêm thuộc tính" để cấu hình Màu sắc, RAM, SSD...</p>
                </div>
              )}
              {attributes.map((attr, index) => {
                const globalAttr = globalAttributes?.find((ga: any) => ga.name === attr.key);
                const isCustom = customKeys[index];

                return (
                  <div key={index} className="space-y-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-end gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chọn loại thuộc tính</Label>
                        <Select 
                          value={isCustom ? "custom" : attr.key} 
                          onValueChange={(val) => {
                            const value = val || "";
                            if (value === "custom") {
                              setCustomKeys({ ...customKeys, [index]: true });
                              updateAttribute(index, 'key', "");
                            } else {
                              setCustomKeys({ ...customKeys, [index]: false });
                              updateAttribute(index, 'key', value);
                              updateAttribute(index, 'values', "");
                            }
                          }}
                        >
                          <SelectTrigger className="rounded-xl h-12 bg-white border-none font-bold shadow-sm">
                            <SelectValue placeholder="Chọn thuộc tính" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {globalAttributes?.map((ga: any) => (
                              <SelectItem key={ga.id} value={ga.name}>{ga.name}</SelectItem>
                            ))}
                            <SelectItem value="custom">+ Thêm thuộc tính khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {isCustom && (
                        <div className="flex-1 flex flex-col gap-2 animate-in slide-in-from-left-2">
                          <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tên thuộc tính mới</Label>
                          <Input 
                            placeholder="Ví dụ: Chất liệu"
                            value={attr.key}
                            onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                            className="rounded-xl h-12 bg-white border-none font-bold shadow-sm"
                          />
                        </div>
                      )}

                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeAttribute(index)}
                        className="h-12 w-12 text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {globalAttr && !isCustom && (
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chọn giá trị có sẵn</Label>
                        <div className="flex flex-wrap gap-2">
                          {globalAttr.values.map((v: string) => {
                            const isSelected = attr.values.split(',').map(s => s.trim()).includes(v);
                            return (
                              <Badge 
                                key={v}
                                variant={isSelected ? "default" : "outline"}
                                className={`rounded-xl px-4 py-2 cursor-pointer transition-all border-none font-bold text-xs ${
                                  isSelected ? "bg-primary text-white scale-105" : "bg-white text-gray-400 hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  const currentValues = attr.values.split(',').map(s => s.trim()).filter(s => s !== "");
                                  let newValues;
                                  if (isSelected) {
                                    newValues = currentValues.filter(cv => cv !== v);
                                  } else {
                                    newValues = [...currentValues, v];
                                  }
                                  updateAttribute(index, 'values', newValues.join(', '));
                                }}
                              >
                                {v} {isSelected && <CheckCircle2 className="ml-1 h-3 w-3" />}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        {globalAttr ? "Hoặc nhập thêm giá trị tùy chỉnh (cách nhau bằng dấu phẩy)" : "Nhập các giá trị (cách nhau bằng dấu phẩy)"}
                      </Label>
                      <Input 
                        placeholder="Ví dụ: Đỏ, Xanh, Vàng" 
                        value={attr.values}
                        onChange={(e) => updateAttribute(index, 'values', e.target.value)}
                        className="rounded-xl h-12 bg-white border-none font-bold shadow-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right: Images & Category */}
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-black uppercase">Phân loại</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-2">
                <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Danh mục</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(val) => setFormData({...formData, categoryId: val || ""})}
                >
                  <SelectTrigger className="rounded-xl h-14 bg-gray-50 border-none font-bold">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-black uppercase">Hình ảnh</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                    <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Ảnh chính</Label>
                    <div
                        className="relative border-2 border-dashed border-gray-200 rounded-3xl aspect-square flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden group"
                        onClick={() => mainFileRef.current?.click()}
                    >
                        {formData.images[0] ? (
                            <>
                                <img src={formData.images[0]} alt="main" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <p className="text-white font-bold text-sm">Thay đổi ảnh</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Upload className="h-8 w-8" />
                                <p className="text-xs font-bold uppercase tracking-widest">Tải ảnh lên</p>
                            </div>
                        )}
                    </div>
                    <input ref={mainFileRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageFile} />
                </div>

                <div className="space-y-4">
                    <Label className="font-bold text-sm text-gray-500 uppercase tracking-widest">Ảnh chi tiết</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {formData.images.slice(1).map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group border border-gray-200">
                                <img src={img} alt={`extra-${idx}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        const newImgs = [formData.images[0], ...formData.images.slice(1).filter((_, i) => i !== idx)];
                                        setFormData({...formData, images: newImgs});
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        <div
                            className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-400"
                            onClick={() => extraFileRef.current?.click()}
                        >
                            <Plus className="h-6 w-6" />
                        </div>
                    </div>
                    <input ref={extraFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImageFiles} />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EditProductSkeleton() {
    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            <Skeleton className="h-20 w-1/2 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="h-[600px] lg:col-span-2 rounded-[2.5rem]" />
                <div className="space-y-8">
                    <Skeleton className="h-40 w-full rounded-[2.5rem]" />
                    <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
}
