import { Request, Response } from "express";
import { MySqlConnection } from "../model/MySqlConnection";
import { ErroGeneral } from "../model/ErroGeneral";
import CadArmariosDB from "../modelDB/Cad_Armario_DB";
import retornoPadrao from "../utils/retornoPadrao";
import { armariosSchema, iArmarios } from "./../model/Cad_Armarios";
import CadUsuarioDB from "../modelDB/Cad_Usuario_DB";

export default class ArmarioController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    let armario: iArmarios;
    try {
      armario = armariosSchema.parse(req.body);
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

    const cadArmarioDB = new CadArmariosDB();
    // Verifica no banco se já existe um armario que tenha o mesmo numero, genero e local cadastrado. Cadastros iguais não são permitidos
    const armarioDB = await cadArmarioDB.find(
      armario.numero,
      armario.genero,
      armario.id_local,
      connection
    );

    if (armarioDB.length >= 1) {
      return resp
        .status(400)
        .json(
          retornoPadrao(
            1,
            `Já existe um armário com mesmo número, local e gênero. Cadastre um armário diferente`
          )
        );
    }
    try {
      const retorno = await cadArmarioDB.insert(armario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir armário ${armario.numero}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    let armario: iArmarios;

    try {
      armario = armariosSchema.parse(req.body);
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

    const cadArmariosDB = new CadArmariosDB();
    try {
      const retorno = await cadArmariosDB.update(armario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar armário ${armario.numero}`,
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

    const cadArmarios = new CadArmariosDB();
    const cadUsuario = new CadUsuarioDB();
    try {
      // Identifica o id do usuário logado e envia este id para verificar se ele tem permissão cadastrada
      const login = req.customProperties.id;
      const retornoLogin = await cadUsuario.verificaPermissao(login, connection);

      if (retornoLogin.length >= 1) {
        // Mapeie as permissões em uma matriz de promessas
        const promises = retornoLogin.map((permissao) =>
          cadArmarios.show(permissao.id_local, connection)
        );

        // Use Promise.all para buscar todos os armários
        const resultados = await Promise.all(promises);

        // Os resultados serão uma matriz de matrizes, nivelamos isso em uma única matriz de armários
        const armarios = resultados.flat();

        return resp.json(armarios);
      } else {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário não tem permissão de acesso aos armários`));
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

  static async showLivre(req: Request, resp: Response): Promise<Response> {
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

    const cadArmarios = new CadArmariosDB();
    const cadUsuario = new CadUsuarioDB();
    try {
      // Identifica o id do usuário logado e envia este id para verificar se ele tem permissão cadastrada
      const login = req.customProperties.id;
      const retornoLogin = await cadUsuario.verificaPermissao(login, connection);

      if (retornoLogin.length >= 1) {
        // Mapeie as permissões em uma matriz de promessas
        const promises = retornoLogin.map((permissao) =>
          cadArmarios.showLivre(permissao.id_local, connection)
        );

        // Use Promise.all para buscar todos os armários
        const resultados = await Promise.all(promises);

        // Os resultados serão uma matriz de matrizes, nivelamos isso em uma única matriz de armários
        const armarios = resultados.flat();

        return resp.json(armarios);
      } else {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário não tem permissão de acesso aos armários`));
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

  // static async showLivre(req: Request, resp: Response): Promise<Response> {
  //   let connection;
  //   try {
  //     connection = await MySqlConnection.getConnection();
  //   } catch (error) {
  //     const erroG = ErroGeneral.getErrorGeneral(
  //       "Erro ao abrir conexão com o MySQL",
  //       error
  //     );
  //     return resp.status(400).json(erroG);
  //   }

  //   const cadArmarios = new CadArmariosDB();
  //   try {
  //     const retorno = await cadArmarios.showLivre(
  //       connection
  //     );
  //     return resp.json(retorno);
  //   } catch (error) {
  //     const resultErro = ErroGeneral.getErrorGeneral(
  //       `Erro ao buscar parâmetros`,
  //       error
  //     );
  //     return resp.status(400).json(resultErro);
  //   } finally {
  //     MySqlConnection.closeConnection(connection);
  //   }
  // }

  // static async find(req: Request, resp: Response): Promise<Response> {
  //   const { id } = req.params;

  //   let connection;
  //   try {
  //     connection = await MySqlConnection.getConnection();
  //   } catch (error) {
  //     const erroG = ErroGeneral.getErrorGeneral(
  //       "Erro ao abrir conexão com mysql",
  //       error
  //     );
  //     return resp.status(400).json(erroG);
  //   }

  //   const cadArmario = new CadArmariosDB();
  //   try {
  //     const retorno = await cadArmario.find(Number(id), connection);
  //     return resp.json(retorno);
  //   } catch (error) {
  //     const resultErro = ErroGeneral.getErrorGeneral(
  //       `Erro ao buscar parâmetros`,
  //       error
  //     );
  //     return resp.status(400).json(resultErro);
  //   } finally {
  //     MySqlConnection.closeConnection(connection);
  //   }
  // }

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
    const cadArmariosDB = new CadArmariosDB();
    try {
      const retorno = await cadArmariosDB.delete(id, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.commit();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao deletar armário`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }
}
