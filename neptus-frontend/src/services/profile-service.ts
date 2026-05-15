import { AxiosError } from "axios";

import api from "@/lib/axios";
import {
  ApiProfile,
  CreateProfileRequest,
  ProfilesListResponse,
  UpdateProfileRequest,
} from "@/types/profile-api-type";
import { formatAndThrowError } from "@/utils/error-util";

export const getProfiles = async (
  page: number = 1,
  itemsPerPage: number = 10
): Promise<ProfilesListResponse> => {
  try {
    const { data } = await api.get<ProfilesListResponse>("/v1/super/perfis", {
      params: {
        pagina_atual: page,
        itens_por_pagina: itemsPerPage,
      },
    });
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar perfis");
  }
};

export const getProfileById = async (id: string): Promise<ApiProfile> => {
  try {
    const { data } = await api.get<ApiProfile>(`/v1/super/perfis/${id}`);
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar perfil");
  }
};

export const createProfile = async (
  profileData: CreateProfileRequest
): Promise<ApiProfile> => {
  try {
    const { data } = await api.post<ApiProfile>(
      "/v1/super/perfis",
      profileData
    );
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao criar perfil");
  }
};

export const updateProfile = async (
  id: string,
  profileData: UpdateProfileRequest
): Promise<ApiProfile> => {
  try {
    // Assuming PUT based on standard REST, but checking prompt...
    // Prompt only specified POST for creation/sending.
    // Usually updates are PUT or PATCH. I will use PUT as it's common for full updates (permissions list usually replaces old list).
    const { data } = await api.put<ApiProfile>(
      `/v1/super/perfis/${id}`,
      profileData
    );
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao atualizar perfil");
  }
};

export const deleteProfile = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/super/perfis/${id}`);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao excluir perfil");
  }
};
