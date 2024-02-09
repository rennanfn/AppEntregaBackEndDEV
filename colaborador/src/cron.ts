/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import * as cron from 'node-cron';
import ColaboradorController from './controller/Cad_Colaborador_Controller';
import { pVerbose } from './utils/consoleLog';

export function configureCronJobs() {
  // Agenda a tarefa todos os dias às 23h, irá gerar token aos novos funcionários caso existir.
  cron.schedule('45 17 * * *', verificaColaborador);
}

async function verificaColaborador() {
  const dataAtual = new Date();
  try {
    const responseMock: any = {
      status: () => responseMock,
      json: (data: any) => {
        console.log(data)
        return responseMock
      },
    }
    // Simulando uma requisição POST para atualizar a data
    console.log('Cron verificaColaborador inicializada em: ', dataAtual.toLocaleString(), pVerbose.aviso);
    await ColaboradorController.showColaborador(undefined!, responseMock)

  } catch (error) {
    console.error('Erro ao solicitar dados:', error)
  }
}

