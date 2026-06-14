import { useEffect, useState } from "react";

import { tanksDb } from "@/lib/db";

/**
 * Hook para verificar se o usuário precisa fazer sincronização inicial
 * Verifica se já tem dados no IndexedDB
 */
export function useNeedsInitialSync(propertyId?: string) {
  const [needsSync, setNeedsSync] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkIfNeedsSync = async () => {
      try {
        // Verifica se já marcou como sincronizado
        const hasInitialSync = localStorage.getItem("hasInitialSync");

        if (hasInitialSync === "true") {
          setNeedsSync(false);
          setIsChecking(false);
          return;
        }

        // Se não tem propertyId, não pode verificar
        if (!propertyId) {
          setNeedsSync(false);
          setIsChecking(false);
          return;
        }

        // Verifica se já tem tanques no IndexedDB
        const tanks = await tanksDb.getByProperty(propertyId);

        if (tanks.length === 0) {
          // Não tem dados, precisa sincronizar
          setNeedsSync(true);
        } else {
          // Já tem dados, marca como sincronizado
          localStorage.setItem("hasInitialSync", "true");
          setNeedsSync(false);
        }
      } catch (error) {
        console.error("Erro ao verificar necessidade de sync inicial:", error);
        setNeedsSync(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkIfNeedsSync();
  }, [propertyId]);

  return { needsSync, isChecking };
}
