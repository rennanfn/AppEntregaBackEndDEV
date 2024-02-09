import { Connection,  ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from "uuid";
import { ReturnDefault } from "../Interfaces";
import { ErrorHandlerDB } from "../utils/ErrorHandlerDB";
import retornoPadrao from "../utils/retornoPadrao";
import { consoleLog, pVerbose } from "../utils/consoleLog";
import { iArmarios } from "../model/Cad_Armarios";

export default class CadArmariosDB {
  private rowsUndefined(): ErrorHandlerDB {
    consoleLog(`Erro ao buscar armário, rows = undefined`, pVerbose.erro);
    return new ErrorHandlerDB(`Erro ao buscar armário, rows = undefined`);
  }

  async insert(
    obj: iArmarios,
    conn: Connection
  ): Promise<ReturnDefault> {
    obj.id = uuidv4();

    return new Promise(async (resolve, reject) => {
      const sql = `INSERT INTO sesmt_armario (id, genero, situacao, numero, id_local) VALUES (?,?,?,?,?)`;

      const armarios_db = [
        obj.id,
        obj.numero,
        obj.situacao,
        obj.genero,
        obj.id_local,
      ];

      try {
        const [result] = await conn.execute<ResultSetHeader>(sql, armarios_db);

        if (result.affectedRows <= 0) {
          consoleLog(
            `Erro ao inserir armário ${obj.numero}, rows = undefined`,
            pVerbose.erro
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao inserir armário ${obj.numero}, rows = undefined`
            )
          );
        }
        consoleLog(
          `Armário número: ${obj.numero}, inserido com sucesso!`,
          pVerbose.aviso
        );
        return resolve(
          retornoPadrao(
            0,
            `Armário número: ${obj.numero}, inserido com sucesso!`
          )
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: iArmarios,
    conn: Connection
  ): Promise<ReturnDefault> {
    const sql = `UPDATE sesmt_armario genero = ?, situacao = ?, numero = ?, id_local = ? WHERE id = ?`;

    const armario_db = [
      obj.genero,
      obj.situacao,
      obj.numero,
      obj.id_local,
      obj.id
    ]

    try {
      const [result] = await conn.execute<ResultSetHeader>(sql, armario_db);
      if (typeof result === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      if (result.affectedRows <= 0) {
        consoleLog(`Armário não encontrado`, pVerbose.erro);
        return Promise.resolve(retornoPadrao(1, `Armário não encontrado!`));
      }
      consoleLog(
        `Armário ${obj.numero} atualizado com sucesso!`,
        pVerbose.aviso
      );
      return Promise.resolve(
        retornoPadrao(0, `Armário ${obj.numero} atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateSituacao(
    obj: iArmarios,
    conn: Connection
  ): Promise<ReturnDefault> {
    const sql = `UPDATE sesmt_armario set situacao = 'Em Uso' where id = ?`;
    const binds = [
      obj.id
    ];

    try {
      const [result] = await conn.execute<ResultSetHeader>(sql, binds);

      if (typeof result === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }

      if (result.affectedRows <= 0) {
        consoleLog(`Armário não encontrado`, pVerbose.erro);
        return Promise.resolve(retornoPadrao(1, `Armário não encontrado!`));
      }
      consoleLog(
        `Armário ${obj.numero} atualizado com sucesso!`,
        pVerbose.aviso
      );
      return Promise.resolve(
        retornoPadrao(0, `Armário ${obj.numero} atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(
    idLocal,
    conn: Connection
  ): Promise<iArmarios[]> {
    const sql = `SELECT arm.id,
                 arm.numero,
                 arm.situacao,
                 arm.genero,
                 arm.id_local,
                 lcl.local
                 FROM sesmt_armario arm
                 INNER JOIN sesmt_local lcl ON lcl.id = arm.id_local
                 WHERE id_local = ?
                 ORDER BY numero asc`;

    const [result] = await conn.execute<RowDataPacket[]>(sql, [idLocal]);

    if (typeof result === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const armario = result.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
      } as iArmarios;
    });

    return Promise.resolve(armario);
  }

  async showLivre(
    idLocal,
    conn: Connection
  ): Promise<iArmarios[]> {
    const sql = `SELECT arm.id,
                 arm.numero,
                 arm.situacao,
                 arm.genero,
                 arm.id_local,
                 lcl.local
                 FROM sesmt_armario arm
                 INNER JOIN sesmt_local lcl ON lcl.id = arm.id_local
                 WHERE id_local = ? AND arm.situacao = 'Livre'
                 ORDER BY numero asc`;

    const [result] = await conn.execute<RowDataPacket[]>(sql, [idLocal]);

    const armarios = result;
    if (typeof armarios === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }

    const armariosFormat = armarios.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
      } as iArmarios;
    });

    return Promise.resolve(armariosFormat);
  }

  async find(
    numero: number,
    genero: string,
    id_local: string,
    conn: Connection
  ): Promise<iArmarios[]> {
    const sql = `SELECT numero,
                 genero,
                 id_local
                 FROM sesmt_armario
                 WHERE numero = ?
                 AND genero = ?
                 AND id_local = ?
                 ORDER BY numero asc`;
    const [result] = await conn.execute<RowDataPacket[]>(
      sql,
      [numero, genero, id_local],
    );

    const res_armario = result;
    if (typeof res_armario === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }

    const armariosFormat = res_armario.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
      } as iArmarios;
    });

    return Promise.resolve(armariosFormat);
  }

  async delete(id: string, conn: Connection): Promise<ReturnDefault> {
    return new Promise(async (resolve, reject) => {
      let resposta = {} as ReturnDefault;

      const sql = "DELETE FROM sesmt_armario WHERE id = ?";

      try {
        const [result] = await conn.execute<ResultSetHeader>(sql, [id]);
        const deleteResult = result;
        if (typeof deleteResult === "undefined") {
          consoleLog(
            `Erro ao deletar armário, result = undefined`,
            pVerbose.erro
          );
          return reject(
            retornoPadrao(1, `Erro ao deletar armário, result = undefined`)
          );
        }
        if (deleteResult.affectedRows <= 0) {
          resposta = retornoPadrao(1, `Armário não foi encontrado!`);
        } else {
          resposta = retornoPadrao(0, `Armário deletado com sucesso!`);
        }
        consoleLog(resposta.retorno.mensagem, pVerbose.erro);
        return resolve(resposta);
      } catch (error) {
        return reject(error);
      }
    });
  }
}
