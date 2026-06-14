"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

import LoadingSpinner from "./LoadingSpinner";

interface OnlineGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * Componente para proteger páginas que requerem conexão com internet
 * Redireciona para fallbackPath se estiver offline
 */
export const OnlineGuard = ({
  children,
  fallbackPath = "/",
}: OnlineGuardProps) => {
  const isOnline = useOnlineStatus();
  const router = useRouter();

  useEffect(() => {
    if (!isOnline) {
      router.push(fallbackPath);
    }
  }, [isOnline, router, fallbackPath]);

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">
          Esta página requer conexão com internet
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
