"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
    Settings,
    Globe,
    CreditCard,
    Bot,
    Zap,
    ShieldCheck,
    Image as ImageIcon,
    Save,
    Trash2,
    RefreshCcw,
    Mail,
    Phone,
    MapPin,
    MessageCircle,
    Camera,
    Share2,
    Search,
    Loader2,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Switch from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettingsStore } from "@/store/settingsStore";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

const VIETNAMESE_BANKS = [
  { id: "ICB", name: "VietinBank" },
  { id: "VCB", name: "Vietcombank" },
  { id: "BIDV", name: "BIDV" },
  { id: "VBA", name: "Agribank" },
  { id: "OCB", name: "OCB" },
  { id: "MB", name: "MBBank" },
  { id: "TCB", name: "Techcombank" },
  { id: "ACB", name: "ACB" },
  { id: "VPB", name: "VPBank" },
  { id: "TPB", name: "TPBank" },
  { id: "STB", name: "Sacombank" },
  { id: "HDB", name: "HDBank" },
  { id: "SHB", name: "SHB" },
  { id: "VIB", name: "VIB" },
  { id: "MSB", name: "MSB" },
  { id: "NAB", name: "Nam A Bank" },
  { id: "BAB", name: "Bac A Bank" },
];

export default function AdminSettingsPage() {
    const queryClient = useQueryClient();
    const { setCurrency } = useSettingsStore();
    const [localSettings, setLocalSettings] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const { data: settings, isLoading } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: adminApi.getSettings
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => adminApi.updateSettings(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            if (data.general?.currency) {
                setCurrency(data.general.currency);
            }
            toast.success("Đã cập nhật cấu hình hệ thống thành công!");
        },
        onError: () => toast.error("Không thể cập nhật cấu hình.")
    });

    const clearCacheMutation = useMutation({
        mutationFn: adminApi.clearCache,
        onSuccess: () => toast.success("Bộ nhớ đệm đã được làm sạch!"),
        onError: () => toast.error("Lỗi khi xóa bộ nhớ đệm.")
    });

    const terminateMutation = useMutation({
        mutationFn: adminApi.terminateSessions,
        onSuccess: () => toast.success("Đã hủy toàn bộ phiên làm việc của người dùng."),
        onError: () => toast.error("Lỗi khi thực hiện yêu cầu.")
    });

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleChange = (section: string, key: string, value: any) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleSave = () => {
        if (!localSettings) return;
        updateMutation.mutate(localSettings);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const promise = adminApi.uploadFile(file);

        toast.promise(promise, {
            loading: `Đang tải ${type} lên...`,
            success: (data) => {
                handleChange("general", type, data.url);
                setIsUploading(false);
                return `Đã tải ${type} lên thành công!`;
            },
            error: "Lỗi khi tải tệp lên."
        });
    };

    if (isLoading || !localSettings) {
        return (
            <div className="space-y-10">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-12 w-64 rounded-xl" />
                    <Skeleton className="h-14 w-40 rounded-2xl" />
                </div>
                <Skeleton className="h-20 w-full rounded-[2rem]" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-[500px] lg:col-span-2 rounded-[2.5rem]" />
                    <Skeleton className="h-[500px] rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Hidden Inputs */}
            <input type="file" ref={logoInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
            <input type="file" ref={faviconInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'favicon')} accept="image/*" />
            <input type="file" ref={bannerInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Cấu hình hệ thống</h1>
                    <p className="text-gray-400 font-medium italic">Thiết lập các thông số cốt lõi và tùy chỉnh trải nghiệm khách hàng.</p>
                </div>
                <Button
                    className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-105"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Lưu thay đổi
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-8">
                <TabsList className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 w-full md:w-auto h-auto flex flex-wrap gap-2">
                    <TabsTrigger value="general" className="rounded-2xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Globe className="h-4 w-4" /> Tổng quan
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="rounded-2xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Search className="h-4 w-4" /> SEO & Marketing
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="rounded-2xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                        <CreditCard className="h-4 w-4" /> Thanh toán
                    </TabsTrigger>
                    <TabsTrigger value="chatbot" className="rounded-2xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                        <Bot className="h-4 w-4" /> AI Chatbot
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-2xl px-6 py-3 font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                        <ShieldCheck className="h-4 w-4" /> Bảo mật
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                                <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                                    <CardTitle className="text-lg font-black uppercase">Thông tin cửa hàng</CardTitle>
                                    <CardDescription className="font-bold text-gray-400">Các thông tin hiển thị trực tiếp cho khách hàng.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tên cửa hàng</Label>
                                            <Input 
                                                value={localSettings.general.shopName || ""} 
                                                onChange={(e) => handleChange("general", "shopName", e.target.value)}
                                                className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Khẩu hiệu (Tagline)</Label>
                                            <Input 
                                                value={localSettings.general.tagline || ""} 
                                                onChange={(e) => handleChange("general", "tagline", e.target.value)}
                                                className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email liên hệ</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input 
                                                    value={localSettings.general.email || ""} 
                                                    onChange={(e) => handleChange("general", "email", e.target.value)}
                                                    className="rounded-xl h-12 bg-gray-50 border-none font-bold pl-11" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Số điện thoại</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input 
                                                    value={localSettings.general.phone || ""} 
                                                    onChange={(e) => handleChange("general", "phone", e.target.value)}
                                                    className="rounded-xl h-12 bg-gray-50 border-none font-bold pl-11" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Địa chỉ trụ sở</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                                            <Textarea 
                                                value={localSettings.general.address || ""} 
                                                onChange={(e) => handleChange("general", "address", e.target.value)}
                                                className="rounded-xl bg-gray-50 border-none font-bold pl-11 min-h-[100px]" 
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                                <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                                    <CardTitle className="text-lg font-black uppercase">Ảnh Banner Trang chủ</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div 
                                        className="w-full aspect-[21/9] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 relative group overflow-hidden cursor-pointer"
                                        onClick={() => bannerInputRef.current?.click()}
                                    >
                                        {localSettings.general.banner ? (
                                            <img src={localSettings.general.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <ImageIcon className="h-10 w-10 text-gray-300" />
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tải lên Banner (Kích thước khuyên dùng: 1920x800)</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <RefreshCcw className="h-8 w-8 text-white" />
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Thay đổi Banner</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                                <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                                    <CardTitle className="text-lg font-black uppercase">Mạng xã hội</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center gap-2">
                                                <MessageCircle className="h-3 w-3" /> Facebook URL
                                            </Label>
                                            <Input 
                                                value={localSettings.general.facebook || ""} 
                                                onChange={(e) => handleChange("general", "facebook", e.target.value)}
                                                placeholder="https://facebook.com/..."
                                                className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center gap-2">
                                                <Camera className="h-3 w-3" /> Instagram URL
                                            </Label>
                                            <Input 
                                                value={localSettings.general.instagram || ""} 
                                                onChange={(e) => handleChange("general", "instagram", e.target.value)}
                                                placeholder="https://instagram.com/..."
                                                className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center gap-2">
                                                <Share2 className="h-3 w-3" /> Twitter URL
                                            </Label>
                                            <Input 
                                                value={localSettings.general.twitter || ""} 
                                                onChange={(e) => handleChange("general", "twitter", e.target.value)}
                                                placeholder="https://twitter.com/..."
                                                className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                                <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                                    <CardTitle className="text-lg font-black uppercase">Logo & Branding</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div 
                                        className="aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 relative group overflow-hidden cursor-pointer"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        {localSettings.general.logo ? (
                                            <img src={localSettings.general.logo} alt="Logo" className="absolute inset-0 w-full h-full object-contain p-4" />
                                        ) : (
                                            <div className="h-20 w-20 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                                <Bot className="h-10 w-10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <ImageIcon className="h-8 w-8 text-white" />
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Thay đổi Logo</span>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="w-full rounded-xl border-gray-100 font-bold h-12 gap-2"
                                        onClick={() => faviconInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        {localSettings.general.favicon && <img src={localSettings.general.favicon} className="h-4 w-4" alt="" />}
                                        Tải lên Favicon (.ico)
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                                <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                                    <CardTitle className="text-lg font-black uppercase">Đơn vị tiền tệ</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tiền tệ mặc định</Label>
                                        <select 
                                            value={localSettings.general.currency}
                                            onChange={(e) => handleChange("general", "currency", e.target.value)}
                                            className="w-full h-12 rounded-xl bg-gray-50 border-none px-4 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option value="USD">USD - Đô la Mỹ ($)</option>
                                            <option value="VND">VND - Việt Nam Đồng (đ)</option>
                                            <option value="EUR">EUR - Euro (€)</option>
                                            <option value="JPY">JPY - Yên Nhật (¥)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Ký hiệu hiển thị</Label>
                                        <Input 
                                            value={localSettings.general.currency === "USD" ? "$" : localSettings.general.currency === "VND" ? "đ" : localSettings.general.currency === "EUR" ? "€" : "¥"} 
                                            className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                            readOnly
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* SEO Settings */}
                <TabsContent value="seo" className="space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                        <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-lg font-black uppercase">Tối ưu hóa tìm kiếm (SEO)</CardTitle>
                            <CardDescription className="font-bold text-gray-400">Cách cửa hàng của bạn xuất hiện trên Google.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Meta Title mặc định</Label>
                                <Input 
                                    value={localSettings.seo.metaTitle || ""} 
                                    onChange={(e) => handleChange("seo", "metaTitle", e.target.value)}
                                    className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Meta Description mặc định</Label>
                                <Textarea 
                                    value={localSettings.seo.metaDescription || ""} 
                                    onChange={(e) => handleChange("seo", "metaDescription", e.target.value)}
                                    className="rounded-xl bg-gray-50 border-none font-bold min-h-[120px]" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Từ khóa (Keywords)</Label>
                                <Input 
                                    value={localSettings.seo.keywords || ""} 
                                    onChange={(e) => handleChange("seo", "keywords", e.target.value)}
                                    className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                />
                            </div>

                            <div className="p-6 rounded-[2rem] bg-gray-900 space-y-3">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Google Preview</span>
                                <h4 className="text-blue-400 font-bold text-lg leading-tight">{localSettings.seo.metaTitle}</h4>
                                <p className="text-green-500 text-xs">https://commercepro.vn</p>
                                <p className="text-gray-400 text-sm line-clamp-2">{localSettings.seo.metaDescription}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payment Settings */}
                <TabsContent value="payment" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase mb-1">Chuyển khoản Ngân hàng (VietQR)</CardTitle>
                                    <CardDescription className="font-bold text-gray-400">Tự động tạo mã QR quét thanh toán.</CardDescription>
                                </div>
                                <Switch 
                                    checked={!!localSettings.payment.bankEnabled}
                                    onCheckedChange={(checked) => handleChange("payment", "bankEnabled", checked)}
                                />
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Ngân hàng (Bank)</Label>
                                    <Select 
                                        value={localSettings.payment.bankId || ""} 
                                        onValueChange={(value) => handleChange("payment", "bankId", value)}
                                    >
                                        <SelectTrigger className="rounded-xl h-12 bg-gray-50 border-none font-bold">
                                            <SelectValue placeholder="Chọn ngân hàng..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                            {VIETNAMESE_BANKS.map((bank) => (
                                                <SelectItem key={bank.id} value={bank.id} className="rounded-xl font-bold">
                                                    {bank.name} ({bank.id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Số tài khoản</Label>
                                    <Input 
                                        value={localSettings.payment.accountNo || ""} 
                                        onChange={(e) => handleChange("payment", "accountNo", e.target.value)}
                                        className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tên chủ tài khoản (In hoa)</Label>
                                    <Input 
                                        value={localSettings.payment.accountName || ""} 
                                        onChange={(e) => handleChange("payment", "accountName", e.target.value)}
                                        className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase mb-1">Ví điện tử MoMo</CardTitle>
                                    <CardDescription className="font-bold text-gray-400">Thanh toán qua số điện thoại ví.</CardDescription>
                                </div>
                                <Switch 
                                    checked={!!localSettings.payment.momoEnabled}
                                    onCheckedChange={(checked) => handleChange("payment", "momoEnabled", checked)}
                                />
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Số điện thoại MoMo</Label>
                                    <Input 
                                        value={localSettings.payment.momoPhone || ""} 
                                        onChange={(e) => handleChange("payment", "momoPhone", e.target.value)}
                                        className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white lg:col-span-2">
                            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase mb-1">Cổng thanh toán VNPay</CardTitle>
                                    <CardDescription className="font-bold text-gray-400">Kết nối trực tiếp qua API VNPay.</CardDescription>
                                </div>
                                <Switch 
                                    checked={!!localSettings.payment.vnpayEnabled}
                                    onCheckedChange={(checked) => handleChange("payment", "vnpayEnabled", checked)}
                                />
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">TMN Code</Label>
                                        <Input 
                                            value={localSettings.payment.vnpayTmnCode || ""} 
                                            onChange={(e) => handleChange("payment", "vnpayTmnCode", e.target.value)}
                                            className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Hash Secret</Label>
                                        <Input 
                                            type="password"
                                            value={localSettings.payment.vnpayHashSecret || ""} 
                                            onChange={(e) => handleChange("payment", "vnpayHashSecret", e.target.value)}
                                            className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Chatbot Settings */}
                <TabsContent value="chatbot" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="text-lg font-black uppercase">Kết nối OpenAI</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">API Key</Label>
                                    <Input 
                                        type="password" 
                                        value={localSettings.chatbot.apiKey || ""} 
                                        onChange={(e) => handleChange("chatbot", "apiKey", e.target.value)}
                                        className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Model ưu tiên</Label>
                                    <Input 
                                        value={localSettings.chatbot.model || ""} 
                                        onChange={(e) => handleChange("chatbot", "model", e.target.value)}
                                        className="rounded-xl h-12 bg-gray-50 border-none font-bold" 
                                    />
                                </div>
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                    <div>
                                        <h4 className="font-black text-gray-900">Bật hỗ trợ khách hàng tự động</h4>
                                        <p className="text-xs text-gray-500 font-medium">Chatbot sẽ tự động trả lời các câu hỏi cơ bản.</p>
                                    </div>
                                    <Switch 
                                        checked={localSettings.chatbot.enabled}
                                        onCheckedChange={(checked) => handleChange("chatbot", "enabled", checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="text-lg font-black uppercase">Tính cách & Phản hồi</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Lời chào mừng</Label>
                                    <Textarea 
                                        value={localSettings.chatbot.welcomeMessage || ""} 
                                        onChange={(e) => handleChange("chatbot", "welcomeMessage", e.target.value)}
                                        className="rounded-xl bg-gray-50 border-none font-bold min-h-[150px]" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tông giọng (Tone)</Label>
                                    <div className="flex gap-2">
                                        {["Friendly", "Professional", "Funny"].map((tone) => (
                                            <Badge 
                                                key={tone}
                                                className={`rounded-full px-4 py-1 font-bold cursor-pointer transition-all ${
                                                    localSettings.chatbot.tone === tone 
                                                    ? "bg-primary text-white" 
                                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                }`}
                                                onClick={() => handleChange("chatbot", "tone", tone)}
                                            >
                                                {tone === "Friendly" ? "Thân thiện" : tone === "Professional" ? "Chuyên nghiệp" : "Hài hước"}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                        <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-lg font-black uppercase">Bảo mật hệ thống</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-gray-900">Xác thực 2 yếu tố (2FA)</h4>
                                        <p className="text-xs text-gray-500 font-medium">Yêu cầu OTP khi đăng nhập vào Admin.</p>
                                    </div>
                                    <Switch 
                                        checked={localSettings.security.twoFactor}
                                        onCheckedChange={(checked) => handleChange("security", "twoFactor", checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-gray-900">Chế độ bảo trì</h4>
                                        <p className="text-xs text-gray-500 font-medium">Khách hàng sẽ không thể truy cập cửa hàng.</p>
                                    </div>
                                    <Switch 
                                        checked={localSettings.security.maintenance}
                                        onCheckedChange={(checked) => handleChange("security", "maintenance", checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-red-50 border border-red-100">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-red-600 uppercase text-xs">Xóa dữ liệu bộ nhớ đệm</h4>
                                        <p className="text-xs text-red-400 font-medium italic">Sẽ làm chậm hệ thống trong vài phút đầu.</p>
                                    </div>
                                    <Button 
                                        variant="ghost" size="icon" 
                                        className="text-red-500 hover:bg-red-100 rounded-xl"
                                        onClick={() => clearCacheMutation.mutate()}
                                        disabled={clearCacheMutation.isPending}
                                    >
                                        {clearCacheMutation.isPending ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-red-50 border border-red-100">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-red-600 uppercase text-xs">Hủy toàn bộ phiên làm việc</h4>
                                        <p className="text-xs text-red-400 font-medium italic">Đăng xuất tất cả người dùng ngay lập tức.</p>
                                    </div>
                                    <Button 
                                        variant="ghost" size="icon" 
                                        className="text-red-500 hover:bg-red-100 rounded-xl"
                                        onClick={() => {
                                            if (confirm("Bạn có chắc chắn muốn hủy toàn bộ phiên làm việc của người dùng?")) {
                                                terminateMutation.mutate();
                                            }
                                        }}
                                        disabled={terminateMutation.isPending}
                                    >
                                        {terminateMutation.isPending ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
