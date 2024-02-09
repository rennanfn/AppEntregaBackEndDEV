type tipo = "insert" | "update";

export default function createSqlCampos<T>(
  obj: T,
  tabela: string,
  tipo_sql: tipo,
  condicao: string
): string {
  let itensInsert = "";
  let itensInsertVal = "";
  let itensUpdate = "";
  let sql;

  Object.keys(obj as object).forEach((key) => {
    itensInsert += `${key}, `;
    itensInsertVal += `:${key}, `;
    itensUpdate += `${key}= :${key}, `;
  });

  if (tipo_sql === "insert")
    sql = `insert into ${tabela}(${itensInsert.replace(
      /,\s*$/,
      ""
    )}) values(${itensInsertVal.replace(/,\s*$/, "")}) ${condicao}`;
  else
    sql = `update ${tabela} set ${itensUpdate.replace(
      /,\s*$/,
      ""
    )} ${condicao} `;

  return sql;
}
