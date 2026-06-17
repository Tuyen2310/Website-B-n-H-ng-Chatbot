"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

// Suppress the React 19 warnings caused by third-party libraries (next-themes script tag & base-ui collapsible attribute)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: any[]) => {
    const msg = args.map(a => String(a)).join(" ");
    if (
      msg.includes("Encountered a script tag") ||
      msg.includes("non-boolean attribute `collapsible`") ||
      msg.includes("collapsible=\"true\"")
    ) {
      return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
