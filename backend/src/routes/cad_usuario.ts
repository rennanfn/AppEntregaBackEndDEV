import { Router } from "express";
import Cad_Usuario_Controller from "../controller/Cad_Usuario_Controller";

export const cadUsuarioRoutes = Router();

cadUsuarioRoutes.post("/", Cad_Usuario_Controller.insert);
cadUsuarioRoutes.get("/", Cad_Usuario_Controller.show);
cadUsuarioRoutes.delete("/:id", Cad_Usuario_Controller.delete);
cadUsuarioRoutes.put("/", Cad_Usuario_Controller.update);
