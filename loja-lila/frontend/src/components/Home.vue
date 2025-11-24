<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue';
import api from '@/services/api';

// --- ESTADO DO MODAL DE FEEDBACK (NOVO) ---
const feedbackState = reactive({
  show: false,
  title: '',
  message: '',
  type: 'success' // 'success' | 'error' | 'warning'
});

const closeFeedback = () => {
  feedbackState.show = false;
};

const showFeedback = (title, message, type = 'success') => {
  feedbackState.title = title;
  feedbackState.message = message;
  feedbackState.type = type;
  feedbackState.show = true;
};

// --- ESTADO ---
const products = ref([]);
const cartItems = ref([]);
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const showToastNotification = ref(false);

// --- ESTADO DE AUTENTICAÇÃO (NOVO) ---
const showAuthModal = ref(false); 
const isRegisterMode = ref(false); 
const authLoading = ref(false);
const authForm = reactive({
  name: '',
  email: '',
  password: ''
});

// --- DADOS ---
const categories = [
  { title: 'Novidades', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' },
  { title: 'Outono', img: 'https://www.estilomarciabrito.com.br/wp-content/uploads/2024/02/look-outono-2024.webp' },
  { title: 'Best Sellers', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop' }
];

const toggleAuthMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  authForm.name = ''; 
  authForm.email = '';
  authForm.password = '';
};

const handleAuthSubmit = async () => {
  // Validação: Verifica se campos estão vazios
  if (!authForm.email || !authForm.password) {
    return showFeedback("Atenção", "Por favor, preencha e-mail e senha.", "warning");
  }
  
  // Validação extra: Se for cadastro, exige o nome
  if (isRegisterMode.value && !authForm.name) {
    return showFeedback("Falta o nome", "Diga-nos como você se chama.", "warning");
  }
  
  authLoading.value = true;

  try {
    if (isRegisterMode.value) {
      // --- CASO DE REGISTRO ---
      await api.post('auth/register', { ...authForm });
      
      // Feedback de sucesso
      showFeedback("Conta Criada! ✨", "Seu cadastro foi realizado. Agora faça login.", "success");
      
      // Muda automaticamente para a tela de login para facilitar
      isRegisterMode.value = false;

    } else {
      // --- CASO DE LOGIN ---
      const response = await api.post('auth/login', { 
        email: authForm.email, 
        password: authForm.password 
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Fecha o modal de login primeiro
      showAuthModal.value = false;
      
      // Mostra o feedback de boas-vindas DEPOIS de fechar o modal de login
      // (Fica visualmente mais limpo)
      setTimeout(() => {
          const userName = response.data.user.name || 'Visitante';
          showFeedback(`Bem-vindo(a), ${userName}!`, "Estamos felizes em ver você. Boas compras!", "success");
      }, 300); // Pequeno delay para transição suave
    }

  } catch (error) {
    // Feedback de erro vindo da API
    const msgErro = error.response?.data?.message || "Não foi possível realizar a operação.";
    showFeedback("Ops, houve um erro", msgErro, "error");

  } finally {
    authLoading.value = false;
  }
};

const handleCheckout = async () => {
  // Validação de sacola vazia
  if (cartItems.value.length === 0) {
    return showFeedback("Sua sacola está vazia", "Adicione peças lindas antes de finalizar a compra.", "warning");
  }
  
  // Verifica token
  const token = localStorage.getItem('token');
  if(!token) {
    showAuthModal.value = true;
    return;
  }

  try {
    await api.post('/checkout', { items: cartItems.value }, {
       headers: { Authorization: `Bearer ${token}` }
    });
    
    // Sucesso!
    showFeedback("Pedido Realizado!", "Obrigado por comprar conosco. Você receberá os detalhes por e-mail.", "success");
    cartItems.value = [];
    
  } catch (error) {
    console.error(error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        showAuthModal.value = true;
        // Aqui usamos o modal em vez do alert
        showFeedback("Sessão Expirada", "Por favor, faça login novamente para continuar.", "error");
    } else {
        showFeedback("Ops, algo deu errado", error.response?.data?.message || error.message, "error");
    }
  }
};

// --- LÓGICA ---
const cartCount = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + item.quantity, 0);
});

