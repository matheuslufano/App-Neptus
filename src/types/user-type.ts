import { Property } from "./property-type";

export type User = {
  created_at: string;
  email: string;
  id: string;
  is_active: boolean;
  is_admin: boolean;
  nome: string;
  perfil_id: string;
  propridedade: Property[];
  total_propriedades: number;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  mensagem: string;
  refresh_token: string;
  usuario: UserSession;
};

export type UserSession = {
  id: string;
  nome: string;
  email: string;
  is_admin: boolean;
  perfil: string;
  permissoes: string[];
};

export type PropertyUser = Pick<User, "id" | "nome" | "email">;
