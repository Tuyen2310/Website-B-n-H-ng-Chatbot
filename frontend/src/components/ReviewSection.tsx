"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, ShieldCheck, Trash2, Reply, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ReviewSectionProps {
  productId: number;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => catalogApi.getReviews(productId),
  });

  const mutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      catalogApi.createReview(productId, data.rating, data.comment),
    onSuccess: () => {
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      setComment("");
      setIsWriting(false);
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể gửi đánh giá. Vui lòng kiểm tra lại.";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => catalogApi.adminDeleteReview(reviewId),
    onSuccess: () => {
      toast.success("Đã xóa đánh giá thành công.");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (data: { reviewId: number; reply: string }) =>
      catalogApi.replyToReview(data.reviewId, data.reply),
    onSuccess: () => {
      toast.success("Đã phản hồi đánh giá thành công.");
      setReplyingTo(null);
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể gửi phản hồi.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đánh giá.");
      return;
    }
    mutation.mutate({ rating, comment });
  };

  const handleReplySubmit = (reviewId: number) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ reviewId, reply: replyText });
  };

  if (isLoading) return <div className="py-20 text-center font-bold text-gray-400">Đang tải đánh giá...</div>;

  return (
    <div className="mt-32 space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-[#041B3C] flex items-center gap-4">
            Đánh giá từ khách hàng
            <Badge className="bg-primary/10 text-primary border-none text-lg px-4 py-1">{reviews?.length || 0}</Badge>
          </h2>
          <p className="text-gray-500 font-bold max-w-lg">
            Chia sẻ trải nghiệm của bạn với sản phẩm này để giúp những người mua khác có lựa chọn tốt hơn.
          </p>
        </div>
        
        {!isWriting && (
          <Button 
            onClick={() => setIsWriting(true)}
            className="rounded-2xl h-16 px-8 bg-primary hover:bg-[#003399] font-black text-lg shadow-xl shadow-primary/20"
          >
            Viết đánh giá
            <MessageSquare className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>

      {isWriting && (
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-black text-[#041B3C] uppercase tracking-widest">Mức độ hài lòng</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
                      s <= rating ? "bg-yellow-400 text-white shadow-lg shadow-yellow-200" : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    <Star className={`h-6 w-6 ${s <= rating ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-[#041B3C] uppercase tracking-widest">Nội dung đánh giá</label>
              <Textarea
                placeholder="Sản phẩm dùng rất tốt, tôi rất ưng ý..."
                className="min-h-[150px] rounded-[2rem] border-gray-100 focus:border-primary focus:ring-primary/20 text-lg font-medium p-6 shadow-inner"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="rounded-2xl h-14 px-10 bg-primary font-black shadow-lg shadow-primary/20"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="rounded-2xl h-14 px-8 font-black text-gray-500"
                onClick={() => setIsWriting(false)}
              >
                Hủy bỏ
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews?.length > 0 ? (
          reviews.map((review: any) => (
            <div key={review.id} className="group flex flex-col relative bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 rounded-[2.5rem] p-8 border border-transparent hover:border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {format(new Date(review.createdAt), "dd MMM, yyyy", { locale: vi })}
                </div>
              </div>

              <p className="text-gray-700 font-medium leading-relaxed mb-8 italic flex-grow">
                "{review.comment}"
              </p>

              {review.reply && (
                <div className="mb-6 p-5 bg-primary/5 rounded-2xl border border-primary/10 relative">
                  <div className="absolute -top-3 left-6 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest">Phản hồi từ Admin</div>
                  <p className="text-xs text-[#041B3C] font-bold leading-relaxed">{review.reply}</p>
                  <p className="text-[8px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">
                    {review.repliedAt && format(new Date(review.repliedAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
                  </p>
                </div>
              )}

              {replyingTo === review.id && (
                <div className="mb-6 space-y-3">
                  <Textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập phản hồi..."
                    className="min-h-[80px] rounded-xl text-sm font-medium border-gray-100"
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="rounded-lg h-9 bg-primary font-black text-[10px] uppercase px-4"
                      onClick={() => handleReplySubmit(review.id)}
                      disabled={replyMutation.isPending}
                    >
                      <Send className="h-3 w-3 mr-2" /> Gửi
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-lg h-9 font-black text-[10px] uppercase text-gray-400"
                      onClick={() => setReplyingTo(null)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-black text-primary border border-primary/20">
                    {review.user?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#041B3C]">{review.user?.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-black uppercase tracking-widest">
                      <ShieldCheck className="h-3 w-3" />
                      Đã mua hàng
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {user?.role === "ADMIN" && (
                    <>
                      {!review.reply && replyingTo !== review.id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-blue-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => setReplyingTo(review.id)}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => {
                          if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
                            deleteMutation.mutate(review.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-200/50">
            <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
              <MessageSquare className="h-10 w-10" />
            </div>
            <p className="text-xl font-black text-gray-400">Chưa có đánh giá nào</p>
            <p className="text-gray-400 font-bold mt-2">Hãy là người đầu tiên trải nghiệm và để lại nhận xét!</p>
          </div>
        )}
      </div>
    </div>
  );
}
