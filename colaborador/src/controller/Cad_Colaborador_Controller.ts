import { Request, Response } from 'express';
import { CadColaboradorDB } from '../modelDB/Cad_Colaborador_DB';
import { BdOracle } from '../model/BdOracle';
import { ErroGeneral } from '../model/ErroGeneral';
import { MySqlConnection } from '../modelDB/MySqlConnection';
import { consoleLog, pVerbose } from '../utils/consoleLog';
import retornoPadrao from '../utils/retornoPadrao';
import { ReturnDefault } from '../Interfaces';

export default class ColaboradorController {
  static async showColaborador(
    req: Request,
    resp: Response,
  ): Promise<Response> {
    let mysqlConnection;
    let oracleConnection;
    try {
      mysqlConnection = await MySqlConnection.getConnection();
      oracleConnection = await BdOracle.getConnection();
    } catch (error) {
      const erro = ErroGeneral.getErrorGeneral(
        `Erro ao abrir conexão com o banco`,
        error,
      );
      return resp.status(400).json(erro);
    }

    const cadColaborador = new CadColaboradorDB();
    const retornoOracle =
      await cadColaborador.showColaborador(oracleConnection);
    if (retornoOracle.length === 0 || typeof retornoOracle === 'undefined') {
      console.log(
        `Não foram encontrados colaboradores para cadastrar`,
        pVerbose.erro,
      );
      return resp
        .status(400)
        .json(
          retornoPadrao(
            1,
            `Não foram encontrados colaboradores para cadastrar`,
          ),
        );
    }
    try {
      const colaboradoresInsert: ReturnDefault[] = [];
      for (const itemCol of retornoOracle) {
        const verificaBanco = await cadColaborador.find(
          itemCol.matricula,
          mysqlConnection,
        );

        if (verificaBanco > 0) {
          colaboradoresInsert.push(
            await cadColaborador.insert(itemCol, mysqlConnection),
          );
        } else {
          consoleLog(
            `Colaborador ${itemCol.matricula} já cadastrado!`,
            pVerbose.aviso,
          );
        }
      }
      const retorno = await Promise.all(colaboradoresInsert);
      await mysqlConnection.commit();
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(mysqlConnection);
    }
  }

  // static async show(req: Request, resp: Response): Promise<Response> {
  //   let connection;
  //   try {
  //     connection = await BdOracle.getConnection();
  //   } catch (error) {
  //     const erro = ErroGeneral.getErrorGeneral(
  //       'Erro ao abrir conexão com o MySQL',
  //       error,
  //     );
  //     return resp.status(400).json(erro);
  //   }

  //   const cadColaborador = new CadColaboradorDB();
  //   try {
  //     const retorno = await cadColaborador.showColaborador(connection);
  //     return resp.json(retorno);
  //   } catch (error) {
  //     const resultErro = ErroGeneral.getErrorGeneral(
  //       `Erro ao buscar parâmetros`,
  //       error,
  //     );
  //     return resp.status(400).json(resultErro);
  //   } finally {
  //     BdOracle.closeConnection(connection);
  //   }
  // }

  // static async buscarToken(req: Request, resp: Response): Promise<Response> {
  //   const { matricula } = req.params;

  //   let connection;
  //   try {
  //     connection = await BdOracle.getConnection();
  //   } catch (error) {
  //     const erro = ErroGeneral.getErrorGeneral(
  //       'Erro ao abrir conexão com o MySQL',
  //       error,
  //     );
  //     return resp.status(400).json(erro);
  //   }

  //   const cadToken = new CadColaboradorDB();
  //   try {
  //     const retorno = await cadToken.buscarToken(Number(matricula), connection);
  //     return resp.json(retorno);
  //   } catch (error) {
  //     const resultErro = ErroGeneral.getErrorGeneral(
  //       `Erro ao buscar parâmetros`,
  //       error,
  //     );
  //     return resp.status(400).json(resultErro);
  //   } finally {
  //     BdOracle.closeConnection(connection);
  //   }
  // }
}
