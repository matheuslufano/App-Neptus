import { z } from "zod";

export const addTankSchema = z.object({
  name: z.string().nonempty("Nome do tanque é obrigatório"),
  type: z
    .string({ required_error: "Selecione um tipo de tanque" })
    .min(1, "Tipo de tanque é obrigatório"),
  fish: z
    .string({ required_error: "Selecione a espécie do peixe" })
    .min(1, "Espécies do peixe é obrigatório"),
  fishCount: z.coerce
    .number({ required_error: "Quantidade de peixes é obrigatória" })
    .int("Quantidade deve ser um número inteiro")
    .min(1, "Quantidade deve ser maior que 0"),
  averageWeight: z.coerce
    .number({ required_error: "Peso médio é obrigatório" })
    .min(0.1, "Peso médio deve ser maior que 0"),
  tankArea: z.coerce
    .number({ required_error: "Área do tanque é obrigatória" })
    .min(0.1, "Área deve ser maior que 0"),
});

export type AddTankSchema = z.infer<typeof addTankSchema>;
