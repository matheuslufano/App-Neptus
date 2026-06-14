"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function ReactQueryClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // Sempre considera dados stale para forçar refetch
            retry: 2,
            refetchOnWindowFocus: true, // Refetch quando a janela ganha foco
            refetchOnMount: true, // Sempre refetch ao montar
            refetchOnReconnect: true, // Refetch ao reconectar
            gcTime: 0, // Não mantém cache após desmontar (gcTime substitui cacheTime no v5)
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