const formatPrice = (value) => {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Função auxiliar para fechar o menu
const closeMenu = () => {
    isMenuOpen.value = false;
};

const addToCart = (product, btnEvent) => {
  const existingItem = cartItems.value.find(item => item.productId === product.id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.value.push({ productId: product.id, quantity: 1 });
  }
  
  showToastNotification.value = true;
  setTimeout(() => { showToastNotification.value = false; }, 3000);

  if(btnEvent) {
    const btn = btnEvent.target;
    const originalText = btn.textContent;
    const originalWidth = btn.offsetWidth;
    
    btn.style.width = `${originalWidth}px`; 
    btn.textContent = "✔";
    btn.style.backgroundColor = "var(--accent)";
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.width = 'auto';
      btn.style.backgroundColor = "var(--primary)";
    }, 2000);
  }
};


const scrollToProducts = () => {
  document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

let observer = null;
onMounted(async () => {
  try {
    // Simulação caso a API não exista para teste visual
    const response = await api.get('/products');
    products.value = response.data;
  } catch (error) {
    console.warn("API offline, usando dados mockados ou vazios");
  }

  window.addEventListener('scroll', handleScroll);
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.1 });

  setTimeout(() => {
      const hiddenElements = document.querySelectorAll('.reveal');
      hiddenElements.forEach((el) => observer.observe(el));
  }, 500);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (observer) observer.disconnect();
});
</script>

