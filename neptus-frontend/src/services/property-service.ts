import { AxiosError } from "axios";

import api from "@/lib/axios";
import {
  AddUserToPropertyRequest,
  ApiProperty,
  ApiPropertyDetail,
  CreatePropertyRequest,
  PropertiesListResponse,
  RemoveUserFromPropertyRequest,
  UpdatePropertyRequest,
} from "@/types/property-api-type";
import { formatAndThrowError } from "@/utils/error-util";

export const getProperties = async (
  page: number = 1,
  itemsPerPage: number = 10
): Promise<PropertiesListResponse> => {
  try {
    const { data } = await api.get<PropertiesListResponse>(
      "/v1/super/propriedades",
      {
        params: {
          pagina_atual: page,
          itens_por_pagina: itemsPerPage,
        },
      }
    );
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar propriedades");
  }
};

export const getPropertyById = async (
  id: string
): Promise<ApiPropertyDetail> => {
  try {
    const { data } = await api.get<ApiPropertyDetail>(
      `/v1/super/propriedades/${id}`
    );
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar propriedade");
  }
};

export const createProperty = async (
  propertyData: CreatePropertyRequest
): Promise<ApiProperty> => {
  try {
    const { data } = await api.post<ApiProperty>(
      "/v1/super/propriedades",
      propertyData
    );
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao criar propriedade");
  }
};

export const updateProperty = async (
  id: string,
  propertyData: UpdatePropertyRequest
): Promise<ApiProperty> => {
  try {
    const { data } = await api.put<ApiProperty>(
      `/v1/super/propriedades/${id}`,
      propertyData
    );
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao atualizar propriedade");
  }
};

export const deleteProperty = async (id: string): Promise<void> => {
  try {
    // Usa PATCH para desativar a propriedade ao invés de DELETE
    await api.patch(`/v1/super/propriedades/${id}`, {
      status: false,
    });
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao desativar propriedade");
  }
};

export const addUserToProperty = async (
  request: AddUserToPropertyRequest
): Promise<void> => {
  try {
    await api.post("/v1/super/propriedades/usuarios/adicionar", request);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao adicionar usuário à propriedade");
  }
};

export const removeUserFromProperty = async (
  request: RemoveUserFromPropertyRequest
): Promise<void> => {
  try {
    await api.post("/v1/super/propriedades/usuarios/remover", request);
  } catch (error) {
    throw formatAndThrowError(
      error,
      "Erro ao remover usuário da propriedade"
    );
  }
};
