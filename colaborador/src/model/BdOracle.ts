/* eslint-disable @typescript-eslint/no-unused-vars */
import { consoleLog, pVerbose } from '../utils/consoleLog';
import oracledb, { Connection } from 'oracledb';
import { ErroGeneral } from './ErroGeneral';

export abstract class BdOracle {
  static async getConnection(): Promise<oracledb.Connection> {
    try {
      return await oracledb.getConnection();
    } catch (error) {
      ErroGeneral.getErrorGeneral('Erro ao abrir conexão com o MySQL', error);
      throw error;
    }
  }

  static async closeConnection(conn: Connection | undefined): Promise<void> {
    if (typeof conn === 'undefined') return Promise.resolve();
    return conn
      .close()
      .then()
      .catch((erro) => consoleLog('Erro ao fechar conexão', pVerbose.erro));
  }
}
