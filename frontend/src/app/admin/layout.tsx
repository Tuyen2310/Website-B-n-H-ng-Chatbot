"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Bell,
  Search,
  Bot,
  TrendingUp,
  SlidersHorizontal,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        toast.error("Bạn không có quyền truy cập trang quản trị.");
        router.push("/login");
      }
    }
  }, [isAuthenticated, user, router, mounted]);

  if (!mounted || !isAuthenticated || user?.role !== "ADMIN") return null;

  const menuItems = [
    { name: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
    { name: "Báo cáo", icon: TrendingUp, href: "/admin/reports" },
    { name: "Sản phẩm", icon: Package, href: "/admin/catalog" },
    { name: "Thuộc tính", icon: SlidersHorizontal, href: "/admin/attributes" },
    { name: "Danh mục", icon: Menu, href: "/admin/categories" },
    { name: "Đơn hàng", icon: ShoppingBag, href: "/admin/orders" },
    { name: "Khuyến mãi", icon: Bell, href: "/admin/promotions" },
    { name: "Flash Sale", icon: Zap, href: "/admin/flash-sale" },
    { name: "Người dùng", icon: Users, href: "/admin/users" },
    { name: "Chatbot & FAQ", icon: MessageSquare, href: "/admin/faqs" },
    { name: "Cấu hình", icon: Settings, href: "/admin/settings" },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 shadow-2xl shadow-gray-200/50 ${
        isSidebarOpen ? "w-72" : "w-20"
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 mb-4 flex items-center justify-between">
            <Link href="/admin" className={`flex items-center gap-3 overflow-hidden transition-all ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                <Bot className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tighter text-primary whitespace-nowrap">
                SMART<span className="text-gray-900">ADMIN</span>
              </span>
            </Link>
            <Button variant="ghost" size="icon" className="shrink-0 text-gray-400" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                    isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                  }`}>
                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "group-hover:text-primary"}`} />
                    <span className={`font-bold text-sm whitespace-nowrap transition-all ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
                      {item.name}
                    </span>
                    {isActive && isSidebarOpen && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 mt-auto">
            <div className={`bg-gray-900 rounded-[2rem] p-4 flex items-center gap-4 overflow-hidden transition-all ${isSidebarOpen ? "h-20" : "h-12"}`}>
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className={`flex-1 overflow-hidden transition-all ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
                <p className="text-white text-xs font-black truncate">{user?.name}</p>
                <p className="text-gray-400 text-[10px] font-medium truncate">Quản trị viên</p>
              </div>
              <button onClick={handleLogout} className={`text-gray-400 hover:text-white transition-all shrink-0 ${isSidebarOpen ? "block" : "hidden"}`}>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`min-w-0 transition-all duration-300 ${isSidebarOpen ? "ml-72 w-[calc(100%-18rem)]" : "ml-20 w-[calc(100%-5rem)]"}`}>
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-full max-w-md">
            <Search className="h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm nhanh..." className="bg-transparent border-none text-sm outline-none w-full" />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-primary bg-gray-50 rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <div className="h-10 w-px bg-gray-100 mx-2"></div>
            <Link href="/">
              <Button variant="outline" className="rounded-xl font-bold gap-2 text-xs h-10 border-gray-200">
                <ShoppingBag className="h-4 w-4" /> Xem cửa hàng
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
