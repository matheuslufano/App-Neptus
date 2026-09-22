"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { useInternetConnection } from "@/hooks/useInternetConnection";
import { useOfflineAuthStore } from "@/stores/offlineAuthStore";

const OfflineIndicator = () => {
  const { isOnline } = useInternetConnection();
  const { cachedUser, offlineSessionValid } = useOfflineAuthStore();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Mostra mensagem quando offline
    if (!isOnline) {
      setShowOfflineMessage(true);
      
      // Se tem usuário em cache e sessão válida, esconde a mensagem após alguns segundos
      if (cachedUser && offlineSessionValid) {
        const timer = setTimeout(() => {
          setShowOfflineMessage(false);
        }, 4000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setShowOfflineMessage(false);
    }
  }, [isOnline, cachedUser, offlineSessionValid]);

  if (!showOfflineMessage || isOnline) return null;

  const hasValidOfflineAuth = cachedUser && offlineSessionValid;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 text-white p-2 text-center text-sm ${
      hasValidOfflineAuth ? 'bg-orange-500' : 'bg-red-500'
    }`}>
      <div className="flex items-center justify-center gap-2 max-w-[430px] mx-auto">
        {hasValidOfflineAuth ? (
          <>
            <Wifi size={16} />
            <span>Modo offline ativo - dados em cache disponíveis</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>Você está offline. Conecte-se à internet para continuar.</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
