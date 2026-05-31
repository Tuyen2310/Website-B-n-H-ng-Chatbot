"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

export default function ProductReviews({ productId }: { productId: number }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: () => catalogApi.getReviews(productId),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => catalogApi.createReview(data.productId, data.rating, data.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      toast.success("Review submitted!");
      setComment("");
      setRating(5);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ productId, rating, comment });
  };

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>
      
      {/* Review Form */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`h-8 w-8 transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your thoughts about this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-white"
          />
          <Button type="submit" disabled={mutation.isPending}>
            Submit Review
          </Button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <p>Loading reviews...</p>
        ) : reviews?.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
        ) : (
          reviews?.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{review.user.name}</p>
                  <div className="flex gap-1 text-yellow-400 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 fill-current ${i < review.rating ? "" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {format(new Date(review.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
