import { Router } from "express";
import Cad_Distribuicao_Controller from "../controller/Cad_Distribuicao_Controller";

export const cadColaboradorRoutes = Router();

// cadColaboradorRoutes.get(
//   "/:matricula",
//   Cad_Distribuicao_Controller.findColaborador
// );
cadColaboradorRoutes.get("/", Cad_Distribuicao_Controller.showColaborador);
