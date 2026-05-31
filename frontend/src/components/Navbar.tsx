"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, User, LogOut, LayoutDashboard, Bot, Menu, X, Key, ChevronDown, Heart } from "lucide-react";
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
        <Link href="/" className="flex items-center gap-2 group">
          {shopLogo ? (
            <img src={shopLogo} alt={shopName} className="h-10 w-auto object-contain" />
          ) : (
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
          )}
          <span className="text-2xl font-black tracking-tighter text-[#041B3C]">
            {shopName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          <Link href="/" className="navbar-link">Trang chủ</Link>
          <Link href="/shop" className="navbar-link">Cửa hàng</Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 navbar-link outline-none">
              Danh mục <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-none bg-white/95 backdrop-blur-md">
              {categories?.map((cat: any) => (
                <DropdownMenuItem key={cat.id} className="rounded-xl font-bold py-3 cursor-pointer" onClick={() => router.push(`/shop?category=${cat.id}`)}>
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/faqs" className="navbar-link">Hỗ trợ</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 border border-transparent focus-within:border-primary/20 transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none text-xs font-bold outline-none w-32 focus:w-48 transition-all px-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          {user?.role !== 'ADMIN' && (
            <Link href="/cart" className="relative h-11 w-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 hover:border-primary transition-colors group">
              <ShoppingBag className="h-5 w-5 text-[#041B3C] group-hover:text-primary transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="h-11 w-11 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-200 group hover:bg-primary transition-all outline-none">
                <User className="h-5 w-5 text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-[2rem] p-4 shadow-2xl border-none bg-white/95 backdrop-blur-md mt-2" align="end">
                <div className="px-2 py-3 mb-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tài khoản</p>
                  <p className="font-black text-[#041B3C] text-lg truncate">{user?.name}</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 mt-2" onClick={() => router.push('/profile')}>
                  <User className="h-4 w-4" /> Thông tin cá nhân
                </DropdownMenuItem>
                {user?.role !== 'ADMIN' && (
                  <>
                    <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3" onClick={() => router.push('/orders')}>
                      <ShoppingBag className="h-4 w-4" /> Đơn hàng của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3" onClick={() => router.push('/wishlist')}>
                      <Heart className="h-4 w-4" /> Sản phẩm yêu thích
                    </DropdownMenuItem>
                  </>
                )}
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 text-primary bg-primary/5" onClick={() => router.push('/admin')}>
                    <LayoutDashboard className="h-4 w-4" /> Quản trị hệ thống
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-2 bg-gray-100" />
                <DropdownMenuItem className="rounded-xl font-bold py-3 cursor-pointer gap-3 text-red-500 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="rounded-xl font-black bg-gray-900 h-11 px-6 shadow-lg shadow-gray-200" onClick={() => router.push('/login')}>
              Đăng nhập
            </Button>
          )}

          <ThemeToggle />

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden h-11 w-11 flex items-center justify-center bg-white rounded-xl border border-gray-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-6">
            <Link href="/" className="text-lg font-black text-[#041B3C]" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
            <Link href="/shop" className="text-lg font-black text-[#041B3C]" onClick={() => setIsMobileMenuOpen(false)}>Cửa hàng</Link>
            <div className="space-y-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Danh mục</p>
              <div className="grid grid-cols-2 gap-3">
                {categories?.map((cat: any) => (
                  <Link key={cat.id} href={`/shop?category=${cat.id}`} className="p-3 bg-gray-50 rounded-xl font-bold text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/faqs" className="text-lg font-black text-[#041B3C]" onClick={() => setIsMobileMenuOpen(false)}>Hỗ trợ</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
