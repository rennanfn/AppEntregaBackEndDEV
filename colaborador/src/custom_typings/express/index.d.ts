/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace Express {
  interface Request {
    customProperties: {
      login: string;
      id: string;
      token_data?: any;
    };
    clientIpInfo?: {
      ip: string;
      isPublic: boolean;
    };
  }
}
