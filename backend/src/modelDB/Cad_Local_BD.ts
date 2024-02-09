import { Connection,  ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from "uuid";
import { ReturnDefault } from "../Interfaces";
import { iLocal } from "../model/Cad_Local";
import { ErrorHandlerDB } from "../utils/ErrorHandlerDB";
import { consoleLog, pVerbose } from "../utils/consoleLog";
import retornoPadrao from "../utils/retornoPadrao";

export default class CadLocalDB {
  private rowsUndefined(): ErrorHandlerDB {
    consoleLog(`Erro ao buscar local, rows = undefined`, pVerbose.erro);
    return new ErrorHandlerDB(`Erro ao buscar local, rows = undefined`);
  }

  async insert(
    obj: iLocal,
    login: string,
    conn: Connection
  ): Promise<ReturnDefault> {
    obj.id = uuidv4();

    return new Promise(async (resolve, reject) => {
      const local_db = {
        id: obj.id,
        local: obj.local,
        status: obj.status,
      };

      const sql = `INSERT INTO sesmt_local (id, local, status) VALUES (?,?,?)`;

      const locais_db = [local_db.id, local_db.local, local_db.status];

      const sqlUsuarioLocal = `INSERT INTO sesmt_usuario_local (id_usuario_local, id_usuario, id_local) VALUES (?,?,?)`;
      const usuarioLocal_db = {
        id_usuario_local: uuidv4(),
        id_usuario: login,
        id_local: local_db.id,
      };

      try {
        const [result] = await conn.execute<ResultSetHeader>(sql, locais_db);

        if (result.affectedRows <= 0) {
          consoleLog(
            `Erro ao inserir local ${local_db.local}, rows = undefined`,
            pVerbose.erro
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao inserir local ${local_db.local}, rows = undefined`
            )
          );
        }

        await conn.execute(sqlUsuarioLocal, [
          usuarioLocal_db.id_usuario_local,
          usuarioLocal_db.id_usuario,
          usuarioLocal_db.id_local,
        ]);

        consoleLog(
          `Local ${local_db.local}, inserido com sucesso!`,
          pVerbose.aviso
        );
        return resolve(
          retornoPadrao(0, `Local ${local_db.local}, inserido com sucesso!`)
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(obj: iLocal, conn: Connection): Promise<ReturnDefault> {
    const sql = `UPDATE sesmt_local SET local = ?, status = ? WHERE id = ?`;

    const binds = [obj.local, obj.status, obj.id];

    try {
      const [result] = await conn.execute<ResultSetHeader>(sql, binds);

      if (result.affectedRows <= 0) {
        consoleLog(`Local ${obj.local} não encontrado`, pVerbose.erro);
        return Promise.resolve(
          retornoPadrao(1, `Local ${obj.local} não encontrado`)
        );
      }

      consoleLog(`Local ${obj.local} atualizado com sucesso!`, pVerbose.aviso);
      return Promise.resolve(
        retornoPadrao(0, `Local ${obj.local} atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(idLocal, conn: Connection): Promise<iLocal[]> {
    const sql = `SELECT id,
                 local,
                 status
                 FROM sesmt_local
                 WHERE id = ?
                 ORDER BY local asc`;

    const [result] = await conn.execute<RowDataPacket[]>(sql, [idLocal]);

    const local = result;
    if (typeof local === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }

    const local_lower = local.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
      } as iLocal;
    });

    return Promise.resolve(local_lower);
  }

  async showAtivo(idLocal, conn: Connection): Promise<iLocal[]> {
    const sql = `SELECT id,
                 local,
                 status
                 FROM sesmt_local
                 WHERE id = ? AND status = 1
                 ORDER BY local asc`;

    const [result] = await conn.execute<RowDataPacket[]>(sql, [idLocal]);

    const local = result;
    if (typeof local === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const local_lower = local.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
      } as iLocal;
    });

    return Promise.resolve(local_lower);
  }

  async find(id: string, conn: Connection): Promise<iLocal[]> {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT id, status FROM sesmt_local WHERE id = ?`;

      try {
        const [result] = await conn.execute<RowDataPacket[]>(sql, [id]);
        const local = result;

        if (typeof local === "undefined") {
          consoleLog(`Erro ao buscar local, rows = undefined`, pVerbose.erro);
          return reject(
            retornoPadrao(1, `Erro ao buscar local, rows = undefined`)
          );
        }

        const local_convert = local.map((formatObject: RowDataPacket) => {
          return {
            ...formatObject,
          } as iLocal;
        });

        return resolve(local_convert);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async ativaDesativa(obj: iLocal, conn: Connection): Promise<ReturnDefault> {
    const sql = `UPDATE sesmt_local SET status = ? WHERE id = ?`;

    const binds = [obj.status, obj.id];

    try {
      const [result] = await conn.execute<ResultSetHeader>(sql, binds);

      if (result.affectedRows <= 0) {
        consoleLog(`Local não encontrado`, pVerbose.aviso);
        return Promise.resolve(retornoPadrao(0, `Local não encontrado`));
      }

      consoleLog(`Local atualizado com sucesso!`, pVerbose.aviso);
      return Promise.resolve(retornoPadrao(0, `Local atualizado com sucesso!`));
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
