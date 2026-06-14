"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useInternetConnection } from "@/hooks/useInternetConnection";
import { useOfflineAuthStore } from "@/stores/offlineAuthStore";

export default function OfflineInitializer() {
  const { isOnline } = useInternetConnection();
  const { hasEverLoggedIn } = useOfflineAuthStore();
  const router = useRouter();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Só executa uma vez na inicialização
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const currentPath = window.location.pathname;

    // Se está offline E nunca logou E não está na página de login
    if (!isOnline && !hasEverLoggedIn && currentPath !== "/login") {
      console.log("🔄 Redirecionando para login - primeira vez offline");
      router.replace("/login");
    }
  }, [isOnline, hasEverLoggedIn, router]);

  return null;
}
