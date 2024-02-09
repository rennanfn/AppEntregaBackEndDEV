/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
import * as CryptoJS from 'crypto-js';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Token, TokenColaborador } from '../Interfaces';
import { consoleLog, pVerbose } from './consoleLog';
import { NextFunction, Request, Response } from 'express';
import retornoPadrao from './retornoPadrao';
import { MySqlConnection } from '../modelDB/MySqlConnection';
import { ErroGeneral } from '../model/ErroGeneral';


function encryptToken(obj: string): string {
  consoleLog(`Criptografando payload token`, pVerbose.aviso);
  const payload_key =
    typeof process.env.PAYLOAD_KEY !== 'undefined'
      ? process.env.PAYLOAD_KEY
      : '';

  if (payload_key === '') return '';
  const key = CryptoJS.enc.Utf8.parse(payload_key);
  const iv = CryptoJS.enc.Utf8.parse(payload_key);

  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(obj.toString()),
    key,
    {
      keySize: 128 / 8,
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  consoleLog(`Payload criptogrado com sucesso!`, pVerbose.aviso);
  return encrypted.toString();
}

function gerarTokenColaborador(obj: TokenColaborador): string {
  const secretKey =
    typeof process.env.QRCODE_SECRET !== 'undefined'
      ? process.env.QRCODE_SECRET
      : '';

  if (secretKey === '') return '';

  const corpoToken = JSON.stringify(obj);
  const newPayload = encryptToken(corpoToken);

  if (newPayload === '') return '';

  const tokenEncrypto = {
    tokenEnc: newPayload,
    sub: obj.matricula,
    seq: obj.sequencial
  };

  const token = jwt.sign(tokenEncrypto, secretKey);

  return token;
}

function decryptToken(encrypted: string): string {
  consoleLog(`Descriptografando payload token`, pVerbose.aviso);
  const payload_key =
    typeof process.env.PAYLOAD_KEY !== 'undefined'
      ? process.env.PAYLOAD_KEY
      : '';

  if (payload_key === '') return '';

  const key = CryptoJS.enc.Utf8.parse(payload_key);
  const iv = CryptoJS.enc.Utf8.parse(payload_key);

  const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key, {
    keySize: 128 / 8,
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  consoleLog(`Payload descriptogrfado com sucesso!`, pVerbose.aviso);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function isRefreshable(expiredAt: string): boolean {
  // Pega a diferença entre a hora atual e a hora que o token expirou,
  // divide por 60000 para transformar milisegundos em minuto.
  const timeDiff = Math.abs(+new Date() - +new Date(expiredAt)) / 60000;
  // Se o token expirou a menos de 10 minutos então pode ser atualizado.
  if (Math.trunc(timeDiff) <= 10) {
    return true;
  }
  return false;
}

function validLifeTimeToken(iat: number, exp: number): boolean {
  const tokenExpireTime = process.env.TOKEN_EXPIRES_IN_MINUTE ?? '60';
  const tokenExpireInMs = Number(tokenExpireTime) * 60000;

  const timeDiff = Math.abs(+new Date(exp) - +new Date(iat)) * 1000;
  if (Math.trunc(timeDiff) <= tokenExpireInMs) return true;
  return false;
}

export const validaToken = async (
  req: Request,
  resp: Response,
  next: NextFunction,
) => {
  const url = req.url ?? '';

  consoleLog('Validando Token', pVerbose.aviso);
  const token = req.headers.authorization;
  if (typeof token === 'undefined') {
    consoleLog(`Request sem token`, pVerbose.erro);
    return resp
      .status(403)
      .json(
        retornoPadrao(1, 'Sessão expirada. Realize a autenticação novamente.'),
      );
  }
  try {
    const secretKey =
      typeof process.env.TOKEN_SECRET_ENTREGA !== 'undefined'
        ? process.env.TOKEN_SECRET_ENTREGA
        : '';

    const payloadTokenEnc = jwt.verify(token, secretKey) as jwt.JwtPayload;

    const { iat, exp } = payloadTokenEnc;
    if (
      typeof iat === 'undefined' ||
      typeof exp === 'undefined' ||
      iat === null ||
      exp === null ||
      !validLifeTimeToken(iat, exp)
    ) {
      consoleLog(`Claims inválidas`, pVerbose.erro);
      return resp
        .status(403)
        .json(
          retornoPadrao(
            1,
            'Sessão expirada. Realize a autenticação novamente.',
          ),
        );
    }
    const decoded = decryptToken(payloadTokenEnc.tokenEnc);
    if (decoded === '') {
      consoleLog(`Não foi possível descriptografar o token`, pVerbose.erro);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`),
        );
    }
    const tokenDados = JSON.parse(decoded) as Token;
    if (typeof tokenDados.id === 'undefined') {
      consoleLog(`Token sem o parâmetro id`, pVerbose.erro);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`),
        );
    }
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retorno = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o MySQL',
        error,
      );
      return resp.status(400).json(retorno);
    }
    try {
      // const cadOperador = new CadOperadorDB({});
      // const operador = await cadOperador.findLogin(
      //   tokenDados.login,
      //   connection,
      // );

      // if (operador.length === 0) {
      //   consoleLog(`Operador não encontrado!`, pVerbose.erro);
      //   return resp.status(403).json(retornoPadrao(1, `Sessão Expirada!`));
      // }

      req.customProperties = {
        login: tokenDados.login,
        id: tokenDados.id,
        token_data: tokenDados,
      };
    } catch (error) {
      consoleLog(`Erro ao buscar operador`, pVerbose.erro);
      return resp.status(403).json(retornoPadrao(1, `Token Inválido!`));
    } finally {
      MySqlConnection.closeConnection(connection);
    }
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      if (
        error?.name === 'TokenExpiredError' &&
        isRefreshable(String(error.expiredAt))
      ) {
        consoleLog(
          `Token expirado mas pode ser atualizado. Expirou em: ${error?.expiredAt} - url: ${url}`,
          pVerbose.aviso,
        );
        return resp
          .status(401)
          .json(
            retornoPadrao(
              1,
              `Sessão Expirada. Realize novamente a autenticação.`,
            ),
          );
      }
      consoleLog(`Token Expirado - url: ${url}`, pVerbose.erro);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão Expirada. Realize a autenticação novamente`),
        );
    }
    consoleLog(`Token Inválido - url: ${url}`, pVerbose.erro);
    return resp
      .status(403)
      .json(
        retornoPadrao(1, `Sessão Expirada! Realize a autenticação novamente`),
      );
  }
}

export {
  decryptToken, encryptToken, gerarTokenColaborador
};

