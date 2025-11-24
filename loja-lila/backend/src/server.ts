import app from './app';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

const PORT = process.env.PORT || 3000;

// Aqui é o segredo: app.listen mantem o processo rodando
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`👉 Acesse: http://localhost:${PORT}`);
});