<template>
  <div class="menu-overlay" :class="{ active: isMenuOpen }" @click="closeMenu"></div>

  <div class="feedback-overlay" v-if="feedbackState.show" @click.self="closeFeedback">
    <div class="feedback-card" :class="feedbackState.type">
        <div class="feedback-icon">
            <span v-if="feedbackState.type === 'success'">✨</span>
            <span v-else-if="feedbackState.type === 'error'">⚠️</span>
            <span v-else>👜</span>
        </div>
        <h3>{{ feedbackState.title }}</h3>
        <p>{{ feedbackState.message }}</p>
        <button class="btn btn-primary" @click="closeFeedback">Entendi</button>
    </div>
  </div>

  <div class="auth-overlay" v-if="showAuthModal">
    <div class="auth-card">
        <button class="close-auth" @click="showAuthModal = false">×</button>
        
        <h2>{{ isRegisterMode ? 'Criar Conta' : 'Login' }}</h2>
        <p class="auth-subtitle">{{ isRegisterMode ? 'Preencha seus dados.' : 'Entre para finalizar sua compra.' }}</p>

        <form @submit.prevent="handleAuthSubmit">
            <div class="input-group" v-if="isRegisterMode">
                <label>Nome</label>
                <input type="text" v-model="authForm.name" placeholder="Seu nome" required>
            </div>
            
            <div class="input-group">
                <label>E-mail</label>
                <input type="email" v-model="authForm.email" placeholder="seu@email.com" required>
            </div>
            
            <div class="input-group">
                <label>Senha</label>
                <input type="password" v-model="authForm.password" placeholder="******" required>
            </div>

            <button type="submit" class="btn btn-primary btn-block" :disabled="authLoading">
                {{ authLoading ? 'Processando...' : (isRegisterMode ? 'Cadastrar' : 'Entrar') }}
            </button>
        </form>

        <p class="toggle-auth">
            {{ isRegisterMode ? 'Já tem conta?' : 'Ainda não tem conta?' }}
            <a href="#" @click.prevent="toggleAuthMode">
                {{ isRegisterMode ? 'Fazer Login' : 'Cadastre-se' }}
            </a>
        </p>
    </div>
  </div>

  <div class="toast" :class="{ show: showToastNotification }">
    <div class="toast-icon">✨</div>
    <div class="toast-content">
      <strong>Sacola atualizada</strong>
      <p>Produto adicionado com amor!</p>
    </div>
  </div>

  <header :class="{ scrolled: isScrolled }">
    <div class="container header-container">
      <nav>
        <div class="logo">ANGEL<span class="dot">.</span></div>
        
        <ul class="nav-links" :class="{ active: isMenuOpen }">
          <li class="mobile-menu-header">
             <span class="mobile-title">Menu</span>
             <button class="btn-close-menu" @click="closeMenu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
          </li>
          
          <li><a href="#home" @click="closeMenu">Home</a></li>
          <li><a href="#colecoes" @click="closeMenu">Coleções</a></li>
          <li><a href="#produtos" @click="closeMenu">Shop</a></li>
          <li><a href="#sobre" @click="closeMenu">Sobre</a></li>
        </ul>

        <div class="nav-icons">
          <div class="cart-icon-wrapper" @click="handleCheckout" title="Finalizar Compra">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>
          
          <div class="hamburger" @click="toggleMenu">
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <section class="hero" id="home">
    <div class="bg-blur-1"></div>
    <div class="bg-blur-2"></div>
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <span class="tagline">Nova Coleção 2025</span>
          <h1>Sua essência,<br><em>Sua elegância.</em></h1>
          <p>Moda atemporal com um toque de leveza. Peças desenhadas para quem valoriza o conforto sem perder a sofisticação.</p>
          <button class="btn btn-primary" @click="scrollToProducts">Explorar Loja</button>
        </div>
        <div class="hero-image-wrapper">
          <div class="hero-image"></div>
          <div class="floating-card">
            <span>✨ Best Seller</span>
            <p>Vestido Lavanda</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="highlights reveal" id="colecoes">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Coleções</h2>
        <div class="divider"></div>
      </div>
      <div class="grid-categories">
        <div v-for="(cat, index) in categories" :key="index" class="cat-card">
          <img :src="cat.img" :alt="cat.title">
          <div class="cat-content">
            <h3>{{ cat.title }}</h3>
            <span class="link-arrow">Ver mais &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="products reveal" id="produtos">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Destaques</h2>
        <p class="section-subtitle">Curadoria especial da semana</p>
      </div>
      
      <div class="product-grid">
        <div v-if="products.length === 0" class="loading">Carregando peças lindas...</div>
        
        <div v-for="prod in products" :key="prod.id" class="product-card">
          <div class="card-image">
            <img :src="prod.imageUrl" :alt="prod.name">
            <div class="overlay-actions">
              <button class="btn-quick-add" @click="(e) => addToCart(prod, e)">Adicionar à Sacola</button>
            </div>
          </div>
          <div class="card-info">
            <p class="prod-cat">{{ prod.category || 'Coleção' }}</p>
            <h4>{{ prod.name }}</h4>
            <span class="price">{{ formatPrice(prod.price) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="about reveal" id="sobre">
    <div class="container">
      <div class="about-grid">
        <div class="about-visual">
          <img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1972&auto=format&fit=crop" alt="Sobre nós">
        </div>
        <div class="about-content">
          <h2>Sobre a Angel</h2>
          <p>Nascemos da paixão por moda e do desejo de trazer leveza ao dia a dia. Acreditamos que se vestir bem é, antes de tudo, um ato de amor próprio.</p>
          <div class="stats">
            <div><strong>+5k</strong><br>Clientes</div>
            <div><strong>100%</strong><br>Algodão</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <h4>ANGEL<span class="dot">.</span></h4>
          <p>Sua dose diária de estilo e conforto.</p>
        </div>
        <div class="footer-links">
          <a href="#">Shop</a>
          <a href="#">Sobre</a>
          <a href="https://wa.me/5585998540151?text=Ol%C3%A1!%20Vi%20algumas%20pe%C3%A7as%20da%20loja%20e%20adorei!%20Pode%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F" target="_blank">Contato</a>
        </div>
        <div class="footer-social">
          <a href="https://www.instagram.com/angelinaalenca_/" target="_blank">Instagram</a>
          <a href="#">Pinterest</a>
        </div>
      </div>
      <div class="copyright">
        © 2025 Angel & Jefferson. Feito com elegância.
        <br>
        <router-link to="/admin" style="font-size: 0.7rem; color: #ccc;">Acesso Restrito</router-link>
      </div>
    </div>
  </footer>
</template>

<style>
/* --- IMPORTANDO FONTES --- */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

/* --- VARIÁVEIS (PALETA DE CORES) --- */
:root {
  --primary: #C7B1E6;       /* Lilás Principal */
  --primary-hover: #BDA3F5;
  --accent: #7A4EB4;        /* Roxo Forte */
  --bg-body: #F7F7F7;       /* Branco Gelo */
  --bg-card: #FFFFFF;
  --text-main: #1A1A1A;     /* Preto Suave */
  --text-light: #777777;    /* Cinza */
  --border: #EAEAEA;
  --pastel-pink: #F3D4E5;
  --pastel-beige: #F2EDE6;
  --font-display: 'Cormorant Garamond', serif; 
  --font-body: 'Montserrat', sans-serif;
}

/* --- RESET & BASE --- */
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  background-color: var(--bg-body);
  color: var(--text-main);
  line-height: 1.7;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Personalização da barra de rolagem */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg-body); }
