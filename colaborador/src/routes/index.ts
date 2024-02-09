/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
import { Router } from 'express';
import { HoneyPot } from '../utils/HoneyPot';

const routes = Router();

// *********************************************************
// * Qualquer outra tentativa de acesso vai cair no HoneyPot
// * Sempre deixar o honeyPot como últoma rota.
// *********************************************************
routes.all('/*', HoneyPot.reqGet);

export default routes;
