// Tipos para a resposta da API de propriedades

export interface ApiProperty {
  id: string;
  nome: string;
  proprietario_id: string;
  proprietario_nome: string;
  total_usuarios: number;
  criado_em: string;
  atualizado_em: string;
}

export interface ApiPropertyUser {
  id: string;
  nome: string;
  email: string;
  e_admin: boolean;
  esta_ativo: boolean;
  perfil_id: string;
  perfil_nome: string;
  total_propriedades: number;
  criado_em: string;
  atualizado_em: string;
}

export interface ApiPropertyDetail extends ApiProperty {
  usuarios: ApiPropertyUser[];
}

export interface PropertiesListResponse {
  itens_por_pagina: number;
  pagina_atual: number;
  total: number;
  total_paginas: number;
  propriedades: ApiProperty[];
}

export interface CreatePropertyRequest {
  nome: string;
  proprietario_id: string;
}

export interface UpdatePropertyRequest {
  nome: string;
  proprietario_id: string;
}

export interface AddUserToPropertyRequest {
  propriedade_id: string;
  usuario_id: string;
}

export interface RemoveUserFromPropertyRequest {
  propriedade_id: string;
  usuario_id: string;
}
