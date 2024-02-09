/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Ipware } from '@fullerstack/nax-ipware';
import cors from 'cors';
import express from 'express';
import { createPool } from 'mysql2/promise';
import oracledb from 'oracledb';
import dbconfig from './DB/dbconfig';
import dbconfigMySql from './DB/dbconfigMySql';
import { MySqlConnection } from './modelDB/MySqlConnection';
import routes from './routes';
import { consoleLog, pVerbose } from './utils/consoleLog';
import { configureCronJobs } from './cron';

// URLS liberadas para acessarem a api, devem ser separadas por ;
// const origensPermitidas = process.env.CORS_URL_PERMITIDAS_ENTREGA || '';

const expressPort = Number(process.env.PORTAEXPRESS);

if (!expressPort) {
  consoleLog('Falta variável de ambiente PORTAEXPRESS', pVerbose.erro);
  process.exit(1);
}

// const corsOptions: CorsOptions = {
//   origin: origensPermitidas.split(';'),
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

async function init() {
  try {
    console.log('Aguarde, criando conexão com MySQL ...', pVerbose.aviso);
    MySqlConnection.pool = createPool(dbconfigMySql);
    console.log('Conexão MySQL Criada', pVerbose.aviso);

    console.log('Aguarde, criando conexão Oracle ...', pVerbose.aviso);
    await oracledb.createPool(dbconfig);
    console.log('Conexão Oracle Criada', pVerbose.aviso);

    configureCronJobs();
  } catch (error) {
    console.log(`Erro ao iniciar pool do Oracle ${error}`, pVerbose.erro);
  }
}
const ipware = new Ipware();
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
// Adiciona o IP do cliente nas requisições;
app.use((req, res, next) => {
  const ipInfo = ipware.getClientIP(req);
  if (ipInfo !== null) {
    req.clientIpInfo = {
      ip: ipInfo.ip,
      isPublic: ipInfo.isPublic,
    };
  }
  next();
});
// app.use(requireOrigin);
app.use(routes);

if (process.env.NODE_ENV === 'DEV') {
  app.listen(expressPort, () => {
    consoleLog(`Server iniciado na porta ${expressPort}`, pVerbose.aviso);
    init();
  });
}
