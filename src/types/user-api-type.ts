// Tipos para a resposta da API de usuários

export interface ApiUser {
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

export interface ApiUserProperty {
  propriedade_id: string;
  nome: string;
}

export interface ApiUserDetail extends ApiUser {
  propriedades: ApiUserProperty[];
}

export interface UsersListResponse {
  itens_por_pagina: number;
  pagina_atual: number;
  total: number;
  total_paginas: number;
  usuarios: ApiUser[];
}

export interface CreateUserRequest {
  nome: string;
  email: string;
  senha: string;
  perfil_id: string;
}

export interface UpdateUserRequest {
  nome: string;
  email: string;
  perfil_id: string;
}
