import { sign, verify } from 'jsonwebtoken';
import { consoleLog, pVerbose } from './consoleLog';

export interface iQrCodePayload {
  matricula: number;
  seq: number;
  emissao: Date | undefined;
}

export class QrCode {
  /**
   * Gera um novo QrCode
   * @param matricula Matricula do colaborador
   * @param sequencia sequencial do QrCode, utilizado para substituir o token antigo
   * @returns retorna um token JWT que é a representação em string do QrCode
   */
  static gerarQRcode(
    matricula: number,
    sequencia: number,
    QrCodeSecret: string,
  ): string {
    const values = {
      sub: matricula,
      seq: sequencia,
    };

    const token = sign(values, QrCodeSecret);
    return token;
  }

  static getQrCodeSecret(): string | undefined {
    return process.env.QRCODE_SECRET;
  }

  /**
   * Verifica se o QrCode é valido
   * @param QrCode Token QrCode do colaborador
   * @returns Retorna true se for válido ou false se for inválido
   */
  static validaQrCode(QrCode: string, QrCodeSecret: string): boolean {
    try {
      verify(QrCode, QrCodeSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Pega o conteúdo do QrCode
   * @param QrCode QrCode (token)
   * @returns retorna o conteúdo do token ou undefined se o token for inválido
   */
  static getQrCodePayload(QrCode: string): iQrCodePayload | undefined {
    try {
      // Key para gerar os QrCode
      const qrCodeSecret = this.getQrCodeSecret();
      if (!qrCodeSecret) {
        consoleLog(
          `Falta informar o secret utilizado para gerar o QrCode dos colaboradores`,
          pVerbose.erro,
        );
        return undefined;
      }

      if (!this.validaQrCode(QrCode, qrCodeSecret)) {
        consoleLog(`QrCode inválido`, pVerbose.erro);
        return undefined;
      }

      const payload = verify(QrCode, qrCodeSecret);
      // O payload correto é do tipo JwtPayload não string
      if (typeof payload === 'string') {
        return undefined;
      }
      // O sub é obrigatório ser a matrícula
      if (!payload.sub) {
        return undefined;
      }
      const token: iQrCodePayload = {
        matricula: Number(payload.sub),
        seq: payload.seq,
        emissao: payload.iat ? new Date(payload.iat) : undefined,
      };
      return token;
    } catch (error) {
      consoleLog(error, pVerbose.erro);
      return undefined;
    }
  }
}
