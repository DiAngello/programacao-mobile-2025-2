require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const libraryRoutes = require('./routes/libraryRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/library', libraryRoutes);

// Rota de "Health Check"
app.get('/', (req, res) => {
  res.json({ status: 'API está funcionando!', timestamp: new Date() });
});

// Middleware de tratamento de erro 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Algo deu errado no servidor!' });
});

const PORT = process.env.PORT || 3001;

// Inicialização do servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
});