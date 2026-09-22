import { z } from "zod";

export const accountConfigSchema = z.object({
  propertyName: z.string().optional(),
  email: z.string().nonempty("Email é obrigatório").email("Email inválido"),
});

export type AccountConfigSchema = z.infer<typeof accountConfigSchema>;
