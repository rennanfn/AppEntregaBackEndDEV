import * as CryptoJS from "crypto-js";
import { ErroGeneral } from "./../model/ErroGeneral";
import { Token } from "../Interfaces";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import retornoPadrao from "./retornoPadrao";
import { MySqlConnection } from "../model/MySqlConnection";
import CadUsuarioDB from "../modelDB/Cad_Usuario_DB";
import { consoleLog, pVerbose } from "./consoleLog";

interface DataToRefresh {
  login: string;
  id: string;
}

function encryptToken(obj: string): string {
  // consoleLog(`Criptografando payload token...`, pVerbose.aviso);
  const payload_key =
    typeof process.env.PAYLOAD_KEY !== "undefined"
      ? process.env.PAYLOAD_KEY
      : "";

  if (payload_key === "") return "";
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
    }
  );
  // consoleLog(`Payload criptogrado com sucesso!`, pVerbose.aviso);
  return encrypted.toString();
}

function gerarToken(obj: Token): string {
  const secretKey =
    typeof process.env.TOKEN_SECRET_ARMARIOS !== "undefined"
      ? process.env.TOKEN_SECRET_ARMARIOS
      : "";

  if (secretKey === "") return "";

  const corpoToken = JSON.stringify(obj);
  const newPayload = encryptToken(corpoToken);

  if (newPayload === "") return "";
  const tokenEncrypto = {
    tokenEnc: newPayload,
  };

  const tokenExpireTime = process.env.TOKEN_EXPIRES_IN_MINUTE ?? "60";
  const jwtOptions: jwt.SignOptions = {
    expiresIn: `${tokenExpireTime}m`,
  };

  const token = jwt.sign(tokenEncrypto, secretKey, jwtOptions);

  return token;
}

