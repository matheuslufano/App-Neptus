"use client";

import { CheckCircle, Upload, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { useInternetConnection } from "@/hooks/useInternetConnection";
import { useSyncInterval } from "@/hooks/useSync";

export default function DataSyncManager() {
  const { isOnline } = useInternetConnection();
  const { isSyncing, pendingCount, error, sync } = useSyncInterval(30000);
  const [displayStatus, setDisplayStatus] = useState<
    "idle" | "syncing" | "synced" | "error"
  >("idle");

  // Mapeia o estado global de sincronização PWA (Background Sync/Hooks) para a UI
  useEffect(() => {
    if (isSyncing) {
      setDisplayStatus("syncing");
    } else if (error) {
      setDisplayStatus("error");
    } else if (pendingCount === 0) {
      setDisplayStatus("idle");
    }
  }, [isSyncing, error, pendingCount]);

  const handleManualSync = async () => {
    try {
      await sync();
      setDisplayStatus("synced");
      setTimeout(() => {
        setDisplayStatus("idle");
      }, 3000);
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
      setDisplayStatus("error");
      setTimeout(() => {
        setDisplayStatus("idle");
      }, 3000);
    }
  };

  // Oculta a interface otimista caso não exista uma pendência de sincronização no IndexedDB/State

  if (pendingCount === 0 && displayStatus === "idle") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-3 flex items-center gap-2 text-sm">
        {displayStatus === "syncing" && (
          <>
            <Upload className="w-4 h-4 animate-spin text-blue-500" />
            <span>Sincronizando {pendingCount} leituras...</span>
          </>
        )}

        {displayStatus === "synced" && (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Dados sincronizados!</span>
          </>
        )}

        {displayStatus === "error" && (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span>Erro na sincronização</span>
          </>
        )}

        {displayStatus === "idle" && pendingCount > 0 && (
          <>
            <Wifi className="w-4 h-4 text-orange-500" />
            <span>{pendingCount} leituras pendentes</span>
            {isOnline && (
              <button
                onClick={handleManualSync}
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Sincronizar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
