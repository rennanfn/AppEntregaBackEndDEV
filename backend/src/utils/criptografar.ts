import bcrypt from "bcrypt";

import retornoPadrao from "./retornoPadrao";

export default abstract class Criptografar {
  /**
   * Criptografa a senha informada pelo usuário
   * @param senha Senha informada
   */
  static criptografarSenha(senha: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`Criptografando senha...`, 0);
      bcrypt
        .hash(senha, 10) // env.security.saltRounds
        .then((hash) => {
          console.log(`Senha criptografada com sucesso.`, 0);
          return resolve(hash);
        })
        .catch((erro) => {
          console.log(`Erro ao criptografar senha - ${erro.message}`, 1);
          return reject(retornoPadrao(1, `Erro ao criptografar senha`));
        });
    });
  }

  /**
   * Compara a senha informada com a senha criptografada
   * @param senhaUsuario Senha informada
   * @param senhaBD Senha criptografada
   */
  static compararSenhas(senhaUsuario: string, senhaBD: string): boolean {
    console.log(`Comparando senhas...`, 0);
    if (bcrypt.compareSync(senhaUsuario, senhaBD)) {
      console.log(`Senhas conferem.`, 0);
      return true;
    }
    console.log(`Senhas não conferem.`, 1);
    return false;
  }
}
