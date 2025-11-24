import { createRouter, createWebHistory } from 'vue-router'
import AdminPainel from '@/components/AdminPainel.vue'
import Home from '@/components/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPainel,
      // 1. ADICIONE ESTA LINHA (Etiqueta de segurança)
      meta: { requiresAdmin: true } 
    }
  ]
})

// 2. ADICIONE ESTE BLOCO DE SEGURANÇA (Navigation Guard)
router.beforeEach((to, from, next) => {
  // Verifica se a rota para onde estamos indo exige ser Admin
  if (to.meta.requiresAdmin) {
    
    // Pega os dados salvos no navegador
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Lógica de verificação
    if (!token || !user) {
      // Se não tem token ou usuário, manda para Home e avisa
      alert("Acesso restrito. Faça login primeiro.");
      next('/'); 
    } else if (user.role !== 'ADMIN') {
      // Se tem login mas NÃO é Admin, manda para Home e avisa
      alert("Acesso negado. Apenas administradores.");
      next('/');
    } else {
      // Se tiver token E for ADMIN, deixa passar
      next();
    }

  } else {
    // Se a rota não exige proteção (tipo a Home), deixa passar direto
    next();
  }
});

export default router