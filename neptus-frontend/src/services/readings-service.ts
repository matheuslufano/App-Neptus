import { AxiosError } from "axios";

import api from "@/lib/axios";
import { formatAndThrowError } from "@/utils/error-util";

// Tipos da API
export interface ReadingFromAPI {
  id: string;
  id_tanque: string;
  turbidez: number;
  temperatura?: number;
  ph?: number;
  oxigenio?: number;
  amonia?: number;
  cor_agua?: number;
  criado_em: string;
  atualizado_em: string;
}

export interface GetReadingsResponse {
  total: number;
  pagina_atual: number;
  itens_por_pagina: number;
  total_paginas: number;
  leituras: ReadingFromAPI[];
}

export interface GetReadingsParams {
  tanque_id?: string;
  per_page?: number;
  page?: number;
}

/**
 * Busca leituras do servidor com paginação
 */
export const getReadings = async (
  params: GetReadingsParams,
  accessToken: string,
): Promise<GetReadingsResponse> => {
  try {
    const { data } = await api.get<GetReadingsResponse>("/v1/leituras", {
      params: {
        tanque_id: params.tanque_id,
        per_page: params.per_page || 50,
        page: params.page || 1,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data;
  } catch (error) {
    console.error("Erro ao buscar leituras:", error as AxiosError);
    throw formatAndThrowError(error, "Erro ao buscar leituras do servidor");
  }
};

/**
 * Busca TODAS as leituras de um tanque (lida com paginação automaticamente)
 */
export const getAllReadingsByTank = async (
  tankId: string,
  accessToken: string,
): Promise<ReadingFromAPI[]> => {
  const allReadings: ReadingFromAPI[] = [];
  let totalPages = 1;

  try {
    // Busca primeira página
    const firstPageData = await getReadings(
      { tanque_id: tankId, per_page: 50, page: 1 },
      accessToken,
    );

    allReadings.push(...firstPageData.leituras);
    totalPages = firstPageData.total_paginas;

    // Se houver mais páginas, busca todas
    if (totalPages > 1) {
      const promises = [];
      for (let page = 2; page <= totalPages; page++) {
        promises.push(
          getReadings({ tanque_id: tankId, per_page: 50, page }, accessToken),
        );
      }

      const results = await Promise.all(promises);
      results.forEach((result) => allReadings.push(...result.leituras));
    }

    return allReadings;
  } catch (error) {
    console.error("Erro ao buscar todas as leituras:", error);
    throw error;
  }
};
