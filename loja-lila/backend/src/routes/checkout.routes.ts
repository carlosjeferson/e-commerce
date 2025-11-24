import { Router } from 'express';
import { checkout } from '../controllers/checkout.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Apenas usuários logados podem fazer checkout
router.post('/', verifyToken, checkout);

export default router;