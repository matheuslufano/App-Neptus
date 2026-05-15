export interface Permission {
  id: string; // The permission string itself implies ID, but in the array it's just a string.
  // Actually, the example shows "permissoes": ["tanque_listar", ...]
}

export interface ApiProfile {
  id: string;
  nome: string;
  permissoes: string[];
  usuarios: number;
  criado_em: string;
  atualizado_em: string;
}

export interface ProfilesListResponse {
  itens_por_pagina: number;
  pagina_atual: number;
  perfis: ApiProfile[];
  total: number;
  total_paginas: number;
}

export interface CreateProfileRequest {
  nome: string;
  permissoes: string[];
}

export interface UpdateProfileRequest {
  nome?: string;
  permissoes?: string[];
}
