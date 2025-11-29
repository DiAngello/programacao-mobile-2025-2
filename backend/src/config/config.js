// Carrega as variáveis do arquivo .env (ex: DB_URL)
require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DB_URL,
    dialect: 'postgres',
  },
  
  test: {
    url: process.env.DB_URL,
    dialect: 'postgres',
  },
  production: {
    url: process.env.DB_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { 
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};