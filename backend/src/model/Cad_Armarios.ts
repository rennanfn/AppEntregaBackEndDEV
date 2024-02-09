import { z } from "zod";

export const campoObrigatorio = "obrigatório";

export const armariosSchema = z.object({
  id: z.string({ required_error: campoObrigatorio }).optional(), //mesmo sendo obrigatório, o campo id é optional pois não recebe nada do body, sendo gerado automaticamente pelo back
  numero: z.number({ required_error: campoObrigatorio }),
  situacao: z
    .string({ required_error: campoObrigatorio })
    .min(1, { message: "A situação não pode ser nula" })
    .max(20, { message: "A situação deve ter no máximo 20 caracteres" }),
  genero: z
    .string({ required_error: campoObrigatorio })
    .refine((value) => value === "Masculino" || value === "Feminino", {
      message: "O genero deve ser Masculino ou Feminino",
    }),
  id_local: z.string({ required_error: campoObrigatorio }),
});

export type iArmariosZod = z.infer<typeof armariosSchema>;

export interface iArmarios {
  id?: string | undefined;
  numero: number;
  situacao: string;
  genero: string;
  id_local: string;
}
