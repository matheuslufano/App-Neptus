import { AxiosError } from "axios";

import api from "@/lib/axios";
import { formatAndThrowError } from "@/utils/error-util";

// Tipos da API
export interface TankFromAPI {
  id: string;
  id_usuario: string;
  id_propriedade: string;
  nome: string;
  area_tanque: number;
  tipo_peixe: string;
  peso_peixe: number;
  qtd_peixe: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface GetTanksResponse {
  total: number;
  pagina_atual: number;
  itens_por_pagina: number;
  total_paginas: number;
  tanques: TankFromAPI[];
}

export interface GetTanksParams {
  id_propriedade: string;
  per_page?: number;
  page?: number;
}

/**
 * Busca tanques do servidor com paginação
 */
export const getTanks = async (
  params: GetTanksParams,
  accessToken: string,
): Promise<GetTanksResponse> => {
  try {
    const { data } = await api.get<GetTanksResponse>(
      `/v1/super/tanques/${params.id_propriedade}`,
      {
        params: {
          per_page: params.per_page || 50,
          page: params.page || 1,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return data;
  } catch (error) {
    console.error("Erro ao buscar tanques:", error as AxiosError);
    throw formatAndThrowError(error, "Erro ao buscar tanques do servidor");
  }
};

/**
 * Busca TODOS os tanques de uma propriedade (lida com paginação automaticamente)
 */
export const getAllTanks = async (
  propertyId: string,
  accessToken: string,
): Promise<TankFromAPI[]> => {
  const allTanks: TankFromAPI[] = [];
  let totalPages = 1;

  try {
    // Busca primeira página para saber quantas páginas existem
    const firstPageData = await getTanks(
      { id_propriedade: propertyId, per_page: 50, page: 1 },
      accessToken,
    );

    allTanks.push(...firstPageData.tanques);
    totalPages = firstPageData.total_paginas;

    // Se houver mais páginas, busca todas
    if (totalPages > 1) {
      const promises = [];
      for (let page = 2; page <= totalPages; page++) {
        promises.push(
          getTanks(
            { id_propriedade: propertyId, per_page: 50, page },
            accessToken,
          ),
        );
      }

      const results = await Promise.all(promises);
      results.forEach((result) => allTanks.push(...result.tanques));
    }

    return allTanks;
  } catch (error) {
    console.error("Erro ao buscar todos os tanques:", error);
    throw error;
  }
};
