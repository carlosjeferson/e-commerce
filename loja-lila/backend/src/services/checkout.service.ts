import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CartItem {
  productId: number;
  quantity: number;
}

export const processCheckout = async (userId: number, items: CartItem[]) => {
  // Transação garante que tudo funciona ou nada muda (segurança de dados)
  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    // 1. Validar estoque e calcular preços
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });

      if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
      if (product.stock < item.quantity) throw new Error(`Estoque insuficiente para ${product.name}`);

      totalAmount += Number(product.price) * item.quantity;

      // 2. Deduzir estoque
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: product.stock - item.quantity }
      });
    }

    // 3. Criar o pedido
    const order = await tx.order.create({
      data: {
        userId,
        total: totalAmount,
        status: 'PAID', // Em produção, isso viria após confirmação do Stripe/Gateway
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: 0 // Em um app real, busque o preço do produto novamente aqui
          }))
        }
      },
      include: { items: true }
    });

    return order;
  });
};