import { Router } from "express";
import Cad_Armario_Controller from "../controller/Cad_Armario_Controller";

export const cadArmarioRoutes = Router();

cadArmarioRoutes.post("/", Cad_Armario_Controller.insert);
cadArmarioRoutes.get("/", Cad_Armario_Controller.show);
//cadArmarioRoutes.get("/:id", validaToken, Cad_Armario_Controller.find);
cadArmarioRoutes.put("/", Cad_Armario_Controller.update);
cadArmarioRoutes.delete("/:id", Cad_Armario_Controller.delete);
