import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

export const createProduct = async (req: Request, res: Response) => {
  // Lógica para adicionar produto (Admin)
  try {
    const { name, description, price, imageUrl, stock, category } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price, imageUrl, stock, category }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  // Editar produto
  const { id } = req.params;
  const data = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  // Excluir produto
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};