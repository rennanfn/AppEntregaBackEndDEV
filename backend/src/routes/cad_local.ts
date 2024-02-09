import { Router } from "express";
import Cad_Local_Controller from "../controller/Cad_Local_Controller";

export const cadLocalRoutes = Router();

cadLocalRoutes.post("/", Cad_Local_Controller.insert);
cadLocalRoutes.put("/", Cad_Local_Controller.update);
cadLocalRoutes.get("/", Cad_Local_Controller.show);
cadLocalRoutes.patch("/:id", Cad_Local_Controller.ativaDesativa);
