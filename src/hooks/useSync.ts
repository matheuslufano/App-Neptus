import { useEffect, useState } from "react";

import { syncManager, SyncStatus } from "@/lib/sync/manager";

/**
 * Hook para monitorar e gerenciar sincronização
 */
export function useSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: null,
    pendingCount: 0,
    error: null,
  });

  useEffect(() => {
    // Subscribe para atualizações
    const unsubscribe = syncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    // Busca status inicial
    syncManager.getStatus().then(setStatus);

    return unsubscribe;
  }, []);

  /**
   * Executa sincronização manualmente
   */
  const sync = async () => {
    try {
      const result = await syncManager.sync();
      console.log("Sincronização concluída:", result);
      return result;
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      throw error;
    }
  };

  return {
    ...status,
    sync,
  };
}

/**
 * Hook para sincronização automática em intervalo
 * @param intervalMs - Intervalo em milissegundos (padrão: 30000 = 30s)
 */
export function useSyncInterval(intervalMs = 30000) {
  const { sync, ...status } = useSync();

  useEffect(() => {
    // Sincroniza ao montar
    syncManager.sync().catch(console.error);

    // Sincroniza em intervalo
    const interval = setInterval(() => {
      syncManager.sync().catch(console.error);
    }, intervalMs);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]); // Remove 'sync' das dependências para evitar loop

  return { sync, ...status };
}
