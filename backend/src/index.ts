import express from "express";
import cors, { CorsOptions } from "cors";
import dbconfig from "./DB/dbconfig";
import { routes } from "./routes/index";
import { consoleLog, pVerbose } from "./utils/consoleLog";
import { requireOrigin } from "./utils/RequireOrigins";
import { Ipware } from "@fullerstack/nax-ipware";
import { MySqlConnection } from "./model/MySqlConnection";
import { createPool } from 'mysql2/promise';

// URLS liberadas para acessarem a api, devem ser separadas por ;
const origensPermitidas = process.env.CORS_URL_PERMITIDAS_ARMARIO || "";

const expressPort = Number(process.env.PORTAEXPRESS);

if (!expressPort) {
  consoleLog("Falta variável de ambiente PORTAEXPRESS", pVerbose.erro);
  process.exit(1);
}

const corsOptions: CorsOptions = {
  origin: origensPermitidas.split(";"),
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

async function init() {
  try {
    console.log("Aguarde, criando pool", pVerbose.aviso);
    MySqlConnection.pool = createPool(dbconfig);
    console.log("Pool MySQL Criado", pVerbose.aviso);
  } catch (error) {
    console.log(`Erro ao iniciar pool do MySQL ${error}`, pVerbose.erro);
  }
}

const ipware = new Ipware();
const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
// Adiciona o IP do cliente nas requisições;
app.use((req, res, next) => {
  const ipInfo = ipware.getClientIP(req);
  if (ipInfo !== null) {
    req.userIp = {
      ip: ipInfo.ip,
      isPublic: ipInfo.isPublic,
    };
  }
  next();
});
app.use(requireOrigin);

app.use(routes);

if (process.env.NODE_ENV === "DEV") {
  app.listen(expressPort, () => {
    init();
  });
}