::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent); }

::selection { background: var(--primary); color: white; }

/* --- UTILS --- */
.container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
a { text-decoration: none; color: inherit; transition: color 0.3s ease; }
ul { list-style: none; }
button { border: none; cursor: pointer; font-family: var(--font-body); }

/* --- BOTÕES --- */
.btn {
  padding: 14px 40px;
  border-radius: 100px;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative; overflow: hidden; z-index: 1;
}
.btn-primary { background: var(--primary); color: #fff; box-shadow: 0 10px 25px -10px rgba(122, 78, 180, 0.4); }
.btn-primary::before {
  content: ''; position: absolute; top: 0; left: 0; width: 0%; height: 100%;
  background: var(--accent); transition: width 0.3s ease; z-index: -1; border-radius: 100px;
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -10px rgba(122, 78, 180, 0.5); }
.btn-primary:hover::before { width: 100%; }

/* --- HEADER --- */
header {
  position: fixed; top: 0; width: 100%; padding: 24px 0;
  z-index: 1000; transition: all 0.4s ease; background: transparent;
}
header.scrolled {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.5);
}
.header-container nav { display: flex; justify-content: space-between; align-items: center; }

.logo { font-family: var(--font-display); font-size: 1.8rem; font-weight: 600; color: var(--text-main); letter-spacing: 1px; }
.logo .dot { color: var(--accent); font-size: 2.5rem; line-height: 0; position: relative; top: 6px; }

.nav-links { display: flex; gap: 40px; }
.nav-links a { font-size: 0.9rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); position: relative; }
.nav-links a:hover { color: var(--accent); }
.nav-links a::after {
  content: ''; position: absolute; bottom: -4px; left: 50%;
  width: 0; height: 1px; background: var(--accent);
  transition: all 0.3s ease; transform: translateX(-50%);
}
.nav-links a:hover::after { width: 100%; }

/* Itens exclusivos do menu mobile */
.mobile-menu-header { display: none; }

.nav-icons { display: flex; align-items: center; gap: 20px; }
.cart-icon-wrapper { position: relative; cursor: pointer; color: var(--text-main); transition: 0.3s; }
.cart-icon-wrapper:hover { color: var(--accent); transform: scale(1.1); }
.cart-badge {
  position: absolute; top: -5px; right: -8px;
  background: var(--accent); color: white;
  font-size: 0.65rem; width: 18px; height: 18px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 600; border: 2px solid white;
}

