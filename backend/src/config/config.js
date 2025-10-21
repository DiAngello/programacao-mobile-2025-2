// Carrega as variáveis do arquivo .env (ex: DB_URL)
require('dotenv').config();

// Exporta as configurações do Sequelize para cada ambiente
module.exports = {
  // Ambiente de desenvolvimento (local)
  development: {
    url: process.env.DB_URL,
    dialect: 'postgres',
  },
  // Ambiente de testes
  test: {
    url: process.env.DB_URL,
    dialect: 'postgres',
  },
  // Ambiente de produção (servidor online)
  production: {
    url: process.env.DB_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { // Configuração SSL para bancos em nuvem
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};