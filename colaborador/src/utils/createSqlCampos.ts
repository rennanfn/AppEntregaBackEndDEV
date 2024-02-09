type tipo = 'insert' | 'update';

export default function createSqlCampos<T>(
  obj: T,
  tabela: string,
  // eslint-disable-next-line camelcase
  tipo_sql: tipo,
  condicao: string,
): string {
  let itensInsert = '';
  let itensInsertVal = '';
  let itensUpdate = '';
  let sql;

  Object.keys(obj as object).forEach((key) => {
    itensInsert += `${key}, `;
    itensInsertVal += `:${key}, `;
    itensUpdate += `${key}= :${key}, `;
  });

  // eslint-disable-next-line camelcase
  if (tipo_sql === 'insert')
    sql = `insert into ${tabela}(${itensInsert.replace(
      /,\s*$/,
      // eslint-disable-next-line prettier/prettier
      '',
    )}) values(${itensInsertVal.replace(/,\s*$/, '')}) ${condicao}`;
  else
    sql = `update ${tabela} set ${itensUpdate.replace(
      /,\s*$/,
      // eslint-disable-next-line prettier/prettier
      '',
    )} ${condicao} `;

  return sql;
}
