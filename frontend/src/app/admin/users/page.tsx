"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Shield,
  User as UserIcon,
  ChevronRight,
  Mail,
  Phone
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";


export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [blockFilter, setBlockFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, limit],
    queryFn: () => adminApi.getUsers({
      skip: (page - 1) * limit,
      take: limit,
    }),
  });

  const users = data?.items || [];
  const totalUsers = data?.total || 0;

  const filteredUsers = users.filter((u: any) => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchBlock = blockFilter === "ALL" || (blockFilter === "BLOCKED" ? u.isBlocked : !u.isBlocked);
    return matchSearch && matchRole && matchBlock;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Quản lý người dùng</h1>
          <p className="text-gray-400 font-medium italic">Quản lý tài khoản khách hàng và phân quyền hệ thống.</p>
        </div>
        <Button 
          className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-105"
          onClick={() => router.push("/admin/users/new")}
        >
          <Plus className="h-5 w-5" /> Thêm tài khoản
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="md:col-span-1 space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tìm người dùng</Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Tên hoặc email..." 
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Vai trò</Label>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v || "ALL")}>
            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="ALL">Tất cả vai trò</SelectItem>
              <SelectItem value="USER">Người dùng</SelectItem>
              <SelectItem value="ADMIN">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Trạng thái</Label>
          <Select value={blockFilter} onValueChange={(v) => setBlockFilter(v || "ALL")}>
            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
              <SelectItem value="BLOCKED">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
            <Button variant="outline" className="w-full h-12 rounded-xl border-gray-100 font-bold gap-2 text-gray-500 hover:bg-gray-50 transition-all" onClick={() => { setSearchTerm(""); setRoleFilter("ALL"); setBlockFilter("ALL"); }}>
                <Filter className="h-4 w-4" /> Đặt lại
            </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
              <p className="text-3xl font-black text-indigo-900">{users.length}</p>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tổng người dùng</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100">
              <p className="text-3xl font-black text-purple-900">{users.filter((u: any) => u.role === 'ADMIN').length}</p>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Quản trị viên</p>
          </div>
          <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100">
              <p className="text-3xl font-black text-green-900">{users.filter((u: any) => !u.isBlocked).length}</p>
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Đang hoạt động</p>
          </div>
          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
              <p className="text-3xl font-black text-red-900">{users.filter((u: any) => u.isBlocked).length}</p>
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Đã khóa</p>
          </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/20 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành viên</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thông tin liên hệ</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Vai trò</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ngày gia nhập</TableHead>
                <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</TableHead>
                <TableHead className="w-20 p-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    <TableCell className="p-8"><Skeleton className="h-12 w-40 rounded-xl" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-10 w-48 rounded-xl" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></TableCell>
                    <TableCell className="p-8"><Skeleton className="h-8 w-8 rounded-lg mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user: any) => (
                  <TableRow 
                    key={user.id} 
                    className="border-b border-gray-50 hover:bg-gray-50/80 transition-all cursor-pointer group"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <TableCell className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-base">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID #{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Mail className="h-3 w-3" /> {user.email}
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <Phone className="h-3 w-3" /> {user.phone}
                                </div>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="p-8 text-center" onClick={(e) => e.stopPropagation()}>
                      <Select 
                        value={user.role} 
                        onValueChange={(newRole) => {
                          if (!newRole) return;
                          adminApi.updateUser(user.id, { role: newRole })
                            .then(() => {
                              queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                              toast.success("Đã cập nhật vai trò.");
                            })
                            .catch(() => toast.error("Cập nhật thất bại."));
                        }}
                      >
                        <SelectTrigger className={`h-8 rounded-full border-none font-black uppercase tracking-widest text-[9px] px-3 ${user.role === "ADMIN" ? "bg-indigo-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl border-none">
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-8 text-center font-bold text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="p-8 text-center" onClick={(e) => e.stopPropagation()}>
                      <Badge 
                        className={`rounded-full border-none font-black uppercase tracking-widest text-[9px] px-3 cursor-pointer transition-all hover:scale-110 ${user.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                        onClick={() => {
                            adminApi.updateUser(user.id, { isBlocked: !user.isBlocked })
                                .then(() => {
                                    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                                    toast.success(user.isBlocked ? "Đã bỏ khóa tài khoản" : "Đã khóa tài khoản");
                                })
                                .catch(() => toast.error("Thao tác thất bại."));
                        }}
                      >
                        {user.isBlocked ? "Đã khóa" : "Hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-8">
                        <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200">
                        <Users className="h-12 w-12" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">Không tìm thấy tài khoản</h3>
                      <p className="text-gray-400 font-bold text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm tên khác.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationControls 
          total={totalUsers}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}