/* OVERLAY DO MENU */
.menu-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.1);
  z-index: 1500; /* Acima do header, abaixo do menu */
  opacity: 0; visibility: hidden;
  transition: all 0.3s ease;
}
.menu-overlay.active { opacity: 1; visibility: visible; }

/* --- HERO --- */
.hero { min-height: 100vh; display: flex; align-items: center; position: relative; overflow: hidden; padding-top: 80px; }
.bg-blur-1 {
  position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw;
  background: var(--pastel-pink); filter: blur(80px); opacity: 0.5;
  border-radius: 50%; z-index: -1; animation: float 10s infinite alternate;
}
.bg-blur-2 {
  position: absolute; bottom: -10%; right: -10%; width: 40vw; height: 40vw;
  background: var(--pastel-beige); filter: blur(80px); opacity: 0.6;
  border-radius: 50%; z-index: -1; animation: float 12s infinite alternate-reverse;
}
@keyframes float { from { transform: translate(0,0); } to { transform: translate(20px, 40px); } }

.hero-content { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 60px; }
.hero-text { max-width: 500px; opacity: 0; animation: fadeUp 1s forwards 0.3s; }
.tagline { display: inline-block; font-size: 0.85rem; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; font-weight: 600; background: rgba(199, 177, 230, 0.2); padding: 5px 12px; border-radius: 20px; }
.hero-text h1 { font-family: var(--font-display); font-size: 4rem; line-height: 1.1; margin-bottom: 24px; color: var(--text-main); }
.hero-text em { font-style: italic; color: var(--primary); }
.hero-text p { color: var(--text-light); margin-bottom: 40px; font-size: 1.05rem; }

.hero-image-wrapper { position: relative; height: 600px; display: flex; justify-content: center; }
.hero-image {
  width: 90%; height: 100%;
  background-image: url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop');
  background-size: cover; background-position: center;
  border-radius: 200px 200px 0 0; box-shadow: 20px 20px 0 var(--pastel-pink);
  opacity: 0; animation: revealImage 1.2s forwards 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.floating-card {
  position: absolute; bottom: 80px; left: 0; background: rgba(255,255,255,0.9); padding: 15px 25px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); backdrop-filter: blur(5px); animation: floatCard 4s infinite ease-in-out;
}
.floating-card span { font-size: 0.75rem; color: var(--accent); font-weight: 600; text-transform: uppercase; }
.floating-card p { font-family: var(--font-display); font-size: 1.2rem; margin: 0; color: var(--text-main); }
@keyframes floatCard { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* --- SECTION HEADERS & CATEGORIAS --- */
.section-header { text-align: center; margin-bottom: 60px; }
.section-title { font-family: var(--font-display); font-size: 2.5rem; color: var(--text-main); position: relative; display: inline-block; }
.divider { width: 60px; height: 3px; background: var(--primary); margin: 15px auto 0; border-radius: 2px; }
.section-subtitle { color: var(--text-light); margin-top: 10px; font-size: 1rem; }

.highlights { padding: 100px 0; }
.grid-categories { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.cat-card { height: 450px; position: relative; border-radius: 20px; overflow: hidden; cursor: pointer; }
.cat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease; }
.cat-card:hover img { transform: scale(1.08); }
.cat-content { position: absolute; bottom: 0; left: 0; width: 100%; padding: 40px 30px; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent); color: white; transition: 0.3s; }
.cat-card h3 { font-family: var(--font-display); font-size: 2rem; margin-bottom: 5px; font-weight: 400; }
.link-arrow { font-size: 0.9rem; font-weight: 500; opacity: 0; transform: translateX(-10px); transition: 0.3s; display: inline-block; }
.cat-card:hover .link-arrow { opacity: 1; transform: translateX(0); }

