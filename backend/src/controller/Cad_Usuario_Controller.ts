import { Request, Response } from "express";
import { MySqlConnection } from "../model/MySqlConnection";
import { ErroGeneral } from "../model/ErroGeneral";
import CadUsuarioDB from "../modelDB/Cad_Usuario_DB";
import criptografar from "../utils/criptografar";
import retornoPadrao from "../utils/retornoPadrao";
import { iUsuario, usuarioSchema } from "./../model/Cad_Usuario";

export default class UsuarioController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    let usuario: iUsuario;

    try {
      usuario = usuarioSchema.parse(req.body);
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Objeto recebido não é do tipo esperado",
        error
      );
      return resp.status(400).json(retornar);
    }

    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retor = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o MySQL",
        error
      );
      return resp.status(400).json(retor);
    }

    const cadUsuarioDB = new CadUsuarioDB();
    try {
      // Verifica no banco se já existe o login que está sendo cadastro. Logins iguais não são permitidos
      const usuarioDB = await cadUsuarioDB.findLogin(usuario.login, connection);

      if (usuarioDB.length >= 1) {
        return resp
          .status(400)
          .json(
            retornoPadrao(
              1,
              `Já existe um login '${usuario.login}'. Cadastre um login diferente`
            )
          );
      }
      let senhaCrip;
      if (typeof usuario.senha !== "undefined") {
        if (usuario.senha !== null) {
          senhaCrip = await criptografar.criptografarSenha(usuario.senha);
          usuario.senha = senhaCrip;
        }
      }
      const retorno = await cadUsuarioDB.insert(usuario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir usuário ${usuario.login}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    let usuario: iUsuario;

    if (req.body.senha === null) {
      delete req.body.senha;
    }

    try {
      usuario = usuarioSchema.parse(req.body);
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Objeto recebido não é do tipo esperado",
        error
      );
      return resp.status(400).json(retornar);
    }

    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retor = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o MySQL",
        error
      );
      return resp.status(400).json(retor);
    }

    const cadUsuarioDB = new CadUsuarioDB();
    try {
      let senhaCrip;
      if (typeof usuario.senha !== "undefined") {
        if (usuario.senha !== null) {
          senhaCrip = await criptografar.criptografarSenha(usuario.senha);
          usuario.senha = senhaCrip;
        }
      }
      const retorno = await cadUsuarioDB.update(usuario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar usuário ${usuario.id}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async show(req: Request, resp: Response): Promise<Response> {
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const erroG = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o MySQL",
        error
      );
      return resp.status(400).json(erroG);
    }
    const cadUsuario = new CadUsuarioDB();
    try {
      const retorno = await cadUsuario.show(connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async delete(req: Request, resp: Response): Promise<Response> {
    const { id } = req.params;
    if (typeof id === "undefined") {
      return resp
        .status(400)
        .json(retornoPadrao(1, `Objeto recebido não é do tipo esperado`));
    }
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retor = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o MySQL",
        error
      );
      return resp.status(400).json(retor);
    }
    const cadUsuarioDB = new CadUsuarioDB();
    try {
      const retorno = await cadUsuarioDB.delete(id, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.commit();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao deletar usuário`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }
}
