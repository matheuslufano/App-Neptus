import { z } from "zod";

export const createPropertySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  proprietario_id: z.string().min(1, "Proprietário é obrigatório"),
});

export const updatePropertySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  proprietario_id: z.string().min(1, "Proprietário é obrigatório"),
});

export type CreatePropertySchema = z.infer<typeof createPropertySchema>;
export type UpdatePropertySchema = z.infer<typeof updatePropertySchema>;

