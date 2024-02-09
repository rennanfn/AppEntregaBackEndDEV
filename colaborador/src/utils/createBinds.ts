import oracledb from 'oracledb';

export default abstract class CreateBinds {
  /**
   * Retorna os tipos do oracle.
   */
  static tiposOracle(tipo: string): number {
    switch (tipo.toUpperCase()) {
      case 'STRING': {
        return oracledb.STRING;
      }
      case 'NUMBER': {
        return oracledb.NUMBER;
      }
      default: {
        return oracledb.STRING;
      }
    }
  }

  /**
   * Cria os binds do Oracle de forma dinâmica utilizando as propriedades
   * recebidas pelo param obj.
   * @param obj Objeto do tipo { chave: valor } com os dados que serão enviados para o Oracle.
   */
  static createBinds<T>(obj: T): Record<string, oracledb.BindParameter> {
    const generic = {} as any;
    Object.keys(obj as object).forEach((key) => {
      generic[key] = {
        val: obj[key as keyof T],
        type: this.tiposOracle(typeof obj[key as keyof T]),
      };
    });
    return generic;
  }

  /**
   * Monta a expressão WHERE IN (xxx) esperada pelo oracledb.
   * docs: https://oracle.github.io/node-oracledb/doc/api.html#sqlwherein
   * @param params Array com os dados que irão dentro da clausula in.
   * @returns String com o formato esperado pelo oracle.
   */
  static bindsWhereInClause(params: any[]): string {
    // No oracledb quando vamos utilizar a expressão WHERE xxx IN ( )
    // é necessário que entre os parenteses tenha um bind para cada posição do array
    let texto = '(';
    params.forEach((param, index) => {
      texto += `:P${index}`;
      if (index < params.length - 1) texto += ', ';
    });
    texto += ')';
    return texto;
  }
}
