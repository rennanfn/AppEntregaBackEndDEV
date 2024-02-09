import { z } from "zod";
import { campoObrigatorio } from "./Cad_Armarios";

export const distribuicaoSchema = z.object({
  id: z.string({ required_error: campoObrigatorio }).optional(), //mesmo sendo obrigatório, o campo id é optional pois não recebe nada do body, sendo gerado automaticamente pelo back
  matricula: z.number({ required_error: campoObrigatorio }),
  nome: z
    .string({ required_error: campoObrigatorio })
    .min(1, { message: "O nome não pode ser nulo" })
    .max(100, { message: "O nome deve ter no máximo 100 caracteres" }),
  status: z
    .string({ required_error: campoObrigatorio })
    .min(1, { message: "O status não pode ser nulo" })
    .max(15, { message: "O status deve ter no máximo 15 caracteres" }),
  armario: z.number({ required_error: campoObrigatorio }),
  id_local: z.string({ required_error: campoObrigatorio }).optional(),
  genero: z
    .string({ required_error: campoObrigatorio })
    .refine((value) => value === "Masculino" || value === "Feminino", {
      message: "O genero deve ser Masculino ou Feminino",
    }),
  id_armario: z.string({ required_error: campoObrigatorio }),
  confirmacao: z
    .string({ required_error: campoObrigatorio })
    .refine((value) => value === "SIM" || value === "NÃO", {
      message: "A confirmação deve ser SIM ou NÃO",
    }),
  data_retirada: z.string().optional(),
  data_devolucao: z.string().optional(),
});

export type iDistribuicaoZod = z.infer<typeof distribuicaoSchema>;

export interface iDistribuicao {
  id?: string | undefined;
  matricula: number;
  nome: string;
  status: string;
  armario: number;
  id_local?: string | undefined;
  genero: string;
  id_armario: string;
  confirmacao: string;
  data_retirada?: Date | string;
  data_devolucao?: Date | string;
}

export interface CadDistribuicaoOut extends iDistribuicao {
  ID_ARMARIO: string;
  data_retirada: string;
  data_devolucao: string;
}

export interface CadColaboradorOut {
  matricula: number;
  nome_funcio: string;
  desc_situacao: string;
}
