import api from "@/lib/axios";
import { toApiId } from "@/utils/api-util";

export interface ReadingFromAPI {
  id: string;
  tanque_id: string;
  id_tanque?: string;
  turbidez: number;
  temperatura: number;
  ph: number;
  oxigenio: number;
  amonia: number;
  cor_agua?: number;
  imagem_cor?: string;
  criado_em: string;
  atualizado_em: string;
  usuario_id?: string;
}

export interface ReadingsResponse {
  leituras: ReadingFromAPI[];
  pagina_atual: number;
  total_paginas: number;
  total: number;
  itens_por_pagina: number;
}

const normalizeReading = (reading: ReadingFromAPI): ReadingFromAPI => ({
  ...reading,
  id: String(reading.id),
  tanque_id: String(reading.tanque_id ?? reading.id_tanque),
  turbidez: Number(reading.turbidez),
  temperatura: Number(reading.temperatura ?? 0),
  ph: Number(reading.ph ?? 0),
  oxigenio: Number(reading.oxigenio ?? 0),
  amonia: Number(reading.amonia ?? 0),
  cor_agua: reading.cor_agua !== undefined ? Number(reading.cor_agua) : undefined,
});

export async function getReadings(
  tankId: string,
  page = 1,
  perPage = 50,
): Promise<ReadingsResponse> {
  const response = await api.get<ReadingsResponse>(
    `/v1/tanques/${toApiId(tankId)}/leituras`,
    {
      params: {
        page,
        per_page: perPage,
      },
    },
  );

  return {
    ...response.data,
    leituras: response.data.leituras.map(normalizeReading),
  };
}

export function convertAPIReadingToLocal(reading: ReadingFromAPI) {
  return {
    id: String(reading.id),
    propertyId: "",
    tankId: String(reading.tanque_id ?? reading.id_tanque),
    turbidez: Number(reading.turbidez),
    temperatura: Number(reading.temperatura ?? 0),
    ph: Number(reading.ph ?? 0),
    oxigenio: Number(reading.oxigenio ?? 0),
    amonia: Number(reading.amonia ?? 0),
    cor_agua: reading.cor_agua,
    imagem_cor: reading.imagem_cor,
    createdAt: new Date(reading.criado_em),
    updatedAt: new Date(reading.atualizado_em),
    syncStatus: "synced" as const,
    syncedAt: new Date(),
  };
}
