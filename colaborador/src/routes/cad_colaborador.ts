/* eslint-disable camelcase */
import { Router } from 'express';
import Cad_Colaborador_Controller from '../controller/Cad_Colaborador_Controller';

const cadColaboradorRoutes = Router();

cadColaboradorRoutes.get('/', Cad_Colaborador_Controller.showColaborador);
// cadColaboradorRoutes.get('/:matricula', Cad_Colaborador_Controller.buscarToken);

export default cadColaboradorRoutes;
