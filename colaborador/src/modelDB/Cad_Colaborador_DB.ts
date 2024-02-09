/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */

import { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import oracledb from "oracledb";
import { ReturnDefault } from "../Interfaces";
import { iColaborador } from "../model/Cad_Colaborador";
import { consoleLog, pVerbose } from "../utils/consoleLog";
import convertLowerCase from "../utils/convertLowerCase";
import retornoPadrao from "../utils/retornoPadrao";

export class CadColaboradorDB {
  private rowsUndefined(): Error {
    consoleLog(
      `Erro ao buscar colaboradores, rows = undefined`,
      pVerbose.erro,
    );
    return new Error(
      `Erro ao buscar colaboradores, rows = undefined`,
    );
  }

  async insert(
    obj: iColaborador,
    conn: Connection,
  ): Promise<ReturnDefault> {

    const sql = `INSERT INTO colaboradores (matricula, nome_funcio, desc_situacao)
                 VALUES (?,?,?)`;
    const values = [
      obj.matricula,
      obj.nome_funcio,
      obj.desc_situacao,
    ];

      try {
        const [result] = await conn.query<ResultSetHeader>(sql, values);
        if (result.affectedRows === 1) {
          consoleLog(`Colaborador ${obj.matricula} inserido com sucesso!`, pVerbose.aviso);
          return Promise.resolve(
            retornoPadrao(0, `Colaborador ${obj.matricula} inserido com sucesso!`),
          );
        } else {
          consoleLog(`Erro ao inserir colaborador`, pVerbose.erro);
          return Promise.resolve(retornoPadrao(1, `Erro ao inserir colaborador`));
        }
      } catch (error) {
        consoleLog(`Erro ao inserir colaborador: ${error}`, pVerbose.erro);
        return Promise.reject(error);
      }
  }

  async showColaborador(conn: oracledb.Connection): Promise<iColaborador[]> {
    const sql = `SELECT col.matricula,
                        col.nome_funcio,
                        col.desc_situacao
                        FROM ${process.env.VIEW_SENIOR}.api_colaboradores_view col
                        WHERE situacao != 7
                        ORDER BY matricula asc`;
        const result = await conn.execute<iColaborador>(sql, [], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });

        const colaborador = result.rows;
        if (typeof colaborador === "undefined") {
          return Promise.reject(this.rowsUndefined());
        }
        const colaborador_lower = convertLowerCase(colaborador);
        const cadColaborador = colaborador_lower.map((colaborador) => {
          const item_colaborador = colaborador;
          return item_colaborador;
        });
        return Promise.resolve(cadColaborador);
    }

  async find(
    matricula: number,
    conn: Connection,
  ): Promise<number> {
    const sql = `SELECT matricula FROM colaboradores
                 WHERE matricula = ? ORDER BY matricula desc`;
     try {
      const [rows] = await conn.query<RowDataPacket[]>(sql, [matricula]);
      if (typeof rows === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      if (rows.length === 0) {
        return Promise.resolve(1);
      } else {
        return Promise.resolve(0);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
