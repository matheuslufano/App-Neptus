import api from "@/lib/axios";
import { Reading } from "@/lib/db/schema";
import { toApiId } from "@/utils/api-util";
import { getUserIdFromToken } from "@/utils/jwt-util";

export interface SyncResponse {
  code: string;
  message: string;
  status: number;
}

function requiredNumber(value: number | undefined, fallback = 0): number {
  return Number(value ?? fallback);
}

function formatReadingForBackend(reading: Reading, userId: string) {
  return {
    tanque_id: toApiId(reading.tankId),
    usuario_id: toApiId(userId),
    turbidez: requiredNumber(reading.turbidez),
    temperatura: requiredNumber(reading.temperatura),
    ph: requiredNumber(reading.ph),
    oxigenio: requiredNumber(reading.oxigenio),
    amonia: requiredNumber(reading.amonia),
    cor_agua: requiredNumber(reading.cor_agua),
  };
}

export async function syncReadingsBatch(readings: Reading[]): Promise<{
  success: boolean;
  syncedIds: string[];
  failedReadings: Reading[];
}> {
  if (!readings || readings.length === 0) {
    return { success: true, syncedIds: [], failedReadings: [] };
  }

  const userId = await getUserIdFromToken();

  if (!userId) {
    return {
      success: false,
      syncedIds: [],
      failedReadings: readings,
    };
  }

  const results = await Promise.allSettled(
    readings.map(async (reading) => {
      await api.post("/v1/leituras", formatReadingForBackend(reading, userId));
      return reading.id;
    }),
  );

  const syncedIds: string[] = [];
  const failedReadings: Reading[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      syncedIds.push(result.value);
      return;
    }

    failedReadings.push(readings[index]);
  });

  return {
    success: failedReadings.length === 0,
    syncedIds,
    failedReadings,
  };
}

export async function syncPropertyReadings(
  propertyId: string,
  readings: Reading[],
) {
  const propertyReadings = readings.filter((r) => r.propertyId === propertyId);
  return syncReadingsBatch(propertyReadings);
}
