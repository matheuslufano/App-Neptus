"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";

import { useInternetConnection } from "@/hooks/useInternetConnection";
import { useOfflineAuthStore } from "@/stores/offlineAuthStore";

export default function OfflineAuthManager() {
  const { data: session, status } = useSession();
  const { isOnline } = useInternetConnection(); // Hook correto aqui
  const { setOfflineStatus, setCachedUser, validateOfflineSession } =
    useOfflineAuthStore();

  const handleOfflineStatus = useCallback(() => {
    setOfflineStatus(!isOnline);
  }, [isOnline, setOfflineStatus]);

  const handleCacheUser = useCallback(() => {
    if (isOnline && status === "authenticated" && session?.user) {
      setCachedUser(session.user);
    }
  }, [isOnline, status, session?.user, setCachedUser]);

  const handleValidateSession = useCallback(() => {
    // Sempre valida a sessão offline quando não está online
    if (!isOnline) {
      const isValid = validateOfflineSession();
      console.log("🔒 Validação sessão offline:", isValid);
    }
  }, [isOnline, validateOfflineSession]);

  // Executa validação inicial na montagem do componente
  useEffect(() => {
    validateOfflineSession();
  }, [validateOfflineSession]);

  useEffect(() => {
    handleOfflineStatus();
  }, [handleOfflineStatus]);

  useEffect(() => {
    handleCacheUser();
  }, [handleCacheUser]);

  useEffect(() => {
    handleValidateSession();
  }, [handleValidateSession]);

  return null;
}
export function useAuthState() {
  const { data: session, status } = useSession();
  const { isOnline } = useInternetConnection();
  const { cachedUser, offlineSessionValid, isDevMode, isAuthRequired } =
    useOfflineAuthStore();

  // Se está em modo de desenvolvimento, sempre autenticado
  if (isDevMode()) {
    return {
      isAuthenticated: true,
      user: { name: "Dev User", email: "dev@test.com" },
      isLoading: false,
      isOffline: !isOnline,
    };
  }

  // Se não precisa de auth, considera autenticado
  if (!isAuthRequired()) {
    const user = cachedUser || {
      name: "Offline User",
      email: "offline@local.com",
    };
    return {
      isAuthenticated: true,
      user,
      isLoading: false,
      isOffline: !isOnline,
    };
  }

  // Lógica normal de autenticação
  if (isOnline) {
    return {
      isAuthenticated: status === "authenticated",
      user: session?.user || null,
      isLoading: status === "loading",
      isOffline: false,
    };
  }

  // Em modo offline, só permite se já logou antes E tem sessão válida
  return {
    isAuthenticated: offlineSessionValid && cachedUser !== null,
    user: offlineSessionValid ? cachedUser : null,
    isLoading: false,
    isOffline: true,
  };
}
