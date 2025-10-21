'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {}; // Objeto que armazenará os models.

let sequelize;
// Cria a instância de conexão do Sequelize usando a URL do .env.
if (config.url) {
  sequelize = new Sequelize(config.url, config);
} else {
  // Fallback para caso a URL não esteja definida.
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Lê todos os arquivos do diretório atual (models/).
fs
  .readdirSync(__dirname)
  // Filtra os arquivos (ignora o index.js, arquivos não-.js, etc.).
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  // Importa e inicializa cada arquivo de model.
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model; // Adiciona o model ao objeto 'db' (ex: db.User).
  });

// Executa as associações (relações) entre os models (ex: User.hasMany).
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Disponibiliza a conexão (sequelize) e a classe (Sequelize) no objeto 'db'.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Exporta o 'db' (que contém todos os models e a conexão).
module.exports = db;