"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, User, LogOut, LayoutDashboard, Bot, Menu, X, ChevronDown, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { catalogApi, publicApi } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const { items } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: catalogApi.getCategories,
  });

  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: publicApi.getPublicSettings,
  });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  if (!mounted) return null;

  const shopName = (settings as any)?.general?.shopName || "CommercePro";
  const shopLogo = (settings as any)?.general?.logo;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 navbar-premium ${
      isScrolled ? "navbar-scrolled" : "py-6"
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {shopLogo ? (
            <img src={shopLogo} alt={shopName} className="h-10 w-auto object-contain" />
          ) : (
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-12 group-hover:scale-110 transition-all">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
          )}
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {shopName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12">
          <Link href="/" className="navbar-link">Trang chủ</Link>
          <Link href="/shop" className="navbar-link">Cửa hàng</Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 navbar-link outline-none">
              Danh mục <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              {categories?.map((cat: any) => (
                <DropdownMenuItem key={cat.id} className="rounded-xl font-bold py-3 cursor-pointer dark:focus:bg-slate-800" onClick={() => router.push(`/shop?category=${cat.id}`)}>
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/support" className="navbar-link">Hỗ trợ</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 dark:bg-slate-800/50 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-blue-500/50 dark:focus-within:border-blue-500/50 transition-all shadow-inner">
            <Search className="h-4 w-4 text-gray-400 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none text-sm font-bold outline-none w-32 focus:w-48 transition-all px-2 text-slate-900 dark:text-white placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          {user?.role !== 'ADMIN' && (
            <Link href="/cart" className="relative h-11 w-11 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group">
              <ShoppingBag className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md animate-in zoom-in">
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="h-11 w-11 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-md shadow-slate-900/20 group hover:bg-blue-600 dark:hover:bg-blue-600 transition-all outline-none">
                <User className="h-5 w-5 text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-[1.5rem] p-4 shadow-2xl border border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl mt-2" align="end">
                <div className="px-2 py-3 mb-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tài khoản</p>
                  <p className="font-black text-slate-900 dark:text-white text-lg truncate">{user?.name}</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-slate-800" />
                <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 mt-2 dark:focus:bg-slate-800" onClick={() => router.push('/profile')}>
                  <User className="h-4 w-4" /> Thông tin cá nhân
                </DropdownMenuItem>
                {user?.role !== 'ADMIN' && (
                  <>
                    <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 dark:focus:bg-slate-800" onClick={() => router.push('/orders')}>
                      <ShoppingBag className="h-4 w-4" /> Đơn hàng của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 dark:focus:bg-slate-800" onClick={() => router.push('/wishlist')}>
                      <Heart className="h-4 w-4" /> Sản phẩm yêu thích
                    </DropdownMenuItem>
                  </>
                )}
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:focus:bg-blue-900/30" onClick={() => router.push('/admin')}>
                    <LayoutDashboard className="h-4 w-4" /> Quản trị hệ thống
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-2 bg-gray-100 dark:bg-slate-800" />
                <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="rounded-xl font-black bg-slate-900 dark:bg-slate-800 h-11 px-6 shadow-md shadow-slate-900/20 hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors text-white" onClick={() => router.push('/login')}>
              Đăng nhập
            </Button>
          )}

          <ThemeToggle />

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden h-11 w-11 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5 dark:text-white" /> : <Menu className="h-5 w-5 dark:text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 p-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-6">
            <Link href="/" className="text-lg font-black text-slate-900 dark:text-white" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
            <Link href="/shop" className="text-lg font-black text-slate-900 dark:text-white" onClick={() => setIsMobileMenuOpen(false)}>Cửa hàng</Link>
            <div className="space-y-4">
              <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Danh mục</p>
              <div className="grid grid-cols-2 gap-3">
                {categories?.map((cat: any) => (
                  <Link key={cat.id} href={`/shop?category=${cat.id}`} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/support" className="text-lg font-black text-slate-900 dark:text-white" onClick={() => setIsMobileMenuOpen(false)}>Hỗ trợ</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
