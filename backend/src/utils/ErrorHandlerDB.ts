/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */

import { ReturnDefault } from "../Interfaces";

/* eslint-disable no-useless-constructor */
export class ErrorHandlerDB {
  private _retorno: ReturnDefault;

  constructor(mensagem: string) {
    this._retorno = { retorno: { erro: 1, mensagem } };
  }

  getRetorno(): ReturnDefault {
    return this._retorno;
  }

  // Código implementado para atender os erros qua ainda possuem a propriedade error.message
  get message(): string {
    return this._retorno.retorno.mensagem;
  }
}
