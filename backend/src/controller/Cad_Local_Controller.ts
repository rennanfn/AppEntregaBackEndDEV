import { Request, Response } from "express";
import { MySqlConnection } from "../model/MySqlConnection";
import { iLocal, localSchema } from "../model/Cad_Local";
import { ErroGeneral } from "../model/ErroGeneral";
import CadLocalDB from "../modelDB/Cad_Local_BD";
import retornoPadrao from "../utils/retornoPadrao";
import CadUsuarioDB from "../modelDB/Cad_Usuario_DB";

export default class LocalController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    let local: iLocal;

    try {
      local = localSchema.parse(req.body);
      local.status = 1;
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

    const cadLocalDB = new CadLocalDB();
    try {
      // Identifica o id do usuário logado, se for o sesmt já cadastra o local na tabela sesmt_usuario_local
      const login = req.customProperties.id;
      const retorno = await cadLocalDB.insert(local, login, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir local`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    let local: iLocal;

    try {
      local = localSchema.parse(req.body);
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

    const cadLocalDB = new CadLocalDB();
    try {
      const retorno = await cadLocalDB.update(local, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar a local`,
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
    const cadLocal = new CadLocalDB();
    const cadUsuario = new CadUsuarioDB();
    try {
      // Identifica o id do usuário logado e envia este id para verificar se ele tem permissão cadastrada
      const login = req.customProperties.id;
      const retornoLogin = await cadUsuario.verificaPermissao(login, connection);

      if (retornoLogin.length >= 1) {
        // Mapeie as permissões em uma matriz de promessas
        const promises = retornoLogin.map((permissao) =>
        cadLocal.show(permissao.id_local, connection)
        );

        // Use Promise.all para buscar todos os locais
        const resultados = await Promise.all(promises);

        // Os resultados serão uma matriz de matrizes, nivelamos isso em uma única matriz de local
        const locais = resultados.flat();

        return resp.json(locais);
      } else {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário não tem permissão de acesso aos locais`));
      }
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

  static async ativaDesativa(req: Request, resp: Response): Promise<Response> {
    const { id } = req.params;

    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o MySQL',
        error,
      );
      return resp.status(400).json(retornar);
    }

    const cadLocal = new CadLocalDB();
    try {
      const local = await cadLocal.find(id, connection);
      if (typeof local === 'undefined') {
        return resp
          .status(400)
          .json(retornoPadrao(1, 'Local não encontrado'));
      }

      if (local[0].status === 1) {
        local[0].status = 0;
      } else {
        local[0].status = 1;
      }
      cadLocal.ativaDesativa(local[0], connection);
      await connection.commit();
      return resp.json(local);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar o local`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }
}
