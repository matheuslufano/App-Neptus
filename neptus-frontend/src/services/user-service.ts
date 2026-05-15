import { AxiosError } from "axios";

import api from "@/lib/axios";
import {
  ApiUser,
  ApiUserDetail,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
} from "@/types/user-api-type";
import { formatAndThrowError } from "@/utils/error-util";

export const getUsers = async (
  page: number = 1,
  itemsPerPage: number = 10
): Promise<UsersListResponse> => {
  try {
    const { data } = await api.get<UsersListResponse>("/v1/super/usuarios", {
      params: {
        pagina_atual: page,
        itens_por_pagina: itemsPerPage,
      },
    });
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar usuários");
  }
};

export const getUserById = async (id: string): Promise<ApiUserDetail> => {
  try {
    const { data } = await api.get<ApiUserDetail>(`/v1/super/usuarios/${id}`);
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar usuário");
  }
};

export const createUser = async (
  userData: CreateUserRequest
): Promise<ApiUser> => {
  try {
    const { data } = await api.post<ApiUser>("/v1/super/usuarios", userData);
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao criar usuário");
  }
};

export const updateUser = async (
  id: string,
  userData: UpdateUserRequest
): Promise<ApiUser> => {
  try {
    const { data } = await api.put<ApiUser>(
      `/v1/super/usuarios/${id}`,
      userData
    );
    return data;
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao atualizar usuário");
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    // Usa PATCH para desativar o usuário ao invés de DELETE
    await api.patch(`/v1/super/usuarios/${id}`, {
      status: false,
    });
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao desativar usuário");
  }
};
