import { Connection,  ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ReturnDefault } from "../Interfaces";
import { v4 as uuidv4 } from "uuid";
import { iUsuario } from "./../model/Cad_Usuario";
import retornoPadrao from "../utils/retornoPadrao";
import { ErrorHandlerDB } from "../utils/ErrorHandlerDB";
import { consoleLog, pVerbose } from "../utils/consoleLog";
import { response } from "express";

export default class CadUsuarioDB {
  private rowsUndefined(): ErrorHandlerDB {
    consoleLog(`Erro ao buscar usuário, rows = undefined`, pVerbose.erro);
    return new ErrorHandlerDB(`Erro ao buscar usuário, rows = undefined`);
  }

  async insert(
    obj: iUsuario,
    conn: Connection
  ): Promise<ReturnDefault> {
    obj.id = uuidv4();

    const { id_local, ...objUsuario } = obj;

    const insertLocal = obj.id_local.map((localId) => {
        const id_usuario_local = uuidv4();
        const sqlLocal = `INSERT INTO sesmt_usuario_local (id_usuario_local, id_usuario, id_local) VALUES (?, ?, ?)`;
        const bindsLocal  = [
          id_usuario_local,
          objUsuario.id,
          localId,
        ]
        return conn.execute(sqlLocal, bindsLocal);
    });

    return new Promise(async (resolve, reject) => {
      const sql = `INSERT INTO sesmt_usuario (id, login, senha) VALUES (?, ?, ?)`;
      const usuarioObj = [
        obj.id,
        obj.login,
        obj.senha
      ];

      try {

        await Promise.all(insertLocal);

        const [result] = await conn.execute<ResultSetHeader>(sql, usuarioObj);

        if (typeof result === "undefined") {
          consoleLog(
            `Erro ao inserir ${objUsuario.login}, rows = undefined`,
            pVerbose.erro
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao inserir ${objUsuario.login}, rows = undefined`
            )
          );
        }
        if (result.affectedRows <= 0) {
          consoleLog(
            `Erro ao inserir usuário ${objUsuario.login}`,
            pVerbose.erro
          );
          return resolve(
            retornoPadrao(1, `Erro ao inserir usuário ${objUsuario.login}`)
          );
        }
        consoleLog(
          `Usuário ${objUsuario.login}, inserido com sucesso!`,
          pVerbose.aviso
        );
        return resolve(
          retornoPadrao(0, `Usuário ${objUsuario.login}, inserido com sucesso!`)
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: iUsuario,
    conn: Connection
  ): Promise<ReturnDefault> {

    const { id_local, ...objUsuario } = obj;

    const sqlDeleteLocal = `DELETE FROM sesmt_usuario_local WHERE id_usuario = ?`;
    await conn.execute(sqlDeleteLocal, [objUsuario.id]);


    const insertLocal = obj.id_local.map((localId) => {
        const sqlLocal = `INSERT INTO sesmt_usuario_local (id_usuario_local, id_usuario, id_local) VALUES (?, ?, ?)`;
        const id_usuario_local = uuidv4();
        const bindsLocal  = [
          id_usuario_local,
          objUsuario.id,
          localId,
        ]
        return conn.execute(sqlLocal, bindsLocal);
    });

    await Promise.all(insertLocal);

    const sql = `UPDATE sesmt_usuario login = ?, senha = ? WHERE id = ?`;
      const usuarioObj = [
        obj.login,
        obj.senha,
        obj.id
      ];

    try {
      const [result] = await conn.execute<ResultSetHeader>(sql, usuarioObj);

      if (typeof result === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      if (result.affectedRows <= 0) {
        consoleLog(`Usuário não encontrado!`, pVerbose.erro);
        return Promise.resolve(retornoPadrao(0, `Usuário não encontrado!`));
      }
      consoleLog(`Usuário atualizado com sucesso!`, pVerbose.aviso);
      return Promise.resolve(
        retornoPadrao(0, `Usuário atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async verificaPermissao(id_usuario: string, conn: Connection): Promise<iUsuario[]> {
    const sql = `SELECT id_local FROM sesmt_usuario_local WHERE id_usuario = ?`;
    const [result] = await conn.execute<RowDataPacket[]>(sql, [id_usuario]);

    const usuario_local = result;
    if (typeof usuario_local === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const usuario_local_lower = usuario_local.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
      } as iUsuario;
    });
    return Promise.resolve(usuario_local_lower);
  }

  async show(conn) {
    const sql = `SELECT
                 usr.id,
                 usr.login,
                 CONCAT('[', GROUP_CONCAT(CONCAT('{"id_local":"', ul.id_local, '","local":"', lcl.local, '"}') ORDER BY ul.id_local SEPARATOR ', '), ']') AS id_local
                 FROM sesmt_usuario usr
                 INNER JOIN sesmt_usuario_local ul ON ul.id_usuario = usr.id
                 INNER JOIN sesmt_local lcl ON lcl.id = ul.id_local
                 GROUP BY usr.id, usr.login
                 ORDER BY usr.login ASC`;

    const [result] = await conn.execute(sql, []);

    if (typeof result === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }

    // Converte a string JSON em um objeto JavaScript
    const usuario_local_lower = result.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
        id_local: JSON.parse(formatObject.id_local),
      } as iUsuario;
    });

    return Promise.resolve(usuario_local_lower);
}

  async find(id: string, conn: Connection): Promise<iUsuario | null> {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT id_local FROM sesmt_usuario WHERE id = ?`;

      try {
        const [result] = await conn.execute<ResultSetHeader>(sql, [id]);

        if (typeof result === "undefined") {
          return Promise.reject(this.rowsUndefined());
        }

        const usuario_local_lower: iUsuario = {
          ...result[0]
        };

        return Promise.resolve(usuario_local_lower);
      } catch (error) {
        return response
          .status(400)
          .json(retornoPadrao(1, `Erro ao buscar usuário`));
      }
    });
  }

  async findLogin(
    login: string,
    conn: Connection
  ): Promise<iUsuario[]> {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT * FROM sesmt_usuario WHERE login = ?`;

      try {
        const [result] = await conn.execute<RowDataPacket[]>(sql, [login]);

        const usuarios = result;
        if (typeof usuarios === "undefined") {
          consoleLog(
            `Erro ao buscar o usuário ${login}, rows = undefined`,
            pVerbose.aviso
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao buscar o usuário ${login}, rows = undefined`
            )
          );
        }

        const usuario = usuarios.map((formatObject: RowDataPacket) => {
          return {
            ...formatObject
          } as iUsuario
        })

        return resolve(usuario);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async delete(id: string, conn: Connection): Promise<ReturnDefault> {
    return new Promise(async (resolve, reject) => {
      let resposta = {} as ReturnDefault;
      const sql = "DELETE FROM sesmt_usuario where id = ?";

      try {
        const [result] = await conn.execute<ResultSetHeader>(sql, [id]);
        const deleteResult = result;
        if (typeof deleteResult === "undefined") {
          consoleLog(
            `Erro ao deletar usuário, result = undefined`,
            pVerbose.erro
          );
          return reject(
            retornoPadrao(1, `Erro ao deletar usuário, result = undefined`)
          );
        }
        if (deleteResult.affectedRows <= 0) {
          resposta = retornoPadrao(
            1,
            `Não foi encontrado nenhum usuário para deletar`
          );
        } else {
          resposta = retornoPadrao(0, `Usuário deletado com sucesso!`);
        }
        consoleLog(resposta.retorno.mensagem, pVerbose.aviso);
        return resolve(resposta);
      } catch (error) {
        return reject(error);
      }
    });
  }
}
