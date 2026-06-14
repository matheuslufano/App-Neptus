import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { tanksDb } from "@/lib/db";
import type { Tank as DBTank } from "@/lib/db/schema";
import { AddTankSchema } from "@/schemas/addTank-schema";
import {
  createTank as createTankRequest,
  deactivateTank as deactivateTankRequest,
  getAllTanks,
  TankFromAPI,
  updateTank as updateTankRequest,
} from "@/services/tanks-service";
import { usePropertyStore } from "@/stores/propertyStore";

export interface Tank {
  id: string;
  name: string;
  type: string;
  fish: string;
  fishCount: number;
  averageWeight: number;
  tankArea: number;
  active: boolean;
  createdAt: string;
}

const tankFromAPI = (apiTank: TankFromAPI): DBTank => ({
  id: apiTank.id,
  userId: apiTank.id_usuario,
  propertyId: apiTank.id_propriedade,
  name: apiTank.nome,
  area: apiTank.area_tanque,
  fishType: apiTank.tipo_peixe,
  fishWeight: apiTank.peso_peixe,
  fishCount: apiTank.qtd_peixe,
  active: apiTank.ativo,
  createdAt: apiTank.criado_em ? new Date(apiTank.criado_em) : new Date(),
  updatedAt: apiTank.atualizado_em ? new Date(apiTank.atualizado_em) : new Date(),
  syncStatus: "synced",
});

const convertFromDB = (dbTank: DBTank): Tank => ({
  id: dbTank.id,
  name: dbTank.name,
  type: "tanque",
  fish: dbTank.fishType,
  fishCount: dbTank.fishCount,
  averageWeight: dbTank.fishWeight,
  tankArea: dbTank.area,
  active: dbTank.active,
  createdAt: dbTank.createdAt.toISOString(),
});

const visibleTanks = (tanks: DBTank[]): Tank[] =>
  tanks.filter((tank) => tank.active).map(convertFromDB);

export const useTanks = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedPropertyId } = usePropertyStore();
  const { data: session, status: sessionStatus } = useSession();

  const loadTanks = useCallback(async () => {
    if (!selectedPropertyId) {
      setTanks([]);
      setIsLoading(false);
      return;
    }

    if (sessionStatus === "loading") {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);

    try {
      const apiTanks = await getAllTanks(
        selectedPropertyId,
        session?.access_token,
      );
      const syncedTanks = apiTanks.map(tankFromAPI);

      await tanksDb.clearByProperty(selectedPropertyId);
      await tanksDb.bulkPut(syncedTanks);
      setTanks(visibleTanks(syncedTanks));
    } catch (error) {
      console.error("Erro ao carregar tanques da API:", error);
      const dbTanks = await tanksDb.getByProperty(selectedPropertyId);
      setTanks(visibleTanks(dbTanks));
    } finally {
      setIsLoading(false);
    }
  }, [selectedPropertyId, session?.access_token, sessionStatus]);

  useEffect(() => {
    loadTanks();

    const handleTanksUpdated = () => {
      loadTanks();
    };

    window.addEventListener("neptus_tanks_updated", handleTanksUpdated);

    return () => {
      window.removeEventListener("neptus_tanks_updated", handleTanksUpdated);
    };
  }, [loadTanks]);

  const reloadTanks = useCallback(async () => {
    await loadTanks();
  }, [loadTanks]);

  const addTank = useCallback(
    async (tankData: AddTankSchema) => {
      if (!selectedPropertyId) {
        throw new Error("PropertyId nao configurado");
      }

      if (!session?.user.id) {
        throw new Error("Usuario nao autenticado");
      }

      const apiTank = await createTankRequest(
        {
          nome: tankData.name,
          id_propriedade: selectedPropertyId,
          id_usuario: session.user.id,
          area_tanque: tankData.tankArea,
          tipo_peixe: tankData.fish,
          peso_peixe: tankData.averageWeight,
          qtd_peixe: tankData.fishCount,
          ativo: true,
        },
        session.access_token,
      );

      await tanksDb.save(tankFromAPI(apiTank));
      await reloadTanks();
      window.dispatchEvent(new Event("neptus_tanks_updated"));

      return convertFromDB(tankFromAPI(apiTank));
    },
    [reloadTanks, selectedPropertyId, session?.access_token, session?.user.id],
  );

  const updateTank = useCallback(
    async (id: string, tankData: AddTankSchema) => {
      const apiTank = await updateTankRequest(
        id,
        {
          nome: tankData.name,
          area_tanque: tankData.tankArea,
          tipo_peixe: tankData.fish,
          peso_peixe: tankData.averageWeight,
          qtd_peixe: tankData.fishCount,
          ativo: true,
        },
        session?.access_token,
      );

      await tanksDb.save(tankFromAPI(apiTank));
      await reloadTanks();
      window.dispatchEvent(new Event("neptus_tanks_updated"));
    },
    [reloadTanks, session?.access_token],
  );

  const deleteTank = useCallback(
    async (id: string) => {
      await deactivateTankRequest(id, session?.access_token);
      await tanksDb.remove(id);
      await reloadTanks();
      window.dispatchEvent(new Event("neptus_tanks_updated"));
    },
    [reloadTanks, session?.access_token],
  );

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
    refetch: reloadTanks,
  };
};
