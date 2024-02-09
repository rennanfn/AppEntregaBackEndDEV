export default {
  host: process.env.DB_DEV_HOST_ARMARIO_MYSQL, // Endereço do servidor do MySQL
  user: process.env.DB_DEV_USER_NAME_ARMARIO_MYSQL, // Nome de usuário do MySQL
  password: process.env.DB_DEV_USER_PASSWORD_ARMARIO_MYSQL, // Senha do MySQL
  database: process.env.DB_DEV_CONNECT_DESCRIPTOR_ARMARIO_MYSQL, // Nome do banco de dados MySQL
  waitForConnections: true, // Aguardar por conexões quando o pool estiver esgotado
  connectionLimit: 120, // Limite máximo de conexões no pool
};
