import api from "@/lib/axios";
import {
  ApiUser,
  ApiUserDetail,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
} from "@/types/user-api-type";
import { toApiId } from "@/utils/api-util";
import { formatAndThrowError } from "@/utils/error-util";

const normalizeUser = (user: ApiUser): ApiUser => ({
  ...user,
  id: String(user.id),
  perfil_id: String(user.perfil_id),
});

const normalizeUserDetail = (user: ApiUserDetail): ApiUserDetail => ({
  ...normalizeUser(user),
  propriedades: user.propriedades.map((property) => ({
    ...property,
    propriedade_id: String(property.propriedade_id),
  })),
});

export const getUsers = async (
  page: number = 1,
  itemsPerPage: number = 10,
): Promise<UsersListResponse> => {
  try {
    const { data } = await api.get<UsersListResponse>("/v1/super/usuarios", {
      params: {
        page,
        per_page: itemsPerPage,
      },
    });

    return {
      ...data,
      usuarios: data.usuarios.map(normalizeUser),
    };
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar usuarios");
  }
};

export const getUserById = async (id: string): Promise<ApiUserDetail> => {
  try {
    const { data } = await api.get<ApiUserDetail>(`/v1/super/usuarios/${id}`);
    return normalizeUserDetail(data);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar usuario");
  }
};

export const createUser = async (
  userData: CreateUserRequest,
): Promise<ApiUser> => {
  try {
    const { data } = await api.post<ApiUser>("/v1/super/usuarios", {
      ...userData,
      perfil_id: toApiId(userData.perfil_id),
    });

    return normalizeUser(data);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao criar usuario");
  }
};

export const updateUser = async (
  id: string,
  userData: UpdateUserRequest,
): Promise<ApiUser> => {
  try {
    const { data } = await api.put<ApiUser>(`/v1/super/usuarios/${id}`, {
      ...userData,
      perfil_id: toApiId(userData.perfil_id),
    });

    return normalizeUser(data);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao atualizar usuario");
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await api.patch(`/v1/super/usuarios/${id}`, undefined, {
      params: {
        status_val: false,
      },
    });
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao desativar usuario");
  }
};
