import { optional, z } from "zod";
import { campoObrigatorio } from "./Cad_Armarios";

export interface iLocal {
  id?: string;
  local: string;
  status?: number;
}

export const localSchema = z.object({
  id: z.string({ required_error: campoObrigatorio }).optional(), //mesmo sendo obrigatório, o campo id é optional pois não recebe nada do body, sendo gerado automaticamente pelo back
  local: z.string({ required_error: campoObrigatorio }),
  status: z.number().refine((value) => value === 0 || value === 1, {
    message: 'Campo status: Caracter inválido. O valor deve ser 0 ou 1',
  }).optional(),
});

export type iUsuarioZod = z.infer<typeof localSchema>;
