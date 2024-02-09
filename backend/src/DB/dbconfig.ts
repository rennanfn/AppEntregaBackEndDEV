export default {
  host: process.env.DB_DEV_HOST_ARMARIO, // Endereço do servidor do MySQL
  user: process.env.DB_DEV_USER_NAME_ARMARIO, // Nome de usuário do MySQL
  password: process.env.DB_DEV_USER_PASSWORD_ARMARIO, // Senha do MySQL
  database: process.env.DB_DEV_CONNECT_DESCRIPTOR_ARMARIO, // Nome do banco de dados MySQL
  waitForConnections: true, // Aguardar por conexões quando o pool estiver esgotado
  connectionLimit: 120, // Limite máximo de conexões no pool
};
