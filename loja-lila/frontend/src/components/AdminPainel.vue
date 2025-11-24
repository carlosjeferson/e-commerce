<script setup>
import { ref } from 'vue';
import api from '../services/api';

const form = ref({
  name: '',
  price: '',
  imageUrl: '',
  description: '',
  stock: 10,
  category: 'Geral'
});

const createProduct = async () => {
  try {
    // IMPORTANTE: Aqui você precisaria estar logado como ADMIN e ter o token
    // Por enquanto, para testar, você pode remover o middleware "isAdmin" 
    // lá no backend (arquivo routes/product.routes.ts) temporariamente.
    const token = localStorage.getItem('token'); 
    
    // ... dentro de createProduct ...

    // O axios já tem 'http://localhost:3000/api' configurado.
    // Então chamamos apenas '/products'
    await api.post('/products', { 
    ...form.value,
    price: parseFloat(form.value.price) 
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    alert('Produto criado!');
    // Limpar form
    form.value = { name: '', price: '', imageUrl: '', description: '', stock: 10, category: 'Geral' };
  } catch (error) {
    alert('Erro: ' + (error.response?.data?.message || error.message));
  }
};
</script>

<template>
  <div class="admin-container">
    <h2>Adicionar Produto</h2>
    <form @submit.prevent="createProduct">
      <input v-model="form.name" placeholder="Nome do Produto" required />
      <input v-model="form.price" type="number" step="0.01" placeholder="Preço (ex: 49.90)" required />
      <input v-model="form.imageUrl" placeholder="URL da Imagem" required />
      <textarea v-model="form.description" placeholder="Descrição"></textarea>
      <button type="submit">Cadastrar</button>
    </form>
  </div>
</template>

<style scoped>
.admin-container { max-width: 500px; margin: 100px auto; padding: 20px; background: white; }
input, textarea { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; }
button { background: #7A4EB4; color: white; padding: 10px; width: 100%; }
</style>