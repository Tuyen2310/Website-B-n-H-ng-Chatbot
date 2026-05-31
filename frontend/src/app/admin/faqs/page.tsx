"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi, adminApi } from "@/lib/api";
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
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  MessageSquare, 
  Filter, 
  Link as LinkIcon,
  Bot,
  Activity,
  MoreVertical,
  Save,
  Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function AdminFaqsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"faqs" | "logs">("faqs");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    topic: "Sản phẩm",
    productId: ""
  });

  const { data: faqs, isLoading: isLoadingFaqs } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: () => catalogApi.getFaqs(),
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-minimal"],
    queryFn: () => catalogApi.getProducts({ limit: 100 }),
  });

  const { data: chatbotLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["admin-chatbot-logs"],
    queryFn: () => adminApi.getChatbotLogs(),
    enabled: activeTab === "logs"
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => catalogApi.createFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("Đã thêm FAQ mới.");
      handleCloseModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => catalogApi.updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("Đã cập nhật FAQ.");
      handleCloseModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogApi.deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("Đã xóa FAQ.");
    }
  });

  // Handlers
  const handleOpenModal = (faq: any = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        topic: faq.topic,
        productId: faq.productId?.toString() || ""
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: "",
        answer: "",
        topic: "Sản phẩm",
        productId: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      productId: formData.productId ? parseInt(formData.productId) : null
    };

    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredFaqs = faqs?.filter((f: any) => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Dữ liệu Chatbot</h1>
          <p className="text-gray-400 font-medium italic">Quản lý kho tri thức của AI để phản hồi khách hàng chính xác nhất.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1">
                <Button 
                    variant={activeTab === "faqs" ? "default" : "ghost"}
                    className={`rounded-xl h-10 px-6 font-bold ${activeTab === "faqs" ? "shadow-lg" : "text-gray-500"}`}
                    onClick={() => setActiveTab("faqs")}
                >
                    FAQs
                </Button>
                <Button 
                    variant={activeTab === "logs" ? "default" : "ghost"}
                    className={`rounded-xl h-10 px-6 font-bold ${activeTab === "logs" ? "shadow-lg" : "text-gray-500"}`}
                    onClick={() => setActiveTab("logs")}
                >
                    Lịch sử chat
                </Button>
            </div>
            {activeTab === "faqs" && (
                <Button 
                    className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20 gap-2"
                    onClick={() => handleOpenModal()}
                >
                    <Plus className="h-5 w-5" /> Thêm FAQ
                </Button>
            )}
        </div>
      </div>

      {activeTab === "faqs" ? (
        <>
            {/* Stats row for Chatbot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-900 rounded-[2rem] p-6 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Tổng số câu hỏi</p>
                            <h3 className="text-2xl font-black">{faqs?.length || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tỷ lệ phản hồi đúng</p>
                        <h3 className="text-2xl font-black text-gray-900">98.5%</h3>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Lượt tương tác / ngày</p>
                        <h3 className="text-2xl font-black text-gray-900">1,240</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                <div className="md:col-span-3 space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tìm kiếm nội dung</Label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Nội dung câu hỏi, câu trả lời..." 
                            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-end">
                    <Button variant="outline" className="w-full h-12 rounded-xl border-gray-100 font-bold gap-2 text-gray-500 hover:bg-gray-50 transition-all" onClick={() => setSearchTerm("")}>
                        <Filter className="h-4 w-4" /> Đặt lại
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                    <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung câu hỏi & trả lời</TableHead>
                        <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chủ đề</TableHead>
                        <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm liên kết</TableHead>
                        <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cập nhật lần cuối</TableHead>
                        <TableHead className="w-20 p-8"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoadingFaqs ? (
                        Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-gray-50">
                            <TableCell className="p-8 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            </TableCell>
                            <TableCell className="p-8"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell className="p-8"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell className="p-8"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="p-8"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                        </TableRow>
                        ))
                    ) : filteredFaqs?.length > 0 ? (
                        filteredFaqs.map((faq: any) => (
                        <TableRow key={faq.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                            <TableCell className="p-8 max-w-md">
                            <p className="font-black text-gray-900 text-sm mb-2">{faq.question}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 italic leading-relaxed">{faq.answer}</p>
                            </TableCell>
                            <TableCell className="p-8">
                            <Badge variant="outline" className="rounded-full bg-indigo-50 text-primary border-none font-black uppercase tracking-widest text-[9px] px-3">
                                {faq.topic}
                            </Badge>
                            </TableCell>
                            <TableCell className="p-8">
                            {faq.productId ? (
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
                                <LinkIcon className="h-3 w-3 text-primary" />
                                {faq.product?.name}
                                </div>
                            ) : (
                                <span className="text-[10px] text-gray-300 italic font-medium">Toàn hệ thống</span>
                            )}
                            </TableCell>
                            <TableCell className="p-8 font-bold text-gray-400 text-xs">
                            {new Date(faq.updatedAt).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell className="p-8">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="rounded-xl text-gray-400 hover:text-primary h-9 w-9 flex items-center justify-center hover:bg-gray-50 transition-all outline-none">
                                    <MoreVertical className="h-5 w-5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-2 shadow-xl border-gray-100">
                                <DropdownMenuItem 
                                    className="rounded-lg gap-2 cursor-pointer font-bold"
                                    onClick={() => handleOpenModal(faq)}
                                >
                                    <Pencil className="h-4 w-4" /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="rounded-lg gap-2 cursor-pointer font-bold text-red-500 focus:bg-red-50"
                                    onClick={() => {
                                        if (window.confirm("Xóa FAQ này?")) {
                                            deleteMutation.mutate(faq.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" /> Xóa
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                            <MessageSquare className="h-16 w-16 text-gray-200" />
                            <p className="text-gray-500 font-bold">Chưa có câu hỏi FAQ nào được tạo.</p>
                            </div>
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </div>
            </div>
        </>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100/50 overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50/50">
                <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Thời gian</TableHead>
                    <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Khách hàng</TableHead>
                    <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Câu hỏi</TableHead>
                    <TableHead className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chatbot phản hồi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoadingLogs ? (
                    Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-gray-50">
                        <TableCell className="p-8"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="p-8"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="p-8"><Skeleton className="h-10 w-full" /></TableCell>
                        <TableCell className="p-8"><Skeleton className="h-20 w-full" /></TableCell>
                    </TableRow>
                    ))
                ) : chatbotLogs?.length > 0 ? (
                    chatbotLogs.map((log: any) => (
                    <TableRow key={log.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        <TableCell className="p-8 align-top text-xs font-bold text-gray-500">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell className="p-8 align-top">
                            {log.userId ? (
                                <Badge variant="outline" className="rounded-full bg-blue-50 text-blue-600 border-none font-black text-[9px] px-3">
                                    User #{log.userId}
                                </Badge>
                            ) : (
                                <span className="text-[10px] text-gray-400 italic font-bold">Khách vãng lai</span>
                            )}
                        </TableCell>
                        <TableCell className="p-8 align-top">
                            <p className="font-black text-gray-900 text-sm whitespace-pre-wrap">{log.question}</p>
                        </TableCell>
                        <TableCell className="p-8 align-top">
                            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-wrap break-words line-clamp-6 hover:line-clamp-none transition-all">{log.answer}</p>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={4} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                        <MessageSquare className="h-16 w-16 text-gray-200" />
                        <p className="text-gray-500 font-bold">Chưa có lịch sử hội thoại nào.</p>
                        </div>
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
        </div>
      )}

      {/* FAQ Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] overflow-hidden p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-white">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {editingFaq ? "Chỉnh sửa FAQ" : "Thêm tri thức mới"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <Label htmlFor="question" className="font-bold">Câu hỏi</Label>
              <Input 
                id="question" 
                value={formData.question} 
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                required 
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer" className="font-bold">Câu trả lời</Label>
              <Textarea 
                id="answer" 
                rows={4} 
                value={formData.answer} 
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                required 
                className="rounded-xl resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="font-bold">Chủ đề</Label>
                    <Select value={formData.topic} onValueChange={(v) => setFormData({...formData, topic: v || ""})}>
                        <SelectTrigger className="rounded-xl h-12">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="Sản phẩm">Sản phẩm</SelectItem>
                            <SelectItem value="Giao hàng">Giao hàng</SelectItem>
                            <SelectItem value="Thanh toán">Thanh toán</SelectItem>
                            <SelectItem value="Khác">Khác</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-bold">Liên kết sản phẩm (Tùy chọn)</Label>
                    <Select value={formData.productId} onValueChange={(v) => setFormData({...formData, productId: v || ""})}>
                        <SelectTrigger className="rounded-xl h-12">
                            <SelectValue placeholder="Chọn sản phẩm" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="">Không liên kết</SelectItem>
                            {products?.items?.map((p: any) => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" className="rounded-xl h-12 font-bold" onClick={handleCloseModal}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="rounded-xl h-12 px-8 font-black gap-2 shadow-lg shadow-primary/20">
                <Save className="h-5 w-5" />
                {editingFaq ? "Lưu thay đổi" : "Lưu tri thức"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
