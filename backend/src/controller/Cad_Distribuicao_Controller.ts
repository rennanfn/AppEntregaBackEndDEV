import { Request, Response } from "express";
import { MySqlConnection } from "../model/MySqlConnection";
import CadDistribuicaoDB from "../modelDB/Cad_Distribuicao_DB";
import {
  distribuicaoSchema,
  iDistribuicaoZod
} from "./../model/Cad_Distribuicao";
import { ErroGeneral } from "./../model/ErroGeneral";
import CadUsuarioDB from "../modelDB/Cad_Usuario_DB";
import retornoPadrao from "../utils/retornoPadrao";
import { convertString2Date } from "../utils/dateNow";

export default class DistribuicaoController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    let distribuicao: iDistribuicaoZod = req.body;
    try {
      distribuicaoSchema.parse(distribuicao);
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

    const cadDistribuicaoDB = new CadDistribuicaoDB();
    try {
      const retorno = await cadDistribuicaoDB.insert(distribuicao, connection);
      const retornoSit = await cadDistribuicaoDB.updateSituacao(
        distribuicao.id_armario,
        connection
      );
      await connection.commit();
      return resp.json(retorno && retornoSit);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir distribuição`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    let distribuicao: iDistribuicaoZod;

    try {
      distribuicao = distribuicaoSchema.parse(req.body);
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

    const cadDistribuicaoDB = new CadDistribuicaoDB();
    try {
      const retorno = await cadDistribuicaoDB.update(distribuicao, connection);
      const retornoSit = await cadDistribuicaoDB.updateSituacao(
        distribuicao.id_armario,
        connection
      );
      await connection.commit();
      return resp.json(retorno && retornoSit);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar a distribuição`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async devolucao(req: Request, resp: Response): Promise<Response> {
    let distribuicao = req.body;

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

    if(distribuicao.data_devolucao === 'S'){
      distribuicao.data_retirada = null;
      distribuicao.confirmacao = 'NÃO';
    }

    const cadDistribuicaoDB = new CadDistribuicaoDB();
    try {
      const retorno = await cadDistribuicaoDB.devolucao(distribuicao.id, distribuicao.data_retirada, distribuicao.confirmacao, connection);

      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar a distribuição`,
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

    const cadDistribuicao = new CadDistribuicaoDB();
    const cadUsuario = new CadUsuarioDB();
    try {
      // Identifica o id do usuário logado e envia este id para verificar se ele tem permissão cadastrada
      const login = req.customProperties.id;
      const retornoLogin = await cadUsuario.verificaPermissao(login, connection);

      if (retornoLogin.length >= 1) {
        // Mapeie as permissões em uma matriz de promessas
        const promises = retornoLogin.map((permissao) =>
        cadDistribuicao.show(permissao.id_local, connection)
        );

        // Use Promise.all para buscar todos as distribuições
        const resultados = await Promise.all(promises);

        // Os resultados serão uma matriz de matrizes, nivelamos isso em uma única matriz de distribuição
        const armarios = resultados.flat();

        return resp.json(armarios);
      } else {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário não tem permissão de acesso a distribuição`));
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

  static async showColaborador(
    req: Request,
    resp: Response
  ): Promise<Response> {
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
    const cadDistribuicaoDB = new CadDistribuicaoDB();
    try {
      const retorno = await cadDistribuicaoDB.showColaborador(connection);
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
    const { id, id_armario } = req.params;

    // let distribuicao: iDistribuicao;

    // try {
    //   distribuicao = distribuicaoSchema.parse(req.body);
    // } catch (error) {
    //   const retornar = ErroGeneral.getErrorGeneral(
    //     "Objeto recebido não é do tipo esperado",
    //     error
    //   );
    //   return resp.status(400).json(retornar);
    // }

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
    const cadDistribuicaoDB = new CadDistribuicaoDB();
    try {
      const retornoSit = await cadDistribuicaoDB.updateSituacaoDelete(
        id_armario,
        connection
      );

      const retorno = await cadDistribuicaoDB.delete(id, connection);
      await connection.commit();
      return resp.json(retorno && retornoSit);
    } catch (error) {
      await connection.commit();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao deletar distribuição`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }
}
