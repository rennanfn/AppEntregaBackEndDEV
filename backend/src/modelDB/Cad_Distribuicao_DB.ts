import { Connection,  ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from "uuid";
import { ReturnDefault } from "../Interfaces";
import { ErrorHandlerDB } from "../utils/ErrorHandlerDB";
import { consoleLog, pVerbose } from "../utils/consoleLog";
import { convertDate2String } from "../utils/dateNow";
import {
  default as retornoPadrao,
  default as returnoPadrao,
} from "../utils/retornoPadrao";
import {
  CadColaboradorOut,
  CadDistribuicaoOut,
  iDistribuicao,
  iDistribuicaoZod,
} from "./../model/Cad_Distribuicao";

export default class CadDistribuicaoDB {
  private rowsUndefined(): ErrorHandlerDB {
    consoleLog(`Erro ao buscar distribuição, rows = undefined`, pVerbose.erro);
    return new ErrorHandlerDB(`Erro ao buscar distribuição, rows = undefined`);
  }

  async insert(
    obj: iDistribuicaoZod,
    conn: Connection
  ): Promise<ReturnDefault> {
    obj.id = uuidv4();

    const distribuicao_db = [
      obj.id,
      obj.matricula,
      obj.nome,
      obj.status,
      obj.armario,
      obj.id_local,
      obj.genero,
      obj.id_armario,
      obj.confirmacao,
      obj.data_retirada === "" ? null : obj.data_retirada,
    ]

    return new Promise(async (resolve, reject) => {
      const sql = `INSERT INTO sesmt_distribuicao (
        id, matricula, nome, status, armario, id_local, genero, id_armario, confirmacao, data_retirada
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`;
      try {
        const [result] = await conn.execute<ResultSetHeader>(sql, distribuicao_db);
        if (typeof result === "undefined") {
          consoleLog(
            `Erro ao inserir distribuição, rows = undefined`,
            pVerbose.erro
          );
          return reject(
            returnoPadrao(1, `Erro ao inserir distribuição, rows = undefined`)
          );
        }
        const distribuicaoGeralOutReturn = result;
        if (distribuicaoGeralOutReturn.affectedRows <= 0) {
          consoleLog(`Erro ao inserir distribuição`, pVerbose.erro);
          return resolve(retornoPadrao(1, `Erro ao inserir distribuição`));
        }
        consoleLog(`Disitribuição inserida com sucesso!`, pVerbose.aviso);
        return resolve(retornoPadrao(0, `Disitribuição inserida com sucesso!`));
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: iDistribuicaoZod,
    conn: Connection
  ): Promise<ReturnDefault> {
    const selectIdArmario = `SELECT id_armario FROM sesmt_distribuicao WHERE id = ?`;
    const [result] = await conn.execute<ResultSetHeader>(selectIdArmario, [obj.id]);

    if (!result || result.affectedRows === 0) {
      return Promise.reject(this.rowsUndefined());
    }

    const distribuicao: iDistribuicao = result[0];
    const idArmario = distribuicao.id_armario;

    if (!distribuicao) {
      return Promise.reject(this.rowsUndefined());
    }

    const sqlIdArmario = `UPDATE sesmt_armario SET situacao = 'Livre' WHERE id = ?`;
    await conn.execute(sqlIdArmario, [idArmario]);

    return new Promise(async (resolve, reject) => {
    const sql = `UPDATE sesmt_distribuicao SET
                matricula = ?,
                nome = ?,
                status = ?,
                armario = ?,
                id_local = ?,
                genero = ?,
                id_armario = ?,
                confirmacao = ?,
                data_retirada = ?
              WHERE id = ?`;

    const objDistribuicao = [
      obj.matricula,
      obj.nome,
      obj.status,
      obj.armario,
      obj.id_local,
      obj.genero,
      obj.id_armario,
      obj.confirmacao,
      obj.data_retirada,
      obj.id
    ]

    try {
      const [result] = await conn.execute<ResultSetHeader>(sql, objDistribuicao);
      if (typeof result === "undefined") {
        return reject(this.rowsUndefined());
      }
      if (result.affectedRows <= 0) {
        consoleLog(`Distribuição não encontrada`, pVerbose.erro);
        return resolve(retornoPadrao(0, `Distribuição não encontrada`));
      }
      consoleLog(`Distribuição atualizada com sucesso!`, pVerbose.aviso);
      return resolve(
        retornoPadrao(0, `Distribuição atualizada com sucesso!`)
      );
    } catch (error) {
      return reject(error);
    }
  });
  }

  async updateSituacao(
    id_armario: string,
    conn: Connection
  ): Promise<ReturnDefault> {
    const sql =
      "UPDATE sesmt_armario set situacao = 'Em Uso' where id = ?";

    try {
      await conn.execute<ResultSetHeader>(
        sql,
        [
          id_armario,
        ]
      );

      consoleLog(`Armário atualizado com sucesso!`, pVerbose.aviso);
      return Promise.resolve(
        retornoPadrao(0, `Armário atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async devolucao(
    id: string,
    data_retirada: Date,
    confirmacao: string,
    conn: Connection
  ): Promise<ReturnDefault> {
    const sql =
      "UPDATE sesmt_distribuicao set data_retirada = ?, confirmacao = ? where id = ?";

    try {
      await conn.execute(sql,[data_retirada, confirmacao, id]);

      consoleLog(`Chave devolvida com sucesso!`, pVerbose.aviso);
      return Promise.resolve(
        retornoPadrao(0, `Chave devolvida com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateSituacaoDelete(
    id_armario: string,
    conn: Connection
  ): Promise<ReturnDefault> {
    const sql =
      "UPDATE sesmt_armario set situacao = 'Livre' where id = ?";

    try {
      await conn.execute<ResultSetHeader>(sql, [id_armario]);

      consoleLog(`Armário atualizado com sucesso!`, pVerbose.aviso);
      return Promise.resolve(
        retornoPadrao(0, `Armário atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(
    idLocal,
    conn: Connection
  ): Promise<CadDistribuicaoOut[]> {
    const sql = `SELECT dist.id,
                 dist.matricula,
                 dist.nome,
                 dist.status,
                 dist.armario,
                 dist.id_local,
                 lcl.local,
                 dist.genero,
                 dist.id_armario,
                 dist.confirmacao,
                 dist.data_retirada,
                 dist.data_devolucao
                 FROM sesmt_distribuicao dist
                 INNER JOIN sesmt_local lcl ON lcl.id = dist.id_local
                 WHERE id_local = ?
                 ORDER BY armario asc`;

    const [result] = await conn.execute<RowDataPacket[]>(sql, [idLocal]);

    const distribuicao = result;
    if (typeof distribuicao === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }

    const distribuicaoFormat = distribuicao.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
        data_devolucao: (formatObject.data_devolucao) ? convertDate2String(new Date(formatObject.data_devolucao)) : "",
        data_retirada: (formatObject.data_retirada) ? convertDate2String(new Date(formatObject.data_retirada)) : "",

      } as CadDistribuicaoOut;
    });

    return Promise.resolve(distribuicaoFormat);
  }

  async showColaborador(
    conn: Connection
  ): Promise<CadColaboradorOut[]> {
    const sql = `SELECT matricula,
                 nome_funcio,
                 desc_situacao
                 FROM sesmt_colaboradores
                 ORDER BY matricula asc`;

    const [result] = await conn.execute<RowDataPacket[]>(sql);

    const colaboradores = result;

    if (typeof colaboradores === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const colaboradores_lower = colaboradores.map((formatObject: RowDataPacket) => {
      return {
        ...formatObject,
      } as CadColaboradorOut;
    });;
    return Promise.resolve(colaboradores_lower);
  }

  async delete(id: string, conn: Connection): Promise<ReturnDefault> {
    return new Promise(async (resolve, reject) => {
      let resposta = {} as ReturnDefault;
      const sql = "DELETE FROM sesmt_distribuicao WHERE id = ?";

      try {
        const [result] = await conn.execute<ResultSetHeader>(sql, [id]);
        const deleteResult = result.affectedRows;

        if (typeof deleteResult === "undefined") {
          consoleLog(
            `Erro ao deletar distribuição, result = undefined`,
            pVerbose.erro
          );
          return reject(
            retornoPadrao(1, `Erro ao deletar distribuição, result = undefined`)
          );
        }
        if (deleteResult <= 0) {
          resposta = retornoPadrao(1, `Distribuição não foi encontrada!`);
        } else {
          resposta = retornoPadrao(0, `Distribuição deletada com sucesso!`);
        }
        consoleLog(resposta.retorno.mensagem, pVerbose.aviso);
        return resolve(resposta);
      } catch (error) {
        return reject(error);
      }
    });
  }
}
