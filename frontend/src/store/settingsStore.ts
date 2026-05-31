import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const currencySymbols: Record<string, string> = {
  USD: '$',
  VND: 'đ',
  EUR: '€',
  JPY: '¥',
};

import { PublicSettings } from '@/lib/api';

interface SettingsState {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
  publicSettings: PublicSettings | null;
  setPublicSettings: (settings: PublicSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'VND',
      currencySymbol: 'đ',
      publicSettings: null,
      setCurrency: (currency: string) => 
        set({ 
          currency, 
          currencySymbol: currencySymbols[currency] || 'đ' 
        }),
      setPublicSettings: (settings: PublicSettings) =>
        set({ publicSettings: settings }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
