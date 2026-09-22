import { z } from "zod";

export const createUserSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z
    .string()
    .email("Email inválido")
    .refine(
      (email) => !email.toLowerCase().endsWith(".local"),
      "Use um e-mail com domínio válido; endereços terminados em .local não são aceitos.",
    ),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  perfil_id: z.string().min(1, "Perfil é obrigatório"),
});

export const updateUserSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z
    .string()
    .email("Email inválido")
    .refine(
      (email) => !email.toLowerCase().endsWith(".local"),
      "Use um e-mail com domínio válido; endereços terminados em .local não são aceitos.",
    ),
  perfil_id: z.string().min(1, "Perfil é obrigatório"),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
