"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  History
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: catalogApi.getAdminStats,
  });

  const cards = [
    { 
      title: "Tổng doanh thu", 
      value: `$${stats?.totalRevenue?.toLocaleString() || "0"}`, 
      icon: DollarSign, 
      color: "bg-green-500", 
      trend: "Doanh thu trọn đời", 
      isUp: true 
    },
    { 
      title: "Doanh thu tháng này", 
      value: `$${stats?.monthlyRevenue?.toLocaleString() || "0"}`, 
      icon: TrendingUp, 
      color: "bg-indigo-500", 
      trend: "Tháng hiện tại", 
      isUp: true 
    },
    { 
      title: "Đơn hàng mới", 
      value: stats?.totalOrders || "0", 
      icon: ShoppingBag, 
      color: "bg-blue-500", 
      trend: "Tất cả các thời điểm", 
      isUp: true 
    },
    { 
      title: "Khách hàng", 
      value: stats?.totalUsers || "0", 
      icon: Users, 
      color: "bg-purple-500", 
      trend: "Người dùng đăng ký", 
      isUp: true 
    },
  ];

  const chartData = stats?.ordersByStatus?.map((item: any) => ({
    name: item.status,
    value: item.count
  })) || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Bảng điều khiển</h1>
          <p className="text-gray-400 font-medium italic">Chào mừng trở lại! Dưới đây là tóm tắt hoạt động hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString("vi-VN")}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="premium-card group overflow-hidden border-none rounded-[2rem] shadow-xl shadow-gray-100/50">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`h-12 w-12 ${card.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-black border-none bg-gray-50 text-gray-500`}>
                  {card.trend}
                </Badge>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.title}</p>
              <h3 className="text-3xl font-black text-gray-900">{card.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status Distribution Chart */}
        <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
          <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-100/50">
            <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 text-gray-900">
              <Activity className="h-5 w-5 text-primary" /> Phân bổ trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[300px]">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">Chưa có dữ liệu đơn hàng</div>
            )}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {chartData.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{entry.name}</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table / Alerts */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-100/50 overflow-hidden">
                <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-100/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 text-gray-900">
                    <History className="h-5 w-5 text-primary" /> Đơn hàng gần đây
                    </CardTitle>
                    <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[10px]">Cảnh báo tồn kho: {stats?.lowStockCount || 0}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/30">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền</th>
                                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats?.recentOrders?.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 font-black text-sm text-gray-900">#{order.id}</td>
                                        <td className="p-6 font-bold text-gray-600 text-sm">{order.userName}</td>
                                        <td className="p-6 font-black text-gray-900">${order.total.toLocaleString()}</td>
                                        <td className="p-6">
                                            <Badge className={`rounded-full border-none font-black uppercase tracking-widest text-[8px] px-2 ${
                                                order.status === 'COMPLETED' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                            }`}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            {stats?.lowStockCount > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-8 flex items-start gap-6">
                    <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-red-900 uppercase tracking-tight">Cảnh báo tồn kho thấp!</h4>
                        <p className="text-red-700/70 text-sm font-medium mb-4">Các sản phẩm sau đang sắp hết hàng, vui lòng nhập thêm.</p>
                        <div className="flex flex-wrap gap-2">
                            {stats.lowStockProducts?.map((p: any) => (
                                <Badge key={p.name} variant="outline" className="border-red-200 bg-white text-red-600 font-bold">
                                    {p.name}: {p.stock} còn lại
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-20 w-1/3 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-[400px] lg:col-span-1 rounded-[2.5rem]" />
        <Skeleton className="h-[400px] lg:col-span-2 rounded-[2.5rem]" />
      </div>
    </div>
  );
}
