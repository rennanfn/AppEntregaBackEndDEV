declare namespace Express {
  // Token_data esta como tipo any pois não tem como importar o tipo correto em arquivos
  // declare namespace... o tipo correto seria o Token.
  interface Request {
    customProperties: {
      login: string;
      id: string;
      token_data?: any;
    };
    userIp?: {
      ip: string;
      isPublic: boolean;
    };
  }
}
