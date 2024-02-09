export enum pVerbose {
  "erro" = 0,
  "aviso" = 1,
}

export function consoleLog(msg: string | unknown, verbose: pVerbose): void {
  const verboseEnv = Number(process.env.VERBOSE);

  if (verboseEnv === pVerbose.aviso) {
    switch (verbose) {
      case pVerbose.aviso:
        console.info(msg, verbose);
        break;
      case pVerbose.erro:
        console.error(msg, verbose);
        break;
      default:
        console.log(msg, verbose);
        break;
    }
  }

  if (verboseEnv === pVerbose.erro && verbose === pVerbose.erro) {
    switch (verbose) {
      case pVerbose.erro:
        console.error(msg);
        break;
      default:
        console.log(msg);
        break;
    }
  }
}
