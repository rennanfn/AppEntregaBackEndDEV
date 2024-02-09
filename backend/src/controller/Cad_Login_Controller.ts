import { Request, Response } from "express";
import { MySqlConnection } from "../model/MySqlConnection";
import { Connection } from 'mysql2/promise';
import { iUsuario } from "../model/Cad_Usuario";
import CadUsuarioDB from "../modelDB/Cad_Usuario_DB";
import { consoleLog, pVerbose } from "../utils/consoleLog";
import Criptografar from "../utils/criptografar";
import {
  default as retornoPadrao,
  default as returnoPadrao,
} from "../utils/retornoPadrao";
import { gerarToken, getDataToRefresh } from "../utils/token";
import { Token } from "./../Interfaces/index";
import { ErroGeneral } from "./../model/ErroGeneral";

export class LoginController {
  static async autenticar(req: Request, resp: Response): Promise<Response> {
    const usuario: iUsuario = req.body;

    if (
      typeof usuario.login === "undefined" ||
      typeof usuario.senha === "undefined"
    ) {
      return resp
        .status(400)
        .json(returnoPadrao(1, "Objeto recebido não é do tipo esperado"));
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

    const cadUsuario = new CadUsuarioDB();
    try {
      consoleLog(`Validando usuário ${usuario.login} e senha`, pVerbose.aviso);

      const usuarioBD = await cadUsuario.findLogin(usuario.login, connection);

      if (usuarioBD.length === 0) {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário ou senha inválidos!`));
      }

      if (
        typeof usuarioBD[0].senha === "undefined" ||
        usuarioBD[0].senha === null
      ) {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário ou senha inválidos!`));
      }

      const senhasConferem = await Criptografar.compararSenhas(
        usuario.senha,
        usuarioBD[0].senha
      );

      if (!senhasConferem) {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário ou senha inválido!`));
      } else {
        const dadosToken = await LoginController.prepararToken(
          usuarioBD[0],
          connection
        );

        const token = gerarToken(dadosToken);
        if (token === "") {
          return resp.status(400).json(retornoPadrao(1, `Erro ao gerar token`));
        }
        consoleLog(`Token gerado com sucesso!`, pVerbose.aviso);
        return resp.status(200).json({ token });
      }
    } catch (error) {
      await connection.rollback();
      const retorno = ErroGeneral.getErrorGeneral(
        "Erro ao autenticar usuário",
        error
      );
      return resp.status(400).json(retorno);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async prepararToken(
    usuarioBD: iUsuario,
    connection: Connection
  ): Promise<Token> {
    const cadUsuario = new CadUsuarioDB();

    if (typeof usuarioBD.login === "undefined" || usuarioBD.login === null) {
      return {} as Token;
    }
    const usuarioNome = await cadUsuario.findLogin(usuarioBD.login, connection);

    const dadosToken: Token = {
      id: String(usuarioNome[0].id),
      login:
        typeof usuarioNome[0].login !== "undefined" ? usuarioNome[0].login : "",
    };
    return dadosToken;
  }

  static async refreshToken(req: Request, resp: Response): Promise<Response> {
    const token = req.headers.authorization;
    const userIp = req.userIp?.ip ?? "";

    if (typeof token === "undefined") {
      consoleLog(
        `Request sem token, cancelado refresh token - ip: ${userIp}`,
        pVerbose.erro
      );
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente!`)
        );
    }

    const dataToken = getDataToRefresh(token);
    if (!dataToken) {
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão Expirada! Realize a autenticação novamente!`)
        );
    }

    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retorno = ErroGeneral.getErrorGeneral(
        "Erro ao brir conexão com o MySQL",
        error
      );
      return resp.status(400).json(retorno);
    }

    try {
      console.log(`Validando usuário - RefreshToken ${dataToken.login}`, 0);
      const cadUsuario = new CadUsuarioDB();
      const usuarioBD = await cadUsuario.findLogin(dataToken.login, connection);

      if (usuarioBD.length === 0) {
        consoleLog(
          `Usuário ${dataToken.login} não encontrado - ip: ${userIp}`,
          pVerbose.erro
        );
        return resp
          .status(400)
          .json(retornoPadrao(1, `Erro ao tentar atualizar token`));
      }

      const dadosToken = await LoginController.prepararToken(
        usuarioBD[0],
        connection
      );

      const tokenNovo = gerarToken(dadosToken);
      if (tokenNovo === "") {
        return resp.status(400).json(retornoPadrao(1, `Erro ao gerar token`));
      }

      consoleLog(`Token gerado com sucesso!`, pVerbose.aviso);
      return resp.status(200).json({ token: tokenNovo });
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        "Erro ao atualizar token",
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }
}
