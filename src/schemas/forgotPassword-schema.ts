import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().nonempty("Email é obrigatório").email("Email inválido"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
