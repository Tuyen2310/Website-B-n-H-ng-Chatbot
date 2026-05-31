"use client";

import { useSettingsStore } from "@/store/settingsStore";

interface PriceProps {
  amount: number;
  className?: string;
}

export function Price({ amount, className }: PriceProps) {
  const { currency, currencySymbol } = useSettingsStore();

  const formattedAmount = amount?.toLocaleString();

  if (currency === "VND") {
    return <span className={className}>{formattedAmount}{currencySymbol}</span>;
  }

  return <span className={className}>{currencySymbol}{formattedAmount}</span>;
}
