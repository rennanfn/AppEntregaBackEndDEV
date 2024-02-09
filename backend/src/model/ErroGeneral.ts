import { ErroType } from "./../Interfaces/index";
import { ReturnDefault } from "../Interfaces";
import { ZodError, ZodIssue } from "zod";
import { consoleLog, pVerbose } from "../utils/consoleLog";
import { campoObrigatorio } from "./Cad_Armarios";

export class ErroGeneral extends ReturnDefault {
  retorno: { erro: ErroType; mensagem: string };

  constructor(retorno: ReturnDefault) {
    super();
    this.retorno = retorno.retorno;
  }

  static getErrorGeneral(msg: string, erro?: unknown): ReturnDefault {
    if (erro instanceof Error) {
      // Se o tipo do erro for de validação do Zod
      if (erro instanceof ZodError) {
        return this.getErrorZod(msg, erro.issues);
      }

      // Se for um erro do mysql a variável mensagemErro será undefined
      // Será impresso a mensagem padrão do usuário + msg do erro técnico
      // Irá retornar a msg amigável p/ usuário
      if (erro.name === "TypeError") {
        consoleLog(
          msg + ". Verifique a conexão com o MySQL. Erro: " + erro.message,
          pVerbose.erro
        );
        return { retorno: { erro: 1, mensagem: msg } }; // Utilizado para retornar um erro técnico para as tabaux
      }

      if (erro.message.startsWith("ORA")) {
        consoleLog(
          msg + ". Verifique o tipo de dados do objeto. Erro: " + erro.message,
          pVerbose.erro
        );
        return { retorno: { erro: 1, mensagem: msg } }; // Utilizado para retornar um erro técnico para as tabaux
      }

      // Se o erro for uma instância do returnDefault então a mensagem já foi tratada.
      if (erro instanceof ReturnDefault) {
        consoleLog(erro.retorno.mensagem, erro.retorno.erro);
        return erro;
      }

      // Se o tipo do erro não foi identificado
      consoleLog(`${msg} - Tipo do erro não identificado`, 1);
      return { retorno: { erro: 1, mensagem: msg } };
    }
    return { retorno: { erro: 1, mensagem: msg } };
  }

  private static getErrorZod(
    mensagem: string,
    issues: ZodIssue[]
  ): ReturnDefault {
    for (const erro of issues) {
      if (erro.message === campoObrigatorio) {
        consoleLog(
          "O campo " + erro.path.join(".") + " é " + erro.message,
          pVerbose.erro
        );
      } else if (erro.code === "invalid_type") {
        consoleLog(
          "O campo " + erro.path.join(".") + " deve ser " + erro.expected,
          pVerbose.erro
        );
      } else {
        consoleLog(erro.message, pVerbose.erro);
      }
    }

    return { retorno: { erro: 1, mensagem } };
  }
}
