import { AxiosError } from "axios";

import api from "@/lib/axios";
import { Reading } from "@/lib/db/schema";

export interface SyncResponse {
  code: string;
  message: string;
  status: number;
}

export interface SyncErrorResponse extends SyncResponse {
  leituras_erradas: Array<{
    tanque_id: string;
    turbidez: number;
    temperatura?: number;
    ph?: number;
    oxigenio?: number;
    amonia?: number;
    cor_agua?: number;
  }>;
}

/**
 * Converte Reading do IndexedDB para o formato do backend
 */
function formatReadingForBackend(reading: Reading) {
  return {
    tanque_id: reading.tankId,
    turbidez: reading.turbidez,
    temperatura: reading.temperatura,
    ph: reading.ph,
    oxigenio: reading.oxigenio,
    amonia: reading.amonia,
    cor_agua: reading.cor_agua,
  };
}

/**
 * Sincroniza leituras em lote com o servidor
 * @param readings - Array de leituras para sincronizar
 * @returns { success: boolean, syncedIds: string[], failedReadings: Reading[] }
 */
export async function syncReadingsBatch(readings: Reading[]): Promise<{
  success: boolean;
  syncedIds: string[];
  failedReadings: Reading[];
}> {
  if (!readings || readings.length === 0) {
    return { success: true, syncedIds: [], failedReadings: [] };
  }

  try {
    // Formata as leituras para o backend
    const payload = readings.map(formatReadingForBackend);

    // Envia para o servidor
    const response = await api.post<SyncResponse>("/v1/leituras/lote", payload);

    if (response.status === 201) {
      // Sucesso: retorna IDs das leituras sincronizadas
      return {
        success: true,
        syncedIds: readings.map((r) => r.id),
        failedReadings: [],
      };
    }

    // Se chegou aqui, algo inesperado aconteceu
    return {
      success: false,
      syncedIds: [],
      failedReadings: readings,
    };
  } catch (error: AxiosError | unknown) {
    // Verifica se é erro de conflito (alguns tanques inválidos)
    if (error instanceof AxiosError && error.response?.status === 409) {
      const errorData = error.response.data as SyncErrorResponse;

      // Identifica quais leituras falharam
      const failedTankIds = new Set(
        errorData.leituras_erradas?.map((r) => r.tanque_id) || [],
      );

      const syncedIds = readings
        .filter((r) => !failedTankIds.has(r.tankId))
        .map((r) => r.id);

      const failedReadings = readings.filter((r) =>
        failedTankIds.has(r.tankId),
      );

      console.warn("Sync parcial - algumas leituras falharam:", failedReadings);

      return {
        success: false,
        syncedIds,
        failedReadings,
      };
    }

    // Outros erros
    console.error("Erro ao sincronizar leituras:", error);
    return {
      success: false,
      syncedIds: [],
      failedReadings: readings,
    };
  }
}

/**
 * Sincroniza leituras de uma propriedade específica
 */
export async function syncPropertyReadings(
  propertyId: string,
  readings: Reading[],
) {
  const propertyReadings = readings.filter((r) => r.propertyId === propertyId);
  return syncReadingsBatch(propertyReadings);
}
