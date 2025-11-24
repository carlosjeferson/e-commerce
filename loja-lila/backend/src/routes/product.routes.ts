import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Rota pública (qualquer um vê os produtos)
router.get('/', getProducts);

// Rotas protegidas (apenas Admin pode criar/editar/deletar)
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

export default router;