/* --- PRODUTOS --- */
.products { padding: 50px 0 100px; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 40px; }
.product-card { background: var(--bg-card); border-radius: 16px; overflow: hidden; transition: all 0.4s ease; border: 1px solid transparent; }
.product-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); border-color: var(--pastel-pink); }
.card-image { position: relative; height: 320px; overflow: hidden; background: #f0f0f0; }
.card-image img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s; }
.overlay-actions { position: absolute; bottom: 0; left: 0; width: 100%; padding: 20px; background: linear-gradient(to top, rgba(255,255,255,0.9), transparent); opacity: 0; transform: translateY(20px); transition: 0.4s; display: flex; justify-content: center; }
.product-card:hover .overlay-actions { opacity: 1; transform: translateY(0); }
.btn-quick-add { background: var(--primary); color: white; padding: 10px 20px; border-radius: 50px; font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 15px rgba(199, 177, 230, 0.6); transition: 0.3s; }
.btn-quick-add:hover { background: var(--accent); transform: scale(1.05); }
.card-info { padding: 20px; text-align: center; }
.prod-cat { font-size: 0.75rem; text-transform: uppercase; color: var(--text-light); letter-spacing: 1px; margin-bottom: 5px; }
.card-info h4 { font-size: 1.1rem; margin-bottom: 8px; font-weight: 500; color: var(--text-main); }
.price { color: var(--accent); font-weight: 600; font-size: 1.1rem; }

/* --- SOBRE & FOOTER --- */
.about { padding: 80px 0; background: var(--pastel-beige); position: relative; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 80px; }
.about-visual img { width: 100%; border-radius: 12px; box-shadow: 20px 20px 0 white; }
.about-content h2 { font-family: var(--font-display); font-size: 3rem; margin-bottom: 20px; color: var(--accent); }
.about-content p { color: var(--text-light); margin-bottom: 30px; font-size: 1.1rem; }
.stats { display: flex; gap: 40px; }
.stats strong { font-size: 2rem; color: var(--primary); font-family: var(--font-display); }

