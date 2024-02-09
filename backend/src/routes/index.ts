import { cadDistribuicaoRoutes } from "./cad_distribuicao";
import { Router } from "express";
import { cadArmarioRoutes } from "./cad_armario";
import { cadUsuarioRoutes } from "./cad_usuario";
import { cadColaboradorRoutes } from "./cad_colaborador";
import { loginRoutes } from "./login";
import { cadArmarioLivresRoutes } from "./cad_armario_livre";
import { validaToken } from "../utils/token";
import { HoneyPot } from "../utils/HoneyPot";
import { cadLocalRoutes } from "./cad_local";

export const routes = Router();

routes.use("/cadUsuario", validaToken, cadUsuarioRoutes);
routes.use("/cadArmario", validaToken, cadArmarioRoutes);
routes.use("/cadArmarioLivre", validaToken, cadArmarioLivresRoutes);
routes.use("/cadDistribuicao", validaToken, cadDistribuicaoRoutes);
routes.use("/cadColaborador", validaToken, cadColaboradorRoutes);
routes.use("/cadLocal", validaToken, cadLocalRoutes);
routes.use("/login", loginRoutes);

routes.all("/*", HoneyPot.reqGet);