function decryptToken(encrypted: string): string {
  // consoleLog(`Descriptografando payload token...`, pVerbose.aviso);
  const payload_key =
    typeof process.env.PAYLOAD_KEY !== "undefined"
      ? process.env.PAYLOAD_KEY
      : "";

  if (payload_key === "") return "";

  const key = CryptoJS.enc.Utf8.parse(payload_key);
  const iv = CryptoJS.enc.Utf8.parse(payload_key);

  const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key, {
    keySize: 128 / 8,
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  // consoleLog(`Payload descriptografado com sucesso!`, pVerbose.aviso);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function isRefreshable(expiredAt: string): boolean {
  const timeDiff = Math.abs(+new Date() - +new Date(expiredAt)) / 60000;
  if (Math.trunc(timeDiff) <= 10) {
    return true;
  }
  return false;
}

function validLifeTimeToken(iat: number, exp: number): boolean {
  const tokenExpireTime = process.env.TOKEN_EXPIRES_IN_MINUTE ?? "60";
  const tokenExpireInMs = Number(tokenExpireTime) * 60000;

  const timeDiff = Math.abs(+new Date(exp) - +new Date(iat)) * 1000;
  if (Math.trunc(timeDiff) <= tokenExpireInMs) return true;
  return false;
}

export const validaToken = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const userIp = req.userIp?.ip ?? "";
  const url = req.url ?? "";

  // console.log("Validando Token...", 0, undefined, userIp);
  const token = req.headers.authorization;
  if (typeof token === "undefined") {
    console.log(`Request sem token`, 1, userIp);
    return resp
      .status(403)
      .json(
        retornoPadrao(1, "Sessão expirada. Realize a autenticação novamente.")
      );
  }
  try {
    const secretKey =
      typeof process.env.TOKEN_SECRET_ARMARIOS !== "undefined"
        ? process.env.TOKEN_SECRET_ARMARIOS
        : "";

    const payloadTokenEnc = jwt.verify(token, secretKey) as jwt.JwtPayload;

    const { iat, exp } = payloadTokenEnc;
    if (
      typeof iat === "undefined" ||
      typeof exp === "undefined" ||
      iat === null ||
      exp === null ||
      !validLifeTimeToken(iat, exp)
    ) {
      console.log(`Claims inválidas`, 1, userIp);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, "Sessão Expirada. Realize a autenticação novamente")
        );
    }

    const decoded = decryptToken(payloadTokenEnc.tokenEnc);
    if (decoded === "") {
      console.log(
        `Não foi possível descriptografar o token`,
        1,
        undefined,
        userIp
      );
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão Expirada. Realize a autenticação novamente`)
        );
    }
    const tokenDados = JSON.parse(decoded) as Token;

    if (typeof tokenDados.id === "undefined") {
      console.log(`Token sem o parâmentro id`, userIp);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`)
        );
    }
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retorno = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o MySQL",
        error
      );
      return resp.status(400).json(retorno);
    }
    try {
      const cadUsuario = new CadUsuarioDB();
      const usuario = await cadUsuario.findLogin(tokenDados.login, connection);

      if (usuario.length === 0) {
        console.log(
          `Usuáro ${tokenDados.login} não encontrado!`,
          1,
          undefined,
          userIp,
          tokenDados.id
        );
        return resp.status(403).json(retornoPadrao(1, `Sessão Expirada!`));
      }

      req.customProperties = {
        login: tokenDados.login,
        id: tokenDados.id,
        token_data: tokenDados,
      };
    } catch (error) {
      console.log(
        `Erro ao buscar usuário - url: ${url}`,
        1,
        undefined,
        userIp,
        tokenDados.id
      );
      return resp.status(403).json(retornoPadrao(1, `Token Inválido!`));
    } finally {
      MySqlConnection.closeConnection(connection);
    }
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      if (
        error?.name === "TokenExpiredError" &&
        isRefreshable(String(error.expiredAt))
      ) {
        console.log(
          `Token expirado mas pode ser atualizado. Expirou em: ${error?.expiredAt} - url: ${url}`,
          1,
          undefined,
          userIp
        );
        return resp
          .status(401)
          .json(
            retornoPadrao(
              1,
              `Sessão Expirada! Realize a autenticação novamente`
            )
          );
      }
      console.log(`Token expirado - url: ${url}`, 1, undefined, userIp);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão Expirada. Realize a autenticação novamente`)
        );
    }
    console.log(`Token Inválido - url: ${url}`, 1, undefined, userIp);
    return resp
      .status(403)
      .json(
        retornoPadrao(1, `Sessão Expirada! Realize a autenticação novamente`)
      );
  }
};

function getDataToRefresh(token: string): DataToRefresh | null {
  try {
    const secretKey =
      typeof process.env.TOKEN_SECRET_ARMARIOS !== "undefined"
        ? process.env.TOKEN_SECRET_ARMARIOS
        : "";

    const payloadTokenEnc = jwt.verify(token, secretKey) as jwt.JwtPayload;
    if (payloadTokenEnc) {
      // Se passar no verify é sinal que o token não esta expirado então não pode fazer refresh,
      // descriptografa o token para pegar o id para o log
      const tokenEncript = jwt.decode(token) as jwt.JwtPayload;
      if (typeof tokenEncript?.tokenEnc === "undefined") return null;

      const tokenDecript = decryptToken(tokenEncript.tokenEnc);
      if (tokenDecript.length <= 0) return null;

      const { id }: DataToRefresh = JSON.parse(tokenDecript);
      consoleLog(
        `Tentativa de refresh sem estar expirado - token: ${payloadTokenEnc}`,
        1
      );
      return null;
    }
  } catch (error) {
    // Verifica se foi erro de expiração e se pode atualizar o token
    if (error instanceof TokenExpiredError) {
      if (
        error?.name === "TokenExpiredError" &&
        isRefreshable(String(error.expiredAt))
      ) {
        const tokenEncript = jwt.decode(token) as jwt.JwtPayload;
        if (typeof tokenEncript?.tokenEnc === "undefined") return null;

        const tokenDecript = decryptToken(tokenEncript.tokenEnc);
        if (tokenDecript.length <= 0) return null;

        const { login, id }: DataToRefresh = JSON.parse(tokenDecript);
        if (typeof login === "undefined" || typeof id === "undefined") {
          consoleLog(`Token sem login ou id, refresh cancelado`, 1);
          return null;
        }
        return { login, id };
      }
    }
  }
  return null;
}

export { gerarToken, encryptToken, decryptToken, getDataToRefresh };
