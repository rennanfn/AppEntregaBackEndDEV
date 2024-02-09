import { z } from "zod";
import { campoObrigatorio } from "./Cad_Armarios";

export interface iUsuario {
  id?: string | undefined;
  login: string;
  senha?: string | undefined;
  id_local: string[];
}

export const usuarioSchema = z.object({
  id: z.string({ required_error: campoObrigatorio }).optional(), //mesmo sendo obrigatório, o campo id é optional pois não recebe nada do body, sendo gerado automaticamente pelo back
  login: z.string({ required_error: campoObrigatorio }),
  senha: z.string({ required_error: campoObrigatorio }).optional(),
  id_local: z.array(z.string()),
});

export type iUsuarioZod = z.infer<typeof usuarioSchema>;


