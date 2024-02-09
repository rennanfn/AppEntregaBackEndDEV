import { Router } from "express";
import Cad_Distribuicao_Controller from "../controller/Cad_Distribuicao_Controller";

export const cadDistribuicaoRoutes = Router();

cadDistribuicaoRoutes.post("/", Cad_Distribuicao_Controller.insert);
cadDistribuicaoRoutes.get("/", Cad_Distribuicao_Controller.show);
//cadDistribuicaoRoutes.get("/:id", Cad_Distribuicao_Controller.find);
cadDistribuicaoRoutes.put("/", Cad_Distribuicao_Controller.update);
cadDistribuicaoRoutes.put("/devolucao", Cad_Distribuicao_Controller.devolucao);
cadDistribuicaoRoutes.delete(
  "/:id/:id_armario",

  Cad_Distribuicao_Controller.delete
);
