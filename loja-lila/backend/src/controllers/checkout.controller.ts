import { Request, Response } from 'express';
import { processCheckout } from '../services/checkout.service';

export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Vem do token JWT
    const { items } = req.body; // Array de { productId, quantity }

    const order = await processCheckout(userId, items);
    
    res.status(200).json({ success: true, orderId: order.id, total: order.total });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};