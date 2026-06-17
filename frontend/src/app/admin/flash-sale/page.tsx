"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, catalogApi } from "@/lib/api";
import { 
    Zap, 
    Calendar, 
    Loader2, 
    Search, 
    Save, 
    Trash2, 
    Clock, 
    HelpCircle,
    Check,
    X,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Switch from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Price } from "@/components/ui/price";

export default function AdminFlashSalePage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"ALL" | "FLASH_ONLY">("ALL");

    // Local state for Schedule settings
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Local changes tracker for product configurations
    // Key: product ID, Value: changes to commit
    const [productChanges, setProductChanges] = useState<Record<number, { isFlashSale?: boolean; flashSalePrice?: number | null }>>({});

    // Fetch system settings
    const { data: settings, isLoading: isSettingsLoading } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: adminApi.getSettings
    });

    // Fetch categories for mapping/display
    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: catalogApi.getCategories
    });

    // Fetch catalog products
    const { data: productsData, isLoading: isProductsLoading } = useQuery({
        queryKey: ["admin-products-flash-sale", page, limit, searchTerm],
        queryFn: () => catalogApi.getProducts({
            skip: (page - 1) * limit,
            take: limit,
            search: searchTerm || undefined,
        }),
    });

    const products = productsData?.items || [];
    const totalProducts = productsData?.total || 0;

    // Load initial settings when fetched
    useEffect(() => {
        if (settings?.flashSale) {
            // Convert ISO dates to YYYY-MM-DDThh:mm format for HTML datetime-local input
            const formatForInput = (isoString: string | null) => {
                if (!isoString) return "";
                try {
                    const date = new Date(isoString);
                    // Adjust timezone offset to local time
                    const tzOffset = date.getTimezoneOffset() * 60000; // in ms
                    const localISODate = new Date(date.getTime() - tzOffset).toISOString();
                    return localISODate.slice(0, 16);
                } catch (e) {
                    return "";
                }
            };
            setStartTime(formatForInput(settings.flashSale.startTime));
            setEndTime(formatForInput(settings.flashSale.endTime));
        }
    }, [settings]);

    // Mutation to update settings
    const updateSettingsMutation = useMutation({
        mutationFn: (data: any) => adminApi.updateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            queryClient.invalidateQueries({ queryKey: ["public-settings"] });
            toast.success("Cấu hình thời gian Flash Sale đã được cập nhật!");
        },
        onError: () => toast.error("Lỗi khi cập nhật cấu hình thời gian.")
    });

    // Save schedule configuration
    const handleSaveSchedule = () => {
        if (!startTime || !endTime) {
            toast.error("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.");
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
            return;
        }

        updateSettingsMutation.mutate({
            flashSale: {
                startTime: start.toISOString(),
                endTime: end.toISOString()
            }
        });
    };

    // Remove / reset schedule configuration
    const handleResetSchedule = () => {
        updateSettingsMutation.mutate({
            flashSale: {
                startTime: null,
                endTime: null
            }
        });
        setStartTime("");
        setEndTime("");
    };

    // Keep track of toggle / price changes in product table locally
    const handleProductToggle = (product: any, checked: boolean) => {
        const pId = product.id;
        const currentChange = productChanges[pId] || {};
        
        // When checking, default flashSalePrice to ~80% of original price rounded down to nearest thousand
        let newPrice = currentChange.flashSalePrice !== undefined 
            ? currentChange.flashSalePrice 
            : product.flashSalePrice;
            
        if (checked && !newPrice) {
            newPrice = Math.floor((product.price * 0.8) / 1000) * 1000;
        }

        setProductChanges(prev => ({
            ...prev,
            [pId]: {
                ...prev[pId],
                isFlashSale: checked,
                flashSalePrice: checked ? newPrice : null
            }
        }));
    };

    const handleProductPriceChange = (product: any, value: string) => {
        const pId = product.id;
        const numberVal = value === "" ? 0 : Number(value);

        setProductChanges(prev => ({
            ...prev,
            [pId]: {
                ...prev[pId],
                flashSalePrice: numberVal
            }
        }));
    };

    // Batch update product changes
    const [isSavingProducts, setIsSavingProducts] = useState(false);
    const handleSaveProducts = async () => {
        const entries = Object.entries(productChanges);
        if (entries.length === 0) {
            toast.info("Không có sản phẩm nào thay đổi.");
            return;
        }

        // Validate entries
        for (const [idStr, change] of entries) {
            const id = Number(idStr);
            const originalProduct = products.find((p: any) => p.id === id);
            
            // Check if active or requested isFlashSale is true
            const isFlash = change.isFlashSale !== undefined ? change.isFlashSale : originalProduct?.isFlashSale;
            const price = change.flashSalePrice !== undefined ? change.flashSalePrice : originalProduct?.flashSalePrice;

            if (isFlash) {
                if (!price || price <= 0) {
                    toast.error(`Sản phẩm ID ${id} có giá Flash Sale không hợp lệ.`);
                    return;
                }
                const originalPrice = originalProduct?.price || 0;
                if (price >= originalPrice) {
                    toast.error(`Giá Flash Sale của sản phẩm ID ${id} phải nhỏ hơn giá gốc (< ${originalPrice}đ).`);
                    return;
                }
            }
        }

        setIsSavingProducts(true);
        try {
            const promises = entries.map(([id, change]) => {
                return adminApi.updateProduct(Number(id), change);
            });
            await Promise.all(promises);
            toast.success("Cập nhật sản phẩm Flash Sale thành công!");
            setProductChanges({}); // Reset change queue
            queryClient.invalidateQueries({ queryKey: ["admin-products-flash-sale"] });
            queryClient.invalidateQueries({ queryKey: ["trending-products"] });
        } catch (error) {
            toast.error("Lỗi khi cập nhật sản phẩm Flash Sale.");
        } finally {
            setIsSavingProducts(false);
        }
    };

    // Cancel all current unsaved edits in table
    const handleCancelProductEdits = () => {
        setProductChanges({});
        toast.info("Đã hủy bỏ các chỉnh sửa chưa lưu.");
    };

    // Lọc theo chế độ
    const displayProducts = filterType === "FLASH_ONLY" 
        ? products.filter((p: any) => {
            const change = productChanges[p.id];
            const isFlash = change?.isFlashSale !== undefined ? change.isFlashSale : p.isFlashSale;
            return isFlash;
          })
        : products;

    const hasChanges = Object.keys(productChanges).length > 0;

    const getStatusText = () => {
        if (!startTime || !endTime) return { text: "Chưa cấu hình", class: "bg-gray-100 text-gray-500 border-gray-200" };
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) {
            return { text: "Sắp diễn ra", class: "bg-blue-50 text-blue-600 border-blue-200 animate-pulse" };
        } else if (now >= start && now <= end) {
            return { text: "Đang hoạt động", class: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]" };
        } else {
            return { text: "Đã kết thúc", class: "bg-rose-50 text-rose-500 border-rose-200" };
        }
    };

    const statusBadge = getStatusText();

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                            <Zap className="h-6 w-6 fill-current animate-pulse" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Quản lý Flash Sale</h1>
                    </div>
                    <p className="text-gray-400 font-medium italic">Cài đặt lịch trình và điều chỉnh giá ưu đãi đặc biệt.</p>
                </div>
            </div>

            {/* Config & Timeline Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule Card */}
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white lg:col-span-1 h-fit">
                    <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-black uppercase flex items-center gap-2 text-gray-900">
                                <Clock className="h-5 w-5 text-red-500" />
                                Lịch trình Flash Sale
                            </CardTitle>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${statusBadge.class}`}>
                                {statusBadge.text}
                            </span>
                        </div>
                        <CardDescription className="font-bold text-gray-400">Thiết lập thời gian bắt đầu và kết thúc sự kiện.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Thời gian bắt đầu</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="datetime-local"
                                    className="w-full h-12 pl-11 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Thời gian kết thúc</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="datetime-local"
                                    className="w-full h-12 pl-11 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                            <Button 
                                className="w-full rounded-xl h-12 font-black shadow-lg shadow-primary/10 gap-2 uppercase tracking-wider text-xs"
                                onClick={handleSaveSchedule}
                                disabled={updateSettingsMutation.isPending}
                            >
                                {updateSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Lưu cấu hình lịch
                            </Button>
                            
                            {(startTime || endTime) && (
                                <Button 
                                    variant="outline"
                                    className="w-full rounded-xl h-12 font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-gray-100 gap-2 uppercase tracking-wider text-xs"
                                    onClick={handleResetSchedule}
                                    disabled={updateSettingsMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hủy chương trình Flash Sale
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Product Selection Card */}
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white lg:col-span-2">
                    <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-lg font-black uppercase flex items-center gap-2 text-gray-900">
                                <Zap className="h-5 w-5 text-red-500 fill-current" />
                                Sản phẩm ưu đãi
                            </CardTitle>
                            <CardDescription className="font-bold text-gray-400">Lựa chọn sản phẩm tham gia Flash Sale và đặt giá giảm.</CardDescription>
                        </div>
                        {hasChanges && (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl font-bold h-10 border-gray-200 hover:bg-gray-50"
                                    onClick={handleCancelProductEdits}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button 
                                    className="rounded-xl font-bold h-10 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 gap-2"
                                    onClick={handleSaveProducts}
                                    disabled={isSavingProducts}
                                >
                                    {isSavingProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Lưu sản phẩm ({Object.keys(productChanges).length})
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Filters and Search */}
                        <div className="p-6 bg-white border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:max-w-xs">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="w-full h-10 pl-11 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-xs"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>

                            <div className="flex gap-2 w-full md:w-auto justify-end">
                                <Button
                                    variant={filterType === "ALL" ? "default" : "outline"}
                                    className="rounded-xl text-xs font-bold h-9 px-4"
                                    onClick={() => setFilterType("ALL")}
                                >
                                    Tất cả sản phẩm
                                </Button>
                                <Button
                                    variant={filterType === "FLASH_ONLY" ? "default" : "outline"}
                                    className="rounded-xl text-xs font-bold h-9 px-4 gap-1.5"
                                    onClick={() => setFilterType("FLASH_ONLY")}
                                >
                                    <Zap className="h-3 w-3 fill-current" />
                                    Đang tham gia Flash Sale
                                </Button>
                            </div>
                        </div>

                        {/* Product Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="py-4 px-6 text-[10px] font-black uppercase text-gray-400">Tham gia</th>
                                        <th className="py-4 px-6 text-[10px] font-black uppercase text-gray-400">Sản phẩm</th>
                                        <th className="py-4 px-6 text-[10px] font-black uppercase text-gray-400">Giá gốc</th>
                                        <th className="py-4 px-6 text-[10px] font-black uppercase text-gray-400">Giá Flash Sale (đ)</th>
                                        <th className="py-4 px-6 text-[10px] font-black uppercase text-gray-400">Tồn kho / Đã bán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isProductsLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="py-4 px-6"><Skeleton className="h-6 w-6 rounded" /></td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-10 w-10 rounded-lg" />
                                                        <div className="space-y-1">
                                                            <Skeleton className="h-4 w-40" />
                                                            <Skeleton className="h-3 w-20" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                                                <td className="py-4 px-6"><Skeleton className="h-8 w-28 rounded-lg" /></td>
                                                <td className="py-4 px-6"><Skeleton className="h-4 w-16" /></td>
                                            </tr>
                                        ))
                                    ) : displayProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-sm font-bold text-gray-400 italic">
                                                Không tìm thấy sản phẩm nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayProducts.map((product: any) => {
                                            const change = productChanges[product.id] || {};
                                            const isFlash = change.isFlashSale !== undefined ? change.isFlashSale : product.isFlashSale;
                                            const flashPrice = change.flashSalePrice !== undefined ? change.flashSalePrice : product.flashSalePrice;

                                            return (
                                                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <Switch
                                                            checked={!!isFlash}
                                                            onCheckedChange={(checked) => handleProductToggle(product, checked)}
                                                        />
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={product.images?.[0] || "https://via.placeholder.com/80"} 
                                                                alt={product.name} 
                                                                className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100"
                                                            />
                                                            <div>
                                                                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                    {product.category?.name || "Khác"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-gray-600 text-sm">
                                                        <Price amount={product.price} />
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {isFlash ? (
                                                            <Input
                                                                type="number"
                                                                className="rounded-lg h-9 w-32 bg-red-50/20 border-red-200 text-red-600 focus-visible:ring-red-500/20 font-black text-sm"
                                                                value={flashPrice !== null ? flashPrice : ""}
                                                                placeholder="Nhập giá..."
                                                                onChange={(e) => handleProductPriceChange(product, e.target.value)}
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-gray-400 font-bold italic">Không kích hoạt</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-xs text-gray-500 font-bold">
                                                        <div>Kho: {product.stock}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">Bán: {product.soldCount}</div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalProducts > limit && (
                            <PaginationControls
                                total={totalProducts}
                                page={page}
                                limit={limit}
                                onPageChange={(p) => setPage(p)}
                                onLimitChange={(l) => {
                                    setLimit(l);
                                    setPage(1);
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
