import { ReturnDefault, ErroType } from '../Interfaces';
// Funcao para montar o retorno da atualização das tabelas aux.
export default function returnoPadrao(
  erro: ErroType,
  mensagem: string,
): ReturnDefault {
  return {
    retorno: {
      erro,
      mensagem,
    },
  } as ReturnDefault;
}
