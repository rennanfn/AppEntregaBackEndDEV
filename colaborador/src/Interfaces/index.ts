export type ErroType = 0 | 1;

export interface ReturnDefaultInt {
  retorno: {
    erro: ErroType;
    mensagem: string;
  };
}

export abstract class ReturnDefault implements ReturnDefaultInt {
  retorno!: { erro: ErroType; mensagem: string };
}

export interface Token {
  id: string;
  nome: string;
  login: string;
}

export interface TokenColaborador {
  matricula: number;
  token: string;
  sequencial: number;
}
