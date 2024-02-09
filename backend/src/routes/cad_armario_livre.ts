import { Router } from "express";
import Cad_Armario_Controller from "../controller/Cad_Armario_Controller";

export const cadArmarioLivresRoutes = Router();

cadArmarioLivresRoutes.get("/", Cad_Armario_Controller.showLivre);
