import { useCallback, useEffect, useState } from "react";

import { tanksDb } from "@/lib/db";
import type { Tank as DBTank } from "@/lib/db/schema";
import { AddTankSchema } from "@/schemas/addTank-schema";
import { usePropertyStore } from "@/stores/propertyStore";

export interface Tank {
  id: string;
  name: string;
  type: string;
  fish: string;
  fishCount: number;
  averageWeight: number;
  tankArea: number;
  createdAt: string;
}

/**
 * Hook para gerenciar tanques usando IndexedDB
 * IMPORTANTE: Requer propertyId configurado em localStorage
 */
export const useTanks = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedPropertyId } = usePropertyStore();

  // Converte Tank do IndexedDB para formato do componente
  const convertFromDB = (dbTank: DBTank): Tank => ({
    id: dbTank.id,
    name: dbTank.name,
    type: dbTank.fishType, // Usando fishType como type temporariamente
    fish: dbTank.fishType,
    fishCount: dbTank.fishCount,
    averageWeight: dbTank.fishWeight,
    tankArea: dbTank.area,
    createdAt: dbTank.createdAt.toISOString(),
  });

  // Carregar tanques do IndexedDB
  useEffect(() => {
    const loadTanks = async () => {
      try {
        if (!selectedPropertyId) {
          setTanks([]);
          setIsLoading(false);
          return;
        }

        // Busca tanques do IndexedDB
        const dbTanks = await tanksDb.getByProperty(selectedPropertyId);

        // Converte para formato do componente
        const convertedTanks = dbTanks.map(convertFromDB);

        setTanks(convertedTanks);
      } catch (error) {
        console.error("Erro ao carregar tanques do IndexedDB:", error);
        setTanks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTanks();

    // Listener para o evento customizado disparado por outras instâncias do hook
    const handleTanksUpdated = () => {
      loadTanks();
    };

    window.addEventListener("neptus_tanks_updated", handleTanksUpdated);

    return () => {
      window.removeEventListener("neptus_tanks_updated", handleTanksUpdated);
    };
  }, [selectedPropertyId]);

  // Recarregar tanques do IndexedDB
  const reloadTanks = useCallback(async () => {
    try {
      if (!selectedPropertyId) {
        setTanks([]);
        return;
      }

      const dbTanks = await tanksDb.getByProperty(selectedPropertyId);
      const convertedTanks = dbTanks.map(convertFromDB);
      setTanks(convertedTanks);
    } catch (error) {
      console.error("Erro ao recarregar tanques:", error);
    }
  }, [selectedPropertyId]);

  // Adicionar tanque (salva no IndexedDB com status pending)
  const addTank = useCallback(
    async (tankData: AddTankSchema) => {
      try {
        if (!selectedPropertyId) {
          throw new Error("PropertyId não configurado");
        }

        const userId = "local-user"; // TODO: Pegar do session

        const id = await tanksDb.add({
          propertyId: selectedPropertyId,
          userId,
          name: tankData.name,
          area: tankData.tankArea,
          fishType: tankData.fish,
          fishWeight: tankData.averageWeight,
          fishCount: tankData.fishCount,
          active: true,
        });

        // Recarrega a lista
        await reloadTanks();
        // Dispara evento para outras instâncias do mesmo hook
        window.dispatchEvent(new Event("neptus_tanks_updated"));

        return { id, ...tankData, createdAt: new Date().toISOString() } as Tank;
      } catch (error) {
        console.error("Erro ao adicionar tanque:", error);
        throw error;
      }
    },
    [reloadTanks, selectedPropertyId],
  );

  // Atualizar tanque (não implementado ainda - requer API)
  const updateTank = useCallback(
    async (id: string, tankData: AddTankSchema) => {
      // TODO: Implementar API de atualização
      return Promise.resolve();
    },
    [],
  );

  // Deletar tanque (não implementado ainda - requer API)
  const deleteTank = useCallback(async (id: string) => {
    // TODO: Implementar API de deleção
    return Promise.resolve();
  }, []);

  // Buscar tanque por ID
  const getTankById = useCallback(
    (id: string) => {
      return tanks.find((tank) => tank.id === id);
    },
    [tanks],
  );

  return {
    tanks,
    isLoading,
    addTank,
    updateTank,
    deleteTank,
    getTankById,
  };
};
