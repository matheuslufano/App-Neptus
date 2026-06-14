import api from "@/lib/axios";
import { toApiId } from "@/utils/api-util";
import { formatAndThrowError } from "@/utils/error-util";

export interface ReadingFromAPI {
  id: string;
  tanque_id: string;
  id_tanque?: string;
  usuario_id?: string;
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
  tanque_id: string;
  per_page?: number;
  page?: number;
}

const getAuthHeaders = (accessToken?: string) =>
  accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

const normalizeReading = (reading: ReadingFromAPI): ReadingFromAPI => ({
  ...reading,
  id: String(reading.id),
  tanque_id: String(reading.tanque_id ?? reading.id_tanque),
  usuario_id:
    reading.usuario_id !== undefined ? String(reading.usuario_id) : undefined,
  turbidez: Number(reading.turbidez),
  temperatura:
    reading.temperatura !== undefined ? Number(reading.temperatura) : undefined,
  ph: reading.ph !== undefined ? Number(reading.ph) : undefined,
  oxigenio: reading.oxigenio !== undefined ? Number(reading.oxigenio) : undefined,
  amonia: reading.amonia !== undefined ? Number(reading.amonia) : undefined,
  cor_agua: reading.cor_agua !== undefined ? Number(reading.cor_agua) : undefined,
});

export const getReadings = async (
  params: GetReadingsParams,
  accessToken?: string,
): Promise<GetReadingsResponse> => {
  try {
    const { data } = await api.get<GetReadingsResponse>(
      `/v1/tanques/${toApiId(params.tanque_id)}/leituras`,
      {
        params: {
          per_page: params.per_page || 50,
          page: params.page || 1,
        },
        headers: getAuthHeaders(accessToken),
      },
    );

    return {
      ...data,
      leituras: data.leituras.map(normalizeReading),
    };
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar leituras do servidor");
  }
};

export const getAllReadingsByTank = async (
  tankId: string,
  accessToken?: string,
): Promise<ReadingFromAPI[]> => {
  const allReadings: ReadingFromAPI[] = [];
  let totalPages = 1;

  const firstPageData = await getReadings(
    { tanque_id: tankId, per_page: 50, page: 1 },
    accessToken,
  );

  allReadings.push(...firstPageData.leituras);
  totalPages = firstPageData.total_paginas;

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
};