footer { background: white; padding: 80px 0 30px; border-top: 1px solid var(--border); }
.footer-content { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 40px; margin-bottom: 50px; }
.footer-brand h4 { font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 10px; }
.footer-brand .dot { color: var(--primary); }
.footer-links, .footer-social { display: flex; flex-direction: column; gap: 10px; }
.footer-links a, .footer-social a { color: var(--text-light); font-size: 0.95rem; }
.footer-links a:hover, .footer-social a:hover { color: var(--accent); padding-left: 5px; }
.copyright { text-align: center; color: #999; font-size: 0.8rem; border-top: 1px solid #f0f0f0; padding-top: 20px; }

/* --- TOAST --- */
.toast {
  position: fixed; bottom: 30px; right: -400px;
  background: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 10px 40px rgba(122, 78, 180, 0.15); display: flex; align-items: center; gap: 15px; transition: cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s; z-index: 2000; border-left: 4px solid var(--primary);
}
.toast.show { right: 30px; }
.toast-icon { font-size: 1.5rem; }
.toast-content strong { display: block; font-size: 0.9rem; color: var(--accent); }
.toast-content p { font-size: 0.8rem; color: var(--text-light); margin: 0; }

.reveal { opacity: 0; transform: translateY(40px); transition: all 1s ease; }
.reveal.active { opacity: 1; transform: translateY(0); }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
@keyframes revealImage { to { opacity: 1; } }

/* --- MODAL DE FEEDBACK --- */
.feedback-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
    z-index: 4000; /* O mais alto de todos */
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

.feedback-card {
    background: white;
    width: 100%; max-width: 350px;
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-top: 5px solid var(--primary);
}

/* Variações de cor baseadas no tipo */
.feedback-card.error { border-color: #ff6b6b; }
.feedback-card.warning { border-color: #feca57; }
.feedback-card.success { border-color: var(--accent); }

.feedback-icon {
    font-size: 3rem; margin-bottom: 15px; display: block;
    animation: bounce 1s infinite alternate;
}

.feedback-card h3 {
    font-family: var(--font-display);
    font-size: 1.8rem; color: var(--text-main); margin-bottom: 10px;
}

.feedback-card p {
    color: var(--text-light); font-size: 0.95rem; margin-bottom: 25px; line-height: 1.5;
}

.feedback-card button { width: 100%; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { 
    from { opacity: 0; transform: scale(0.8) translateY(20px); } 
    to { opacity: 1; transform: scale(1) translateY(0); } 
}
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }

/* ESTILOS DO MODAL DE AUTH */
.auth-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
    z-index: 3000;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
}
.auth-card {
    background: white;
    width: 100%; max-width: 400px;
    padding: 40px;
    border-radius: 20px;
    position: relative;
    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
    animation: fadeUp 0.4s ease;
}
.close-auth {
    position: absolute; top: 15px; right: 15px;
    background: transparent; font-size: 1.5rem; color: var(--text-light);
}
.auth-card h2 {
    font-family: var(--font-display);
    font-size: 2rem; color: var(--accent);
    margin-bottom: 10px; text-align: center;
}
.auth-subtitle {
    text-align: center; color: var(--text-light); margin-bottom: 30px; font-size: 0.9rem;
}
.input-group { margin-bottom: 20px; }
.input-group label {
    display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 5px;
}
.input-group input {
    width: 100%; padding: 12px;
    border: 1px solid var(--border); border-radius: 8px;
    font-family: var(--font-body); font-size: 1rem;
    transition: 0.3s;
}
.input-group input:focus {
    border-color: var(--primary); outline: none;
    box-shadow: 0 0 0 3px rgba(199, 177, 230, 0.2);
}
.btn-block { width: 100%; margin-top: 10px; }
.toggle-auth {
    text-align: center; margin-top: 20px; font-size: 0.85rem; color: var(--text-light);
}
.toggle-auth a { color: var(--accent); font-weight: 600; text-decoration: underline; }


/* --- RESPONSIVO --- */
@media (max-width: 900px) {
  .hero-content { grid-template-columns: 1fr; text-align: center; }
  .hero-text { margin: 0 auto; }
  .hero-text h1 { font-size: 3rem; }
  .hero-image-wrapper { height: 400px; margin-top: 40px; }
  .grid-categories { grid-template-columns: 1fr; }
  .about-grid { grid-template-columns: 1fr; }
  
  .hamburger { display: block; cursor: pointer; }
  .bar { width: 25px; height: 2px; background: var(--text-main); margin: 5px 0; transition: 0.3s; }
  
  /* MENU MOBILE ATUALIZADO */
  .nav-links {
    position: fixed; top: 0; right: -100%; 
    width: 80%; max-width: 300px;
    height: 100vh;
    background: white; 
    flex-direction: column; 
    justify-content: flex-start; /* Alinha itens ao topo */
    align-items: stretch; /* Estica a largura */
    box-shadow: -10px 0 30px rgba(0,0,0,0.1); 
    transition: 0.4s cubic-bezier(0.77, 0, 0.175, 1);
    z-index: 2000; /* IMPORTANTE: Acima de tudo */
    padding: 30px;
    gap: 20px;
  }
  
  .nav-links.active { right: 0; }
  
  /* Estilo dos itens no mobile */
  .nav-links li:not(.mobile-menu-header) {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 15px;
  }
  .nav-links a {
    font-size: 1.1rem;
    display: block;
    color: var(--text-main);
  }

  /* Cabeçalho exclusivo do mobile */
  .mobile-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--pastel-pink);
  }
  .mobile-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--accent);
    font-weight: 600;
  }
  .btn-close-menu {
    background: none;
    color: var(--text-main);
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s;
  }
  .btn-close-menu:hover {
    color: var(--accent);
    transform: rotate(90deg);
  }
}
</style>