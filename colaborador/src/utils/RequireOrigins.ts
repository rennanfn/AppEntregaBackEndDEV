/* eslint-disable prettier/prettier */
import { NextFunction, Request, Response } from 'express';
import { consoleLog, pVerbose } from './consoleLog';

export function requireOrigin(
  req: Request,
  resp: Response,
  next: NextFunction,
) {
  const origin = req.headers.origin ?? '';
  const ipAddress = req.clientIpInfo?.ip;
  // URLS liberadas para acessarem a api, devem ser separadas por ;
  const origensPermitidas = process.env.CORS_URL_PERMITIDAS_ENTREGA || '';
  const allow = origensPermitidas
    .split(';')
    .some(origem => origem === req.headers.origin);
  if (!allow) {
    consoleLog(
      `Tentativa de acesso barrada no CORS - url: ${req.url} - origin: ${origin} - ip: ${ipAddress}`,
      pVerbose.erro,
    );
    return resp.status(400).json({ message: 'Not allowed by CORS' });
  }
  next();
}
