import { ErroType, ReturnDefault } from '../Interfaces';

export default function retornoPadrao(
  erro: ErroType,
  // eslint-disable-next-line prettier/prettier
  mensagem: string,
): ReturnDefault {
  return {
    retorno: {
      erro,
      mensagem,
    },
  } as ReturnDefault;
}
