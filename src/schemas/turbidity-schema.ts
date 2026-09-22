import { z } from "zod";

export const turbidityFormSchema = z.object({
  tanque: z
    .string({ required_error: "Selecione um tanque" })
    .min(1, "Tanque é obrigatório"),
  cor_agua: z.coerce.number().min(0, "Selecione uma cor da água"),
  oxigenio: z.coerce
    .number()
    .min(0, "Oxigênio deve ser maior ou igual a 0")
    .optional(),
  temperatura: z.coerce
    .number()
    .min(0, "Temperatura deve ser maior ou igual a 0")
    .optional(),
  ph: z.coerce.number().min(0, "pH deve ser maior ou igual a 0").optional(),
  amonia: z.coerce
    .number()
    .min(0, "Amônia deve ser maior ou igual a 0")
    .optional(),
});

export type TurbidityFormSchema = z.infer<typeof turbidityFormSchema>;
