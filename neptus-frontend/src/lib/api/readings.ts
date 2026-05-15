import api from "@/lib/axios";

export interface ReadingFromAPI {
  id: string;
  tanque: string;
  turbidez: number;
  temperatura: number;
  ph: number;
  oxigenio: number;
  amonia: number;
  imagem_cor: string;
  criado_em: string;
  atualizado_em: string;
  usuario_id: string;
}

export interface ReadingsResponse {
  leituras: ReadingFromAPI[];
  pagina_atual: number;
  total_paginas: number;
  total: number;
  itens_por_pagina: number;
}

/**
 * Busca leituras do servidor com paginação
 * @param tankId - ID do tanque para filtrar
 * @param page - Número da página (padrão: 1)
 * @param perPage - Quantidade de itens por página (padrão: 50)
 */
export async function getReadings(
  tankId: string,
  page = 1,
  perPage = 50
): Promise<ReadingsResponse> {
  try {
    const response = await api.get<ReadingsResponse>("/v1/leituras", {
      params: {
        tanque_id: tankId,
        page,
        per_page: perPage,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar leituras:", error);
    throw error;
  }
}

/**
 * Converte leitura do API para formato local
 */
export function convertAPIReadingToLocal(reading: ReadingFromAPI) {
  return {
    id: reading.id,
    propertyId: "", // Será preenchido pelo contexto
    tankId: reading.tanque,
    turbidez: reading.turbidez,
    temperatura: reading.temperatura,
    ph: reading.ph,
    oxigenio: reading.oxigenio,
    amonia: reading.amonia,
    imagem_cor: reading.imagem_cor,
    createdAt: new Date(reading.criado_em),
    updatedAt: new Date(reading.atualizado_em),
    syncStatus: "synced" as const,
    syncedAt: new Date(),
  };
}
