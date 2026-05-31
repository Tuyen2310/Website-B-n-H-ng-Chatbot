"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    Download,
    BarChart3,
    PieChart as PieChartIcon,
    ShoppingBag,
    Users,
    DollarSign,
    Calendar,
    Filter,
    Layers,
    ChevronDown,
    Package
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/ui/price";
// Removed Recharts imports to use detailed tables instead
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Image as ImageIcon, ExternalLink, ArrowRight } from "lucide-react";

export default function AdminReportsPage() {
    const router = useRouter();
    const [isExporting, setIsExporting] = useState(false);
    const [reportType, setReportType] = useState("ALL");
    const [timeRange, setTimeRange] = useState("THIS_MONTH");
    const [customDate, setCustomDate] = useState({ start: "", end: "" });
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const { data: stats, isLoading } = useQuery({
        queryKey: ["admin-stats-full", timeRange, customDate],
        queryFn: () => catalogApi.getAdminStats({
            timeRange,
            startDate: customDate.start,
            endDate: customDate.end
        }),
    });

    const { data: productsData } = useQuery({
        queryKey: ["admin-products-list"],
        queryFn: () => catalogApi.getProducts({ limit: 100 }),
        enabled: reportType === "ALL" || reportType === "INVENTORY"
    });

    const products = productsData?.items || [];
    const selectedProduct = products.find((p: any) => p.id.toString() === selectedProductId);

    const exportToExcel = (type: string = "ALL") => {
        if (!stats) return;
        setIsExporting(true);
        try {
            const wb = XLSX.utils.book_new();

            if (type === "ALL" || type === "SALES") {
                const summaryData = [
                    { "Chỉ số": "Tổng doanh thu", "Giá trị": stats.totalRevenue },
                    { "Chỉ số": "Tổng đơn hàng", "Giá trị": stats.totalOrders },
                ];
                const wsSales = XLSX.utils.json_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, wsSales, "Doanh thu");

                const orderData = stats.recentOrders || [];
                const wsOrders = XLSX.utils.json_to_sheet(orderData);
                XLSX.utils.book_append_sheet(wb, wsOrders, "Chi tiết đơn hàng");
            }

            if (type === "ALL" || type === "INVENTORY") {
                const productData = stats.lowStockProducts || [];
                const wsStock = XLSX.utils.json_to_sheet(productData);
                XLSX.utils.book_append_sheet(wb, wsStock, "Tồn kho sản phẩm");
            }

            if (type === "ALL" || type === "USERS") {
                const userData = [
                    { "Chỉ số": "Tổng khách hàng", "Giá trị": stats.totalUsers },
                ];
                const wsUsers = XLSX.utils.json_to_sheet(userData);
                XLSX.utils.book_append_sheet(wb, wsUsers, "Thành viên");
            }

            const timeStr = timeRange === "CUSTOM" ? `${customDate.start}_to_${customDate.end}` : timeRange;
            XLSX.writeFile(wb, `BaoCao_${type}_${timeStr}_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success(`Đã xuất báo cáo ${type} (${timeStr}) thành công!`);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xuất file.");
        } finally {
            setIsExporting(false);
        }
    };

    // Colors removed

    if (isLoading) return <ReportsSkeleton />;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Báo cáo & Thống kê</h1>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">
                            Loại: {reportType === "ALL" ? "Toàn bộ hệ thống" : reportType === "SALES" ? "Doanh thu" : reportType === "INVENTORY" ? "Kho hàng" : "Thành viên"}
                        </Badge>
                        <Badge variant="outline" className="rounded-full bg-gray-50 text-gray-500 border-gray-100 px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">
                            Thời gian: {timeRange === "TODAY" ? "Hôm nay" : timeRange === "THIS_WEEK" ? "Tuần này" : timeRange === "THIS_MONTH" ? "Tháng này" : timeRange === "THIS_YEAR" ? "Năm nay" : "Tùy chọn"}
                        </Badge>
                    </div>
                </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <span className="font-black uppercase tracking-widest text-xs text-gray-400">Bộ lọc báo cáo chuyên sâu</span>
                </div>
                <div className="flex flex-wrap items-end gap-4 lg:gap-6">
                    <div className="space-y-2 w-full sm:w-[calc(50%-0.5rem)] lg:w-48">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Loại báo cáo</Label>
                        <Select value={reportType} onValueChange={(v) => setReportType(v || "ALL")}>
                            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold">
                                <SelectValue placeholder="Chọn loại..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="ALL">Tất cả báo cáo</SelectItem>
                                <SelectItem value="SALES">Doanh thu & Đơn hàng</SelectItem>
                                <SelectItem value="INVENTORY">Kho hàng & Sản phẩm</SelectItem>
                                <SelectItem value="USERS">Khách hàng & Thành viên</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 w-full sm:w-[calc(50%-0.5rem)] lg:w-48">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Thời gian</Label>
                        <Select value={timeRange} onValueChange={(v) => setTimeRange(v || "THIS_MONTH")}>
                            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold">
                                <SelectValue placeholder="Chọn thời gian..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="TODAY">Hôm nay</SelectItem>
                                <SelectItem value="THIS_WEEK">Tuần này</SelectItem>
                                <SelectItem value="THIS_MONTH">Tháng này</SelectItem>
                                <SelectItem value="THIS_YEAR">Năm nay</SelectItem>
                                <SelectItem value="CUSTOM">Tùy chọn...</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {timeRange === "CUSTOM" && (
                        <div className="space-y-2 w-full lg:w-auto flex-1">
                            <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Khoảng ngày</Label>
                            <div className="flex gap-2 items-center">
                                <Label className="text-xs font-bold text-gray-500 whitespace-nowrap">Từ:</Label>
                                <input type="date" className="w-full min-w-[130px] h-12 px-3 rounded-xl bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none" value={customDate.start} onChange={e => setCustomDate({ ...customDate, start: e.target.value })} />
                                <Label className="text-xs font-bold text-gray-500 whitespace-nowrap ml-2">Đến:</Label>
                                <input type="date" className="w-full min-w-[130px] h-12 px-3 rounded-xl bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none" value={customDate.end} onChange={e => setCustomDate({ ...customDate, end: e.target.value })} />
                            </div>
                        </div>
                    )}
                    <div className="flex items-end gap-3 w-full sm:w-auto lg:ml-auto pt-2 lg:pt-0">
                        <Button
                            className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-black bg-gray-900 hover:bg-primary transition-all shadow-lg text-white"
                            onClick={() => exportToExcel(reportType)}
                            disabled={isExporting}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            {isExporting ? "Đang xuất..." : "Xuất File"}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 w-12 p-0 rounded-xl font-bold border-gray-100 text-gray-400 hover:bg-gray-50 shrink-0"
                            onClick={() => {
                                setReportType("ALL");
                                setTimeRange("THIS_MONTH");
                                setCustomDate({ start: "", end: "" });
                            }}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(reportType === "ALL" || reportType === "SALES") && (
                    <>
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-12 w-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">+12.5%</span>
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Doanh thu tổng</p>
                                <h3 className="text-3xl font-black text-gray-900">${stats?.totalRevenue?.toLocaleString()}</h3>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">+5.2%</span>
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tổng đơn hàng</p>
                                <h3 className="text-3xl font-black text-gray-900">{stats?.totalOrders}</h3>
                            </CardContent>
                        </Card>
                    </>
                )}

                {(reportType === "ALL" || reportType === "USERS") && (
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                                    <Users className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest">+8.1%</span>
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Khách hàng mới</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats?.totalUsers}</h3>
                        </CardContent>
                    </Card>
                )}

                {(reportType === "ALL" || reportType === "SALES") && (
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">Tỉ lệ chốt</span>
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Lượt chuyển đổi</p>
                            <h3 className="text-3xl font-black text-gray-900">84%</h3>
                        </CardContent>
                    </Card>
                )}

                {reportType === "INVENTORY" && (
                    <>
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-12 w-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Hết hàng/Sắp hết</p>
                                <h3 className="text-3xl font-black text-gray-900">{stats?.lowStockCount}</h3>
                            </CardContent>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white lg:col-span-2">
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Chọn sản phẩm xem chi tiết tồn kho</Label>
                                    <Select value={selectedProductId || ""} onValueChange={setSelectedProductId}>
                                        <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold">
                                            <SelectValue placeholder="Chọn một sản phẩm..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl max-h-80">
                                            {products.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedProduct && (
                                    <div className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="h-20 w-20 bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                            {selectedProduct.images?.[0] ? (
                                                <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-gray-900 text-lg mb-1">{selectedProduct.name}</h4>
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3">Tồn kho: {selectedProduct.stock}</Badge>
                                                <Badge className="bg-gray-200 text-gray-600 border-none text-[10px] font-black uppercase tracking-widest px-3">Giá: ${selectedProduct.price}</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            className="rounded-2xl gap-2 font-black"
                                            onClick={() => router.push(`/admin/catalog/${selectedProduct.id}`)}
                                        >
                                            Sửa chi tiết <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {!selectedProduct && (
                                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
                                        <p className="font-bold text-gray-300 italic">Chọn một sản phẩm để xem nhanh tình trạng tồn kho</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Detailed Orders Table Section */}
            {(reportType === "ALL" || reportType === "SALES") && (
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white mt-8">
                    <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black uppercase mb-1">Bảng Thống Kê Chi Tiết Đơn Hàng</CardTitle>
                            <p className="text-xs text-gray-400 font-bold italic">Danh sách chi tiết tất cả các đơn hàng phát sinh trong kỳ báo cáo.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] font-black uppercase text-[10px] tracking-widest">Mã Đơn</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Khách hàng</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Thời gian</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Trạng thái</TableHead>
                                    <TableHead className="text-right font-black uppercase text-[10px] tracking-widest">Tổng tiền</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats?.recentOrders?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-400 font-bold italic">
                                            Không có dữ liệu đơn hàng trong khoảng thời gian này
                                        </TableCell>
                                    </TableRow>
                                ) : stats?.recentOrders?.map((order: any) => (
                                    <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                        <TableCell className="font-black text-gray-900">#{order.id}</TableCell>
                                        <TableCell className="font-bold text-gray-700">{order.userName}</TableCell>
                                        <TableCell className="text-xs font-bold text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase border-none ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                                                    order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                                        order.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                                                            'bg-blue-50 text-blue-600'
                                                }`}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-primary">
                                            <Price amount={order.total} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Advanced Stats Table */}
            {(reportType === "ALL" || reportType === "INVENTORY") && (
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden bg-white">
                    <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black uppercase mb-1">Thống kê sản phẩm tồn kho thấp</CardTitle>
                            <p className="text-xs text-gray-400 font-bold italic">Danh sách các sản phẩm cần nhập thêm hàng gấp.</p>
                        </div>
                        <Badge variant="outline" className="border-red-100 text-red-600 bg-red-50 font-black px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">Cảnh báo cao</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead>Danh mục</TableHead>
                                    <TableHead className="text-right">Giá niêm yết</TableHead>
                                    <TableHead className="text-center">Số lượng tồn</TableHead>
                                    <TableHead className="text-center">Mức độ nguy hiểm</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats?.lowStockProducts?.map((product: any) => (
                                    <TableRow key={product.name} className="cursor-pointer" onClick={() => router.push(`/admin/catalog`)}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Package className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900 text-sm leading-none mb-1">{product.name}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">ID: {product.id}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-full bg-indigo-50 text-indigo-600 border-none font-black uppercase tracking-widest text-[9px] px-3">
                                                {product.category?.name || product.category || "Chưa phân loại"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-gray-900">
                                            <Price amount={product.price} />
                                        </TableCell>
                                        <TableCell className="text-center font-black text-gray-900">{product.stock}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="w-24 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${product.stock <= 2 ? 'bg-red-500' : 'bg-orange-400'}`}
                                                    style={{ width: `${Math.min(100, (10 - product.stock) * 10)}%` }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="icon" variant="ghost" className="rounded-xl text-gray-400 hover:text-primary">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function ReportsSkeleton() {
    return (
        <div className="space-y-10">
            <Skeleton className="h-20 w-1/2 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-[400px] rounded-[2.5rem]" />
                <Skeleton className="h-[400px] rounded-[2.5rem]" />
            </div>
        </div>
    );
}
