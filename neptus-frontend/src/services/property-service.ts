import api from "@/lib/axios";
import {
  AddUserToPropertyRequest,
  ApiProperty,
  ApiPropertyDetail,
  ApiPropertyUser,
  CreatePropertyRequest,
  PropertiesListResponse,
  RemoveUserFromPropertyRequest,
  UpdatePropertyRequest,
} from "@/types/property-api-type";
import { toApiId, toOptionalApiId } from "@/utils/api-util";
import { formatAndThrowError } from "@/utils/error-util";

const normalizePropertyUser = (user: ApiPropertyUser): ApiPropertyUser => ({
  ...user,
  id: String(user.id),
  perfil_id: String(user.perfil_id),
});

const normalizeProperty = (property: ApiProperty): ApiProperty => ({
  ...property,
  id: String(property.id),
  proprietario_id:
    property.proprietario_id !== undefined && property.proprietario_id !== null
      ? String(property.proprietario_id)
      : "",
});

const normalizePropertyDetail = (
  property: ApiPropertyDetail,
): ApiPropertyDetail => ({
  ...normalizeProperty(property),
  usuarios: property.usuarios.map(normalizePropertyUser),
});

export const getProperties = async (
  page: number = 1,
  itemsPerPage: number = 10,
): Promise<PropertiesListResponse> => {
  try {
    const { data } = await api.get<PropertiesListResponse>(
      "/v1/super/propriedades",
      {
        params: {
          page,
          per_page: itemsPerPage,
        },
      },
    );

    return {
      ...data,
      propriedades: data.propriedades.map(normalizeProperty),
    };
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar propriedades");
  }
};

export const getPropertyById = async (
  id: string,
): Promise<ApiPropertyDetail> => {
  try {
    const { data } = await api.get<ApiPropertyDetail>(
      `/v1/super/propriedades/${id}`,
    );
    return normalizePropertyDetail(data);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao buscar propriedade");
  }
};

export const createProperty = async (
  propertyData: CreatePropertyRequest,
): Promise<ApiProperty> => {
  try {
    const { data } = await api.post<ApiProperty>("/v1/super/propriedades", {
      ...propertyData,
      proprietario_id: toOptionalApiId(propertyData.proprietario_id),
    });

    return normalizeProperty(data);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao criar propriedade");
  }
};

export const updateProperty = async (
  id: string,
  propertyData: UpdatePropertyRequest,
): Promise<ApiProperty> => {
  try {
    const { data } = await api.put<ApiProperty>(
      `/v1/super/propriedades/${id}`,
      {
        ...propertyData,
        proprietario_id: toOptionalApiId(propertyData.proprietario_id),
      },
    );

    return normalizeProperty(data);
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao atualizar propriedade");
  }
};

export const deleteProperty = async (_id: string): Promise<void> => {
  throw new Error("A API de homologacao nao disponibiliza exclusao de propriedade");
};

export const addUserToProperty = async (
  request: AddUserToPropertyRequest,
): Promise<void> => {
  try {
    await api.post("/v1/super/propriedades/usuarios/adicionar", undefined, {
      params: {
        propriedade_id: toApiId(request.propriedade_id),
        usuario_id: toApiId(request.usuario_id),
      },
    });
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao adicionar usuario a propriedade");
  }
};

export const removeUserFromProperty = async (
  request: RemoveUserFromPropertyRequest,
): Promise<void> => {
  try {
    await api.delete(
      `/v1/super/propriedades/${toApiId(
        request.propriedade_id,
      )}/usuarios/${toApiId(request.usuario_id)}`,
    );
  } catch (error) {
    throw formatAndThrowError(error, "Erro ao remover usuario da propriedade");
  }
};
