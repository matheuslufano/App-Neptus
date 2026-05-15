import { User } from "./user-type";

export type Property = {
  created_at: string;
  id: string;
  nome: string;
  proprietario_id: string;
  proprietario_nome: string;
  total_usuarios: number;
  updated_at: string;
  usuarios: User[];
};
