import api from "@/lib/axios";
import { toApiId } from "@/utils/api-util";
import { formatAndThrowError } from "@/utils/error-util";

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

export interface CreateTankRequest {
  nome: string;
  id_propriedade: string;
  id_usuario: string;
  area_tanque: number;
  tipo_peixe: string;
  peso_peixe: number;
  qtd_peixe: number;
  ativo?: boolean;
}

export interface UpdateTankRequest {
  nome?: string;
  area_tanque?: number;
  tipo_peixe?: string;
  peso_peixe?: number;
  qtd_peixe?: number;
  ativo?: boolean;
}

const getAuthHeaders = (accessToken?: string) =>
  accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : undefined;

const normalizeTank = (tank: TankFromAPI): TankFromAPI => ({
  ...tank,
  id: String(tank.id),
  id_usuario: String(tank.id_usuario),
  id_propriedade: String(tank.id_propriedade),
  area_tanque: Number(tank.area_tanque),
  peso_peixe: Number(tank.peso_peixe ?? 0),
  qtd_peixe: Number(tank.qtd_peixe ?? 0),
});

export const getTanks = async (
  params: GetTanksParams,
  accessToken?: string,
): Promise<GetTanksResponse> => {
  try {
    const { data } = await api.get<GetTanksResponse>("/v1/super/tanques", {
      params: {
        id_propriedade: toApiId(params.id_propriedade),
        per_page: params.per_page || 50,
        page: params.page || 1,
      },
      headers: getAuthHeaders(accessToken),
    });

    return {
      ...data,
      tanques: data.tanques.map(normalizeTank),
    };
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar tanques do servidor");
  }
};

export const createTank = async (
  tankData: CreateTankRequest,
  accessToken?: string,
): Promise<TankFromAPI> => {
  try {
    const { data } = await api.post<TankFromAPI>(
      "/v1/super/tanques",
      {
        ...tankData,
        id_propriedade: toApiId(tankData.id_propriedade),
        id_usuario: toApiId(tankData.id_usuario),
        area_tanque: tankData.area_tanque,
        peso_peixe: tankData.peso_peixe,
        qtd_peixe: tankData.qtd_peixe,
        ativo: tankData.ativo ?? true,
      },
      {
        headers: getAuthHeaders(accessToken),
      },
    );

    return normalizeTank(data);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao criar tanque");
  }
};

export const updateTank = async (
  id: string,
  tankData: UpdateTankRequest,
  accessToken?: string,
): Promise<TankFromAPI> => {
  try {
    const { data } = await api.put<TankFromAPI>(
      `/v1/super/tanques/${toApiId(id)}`,
      tankData,
      {
        headers: getAuthHeaders(accessToken),
      },
    );

    return normalizeTank(data);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao atualizar tanque");
  }
};

export const deactivateTank = async (
  id: string,
  accessToken?: string,
): Promise<TankFromAPI> => {
  return updateTank(id, { ativo: false }, accessToken);
};

export const getAllTanks = async (
  propertyId: string,
  accessToken?: string,
): Promise<TankFromAPI[]> => {
  const allTanks: TankFromAPI[] = [];
  let totalPages = 1;

  const firstPageData = await getTanks(
    { id_propriedade: propertyId, per_page: 50, page: 1 },
    accessToken,
  );

  allTanks.push(...firstPageData.tanques);
  totalPages = firstPageData.total_paginas;

  if (totalPages > 1) {
    const promises = [];
    for (let page = 2; page <= totalPages; page++) {
      promises.push(
        getTanks({ id_propriedade: propertyId, per_page: 50, page }, accessToken),
      );
    }

    const results = await Promise.all(promises);
    results.forEach((result) => allTanks.push(...result.tanques));
  }

  return allTanks;
};
