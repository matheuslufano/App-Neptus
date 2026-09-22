"use client";

import { SessionProvider } from "next-auth/react";

import OfflineAuthManager from "@/components/OfflineAuthManager";
import { ReactQueryClientProvider } from "@/lib/react-query-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryClientProvider>
      <SessionProvider>
        <OfflineAuthManager />
        {children}
      </SessionProvider>
    </ReactQueryClientProvider>
  );
}
