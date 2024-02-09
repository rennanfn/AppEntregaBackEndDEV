import { Router } from "express";
import { LoginController } from "../controller/Cad_Login_Controller";

export const loginRoutes = Router();

loginRoutes.post("/", LoginController.autenticar);
loginRoutes.get("/refreshToken", LoginController.refreshToken);
