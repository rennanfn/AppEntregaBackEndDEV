import { Connection } from 'oracledb';

export interface iColaboradorInfo {
  matricula: number;
  nome_funcio: string;
  data_admissao: string;
  data_nascto: string;
  situacao: string;
  desc_situacao: string;
}

export interface iColaborador {
  matricula: number;
  nome_funcio: string;
  data_nascto: string;
  desc_sexo: string;
  internoouexterno: string;
  desc_situacao: string;
  data_admissao: string;
}

export interface iDataNascto {
  data_nascto: string;
}

export abstract class CadColaborador {
  /**
   * Busca os dados do colaborador
   * @param matricula matricula do colaborador
   * @param conn conexão com o BD
   * @returns iColaboradorInfo se encontrar ou undefined se não encontrar;
   */
  abstract getDadosColaborador(
    matricula: number,
    conn: Connection,
  ): Promise<iColaboradorInfo>;

  /**
   * Retorna true se for o mês de aniversário do colaborador ou false.
   * @param matricula Matricula do colaborador
   * @param conn Conexão com o BD
   */
  abstract MesAniversarioColaborador(
    matricula: number,
    conn: Connection,
  ): Promise<boolean>;
}
