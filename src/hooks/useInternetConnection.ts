"use client";

import { useEffect, useState } from "react";

export const useInternetConnection = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Função para verificar conectividade real
    const checkConnection = () => {
      setIsOnline(navigator.onLine);
    };

    // Verificação inicial
    checkConnection();

    // Listeners para mudanças de conectividade
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  return { isOnline };
};
