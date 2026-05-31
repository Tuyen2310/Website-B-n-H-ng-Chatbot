import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ViewedProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  products: ViewedProduct[];
  addProduct: (product: Omit<ViewedProduct, 'viewedAt'>) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (product) => set((state) => {
        // Remove if already exists
        const filtered = state.products.filter(p => p.id !== product.id);
        // Add to beginning and keep max 10
        return {
          products: [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, 10)
        };
      }),
      clear: () => set({ products: [] })
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
);
