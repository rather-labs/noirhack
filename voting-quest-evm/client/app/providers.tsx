"use client";

import { SessionProvider } from "next-auth/react";
import { Web3Provider } from "../src/components/Web3Provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Web3Provider>{children}</Web3Provider>
    </SessionProvider>
  );
} 