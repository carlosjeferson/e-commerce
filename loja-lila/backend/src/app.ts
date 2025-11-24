import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes';
import checkoutRoutes from './routes/checkout.routes';

const app = express();

app.use(cors()); // Permite que seu frontend acesse a API
app.use(express.json());

// Rotas
app.get('/', (req, res) => {
  res.send('API da Loja está funcionando! 🚀');
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/checkout', checkoutRoutes);

export default app;