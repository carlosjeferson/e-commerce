<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// --- ESTADO (REATIVIDADE) ---
const cartCount = ref(0);
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const showToastNotification = ref(false);

// --- DADOS (Arrays para usar no v-for) ---
const categories = [
  { title: 'Novidades', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' },
  { title: 'Outono/Inverno', img: 'https://images.unsplash.com/photo-1550614000-4b9519e02a48?q=80&w=1000&auto=format&fit=crop' },
  { title: 'Best Sellers', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop' }
];

const products = [
  { id: 1, name: 'Vestido Midi Lavanda', price: 'R$ 189,90', img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, name: 'Blusa Seda Off-White', price: 'R$ 129,90', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, name: 'Conjunto Alfaiataria', price: 'R$ 249,90', img: 'https://images.unsplash.com/photo-1591369822096-35c938988a29?q=80&w=1000&auto=format&fit=crop' },
  { id: 4, name: 'Saia Plissada Violeta', price: 'R$ 159,90', img: 'https://images.unsplash.com/photo-1596783074918-c84cb06ce8db?q=80&w=1000&auto=format&fit=crop' } ,
  { id: 5, name: 'Vestido Midi Lavanda', price: 'R$ 189,90', img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000&auto=format&fit=crop' },
  { id: 6, name: 'Blusa Seda Off-White', price: 'R$ 129,90', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop' },
  { id: 7, name: 'Conjunto Alfaiataria', price: 'R$ 249,90', img: 'https://images.unsplash.com/photo-1591369822096-35c938988a29?q=80&w=1000&auto=format&fit=crop' },
  { id: 8, name: 'Saia Plissada Violeta', price: 'R$ 159,90', img: 'https://images.unsplash.com/photo-1596783074918-c84cb06ce8db?q=80&w=1000&auto=format&fit=crop' } ,
  { id: 9, name: 'Vestido Midi Lavanda', price: 'R$ 189,90', img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000&auto=format&fit=crop' },
  { id: 10, name: 'Blusa Seda Off-White', price: 'R$ 129,90', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop' },
  { id: 11, name: 'Conjunto Alfaiataria', price: 'R$ 249,90', img: 'https://images.unsplash.com/photo-1591369822096-35c938988a29?q=80&w=1000&auto=format&fit=crop' },
  { id: 12, name: 'Saia Plissada Violeta', price: 'R$ 159,90', img: 'https://images.unsplash.com/photo-1596783074918-c84cb06ce8db?q=80&w=1000&auto=format&fit=crop' }
];

// --- MÉTODOS ---
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const addToCart = (btnEvent) => {
  // Lógica do Carrinho
  cartCount.value++;
  
  // Lógica do Toast
  showToastNotification.value = true;
  setTimeout(() => {
    showToastNotification.value = false;
  }, 3000);

  // Feedback visual no botão (opcional, manipulando DOM diretamente é menos comum no Vue, mas funciona para efeitos rápidos)
  const btn = btnEvent.target;
  const originalText = btn.textContent;
  btn.textContent = "Adicionado!";
  btn.style.backgroundColor = "#555";
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.backgroundColor = "var(--lilac-light)"; // Volta para cor original (var css)
  }, 2000);
};

const scrollToProducts = () => {
  document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
};

// --- LIFECYCLE HOOKS ---

// Scroll Listener para o Header
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Scroll Reveal Observer
let observer = null;
onMounted(() => {
  window.addEventListener('scroll', handleScroll);

  // Configurar Intersection Observer para animações
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  const hiddenElements = document.querySelectorAll('.reveal');
  hiddenElements.forEach((el) => observer.observe(el));
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (observer) observer.disconnect();
});
</script>

<template>
  <div class="toast" :class="{ show: showToastNotification }">
    <span>🛍️</span> Produto adicionado à sacola!
  </div>

  <header :class="{ scrolled: isScrolled }">
    <div class="container">
      <nav>
        <div class="logo">LILA & CO.</div>
        
        <ul class="nav-links" :class="{ active: isMenuOpen }">
          <li><a href="#home" @click="isMenuOpen = false">Home</a></li>
          <li><a href="#colecoes" @click="isMenuOpen = false">Coleções</a></li>
          <li><a href="#produtos" @click="isMenuOpen = false">Produtos</a></li>
          <li><a href="#sobre" @click="isMenuOpen = false">Sobre</a></li>
        </ul>

        <div class="nav-icons">
          <div class="cart-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span class="cart-count">{{ cartCount }}</span>
          </div>
          
          <div class="hamburger" @click="toggleMenu" :class="{ toggle: isMenuOpen }">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <section class="hero" id="home">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Sua essência,<br><span>Sua elegância.</span></h1>
          <p>Descubra a leveza da nova coleção Outono/Inverno. Peças exclusivas com o toque de sofisticação que você merece.</p>
          <button class="btn btn-primary" @click="scrollToProducts">Ver Coleção</button>
        </div>
        <div class="hero-image">
          <div class="img-placeholder"></div>
        </div>
      </div>
    </div>
  </section>

  <section class="highlights reveal" id="colecoes">
    <div class="container">
      <h2 class="section-title">Nossas Coleções</h2>
      <p class="section-subtitle">Explore o que há de mais novo e tendência</p>
      <div class="grid-categories">
        <div v-for="(cat, index) in categories" :key="index" class="cat-card">
          <img :src="cat.img" :alt="cat.title">
          <div class="cat-overlay"><h3>{{ cat.title }}</h3></div>
        </div>
      </div>
    </div>
  </section>

  <section class="products reveal" id="produtos">
    <div class="container">
      <h2 class="section-title">Destaques da Semana</h2>
      <p class="section-subtitle">Peças selecionadas especialmente para você</p>
      <div class="product-grid">
        <div v-for="prod in products" :key="prod.id" class="product-card">
          <div class="prod-img-container">
            <img :src="prod.img" :alt="prod.name">
            <button class="add-btn" @click="addToCart">Adicionar à Sacola</button>
          </div>
          <h4>{{ prod.name }}</h4>
          <span>{{ prod.price }}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="about reveal" id="sobre">
    <div class="container">
      <div class="about-grid">
        <div class="about-img"></div>
        <div class="about-text">
          <h2>Sobre a Lila & Co.</h2>
          <p>Nascemos da paixão por moda e do desejo de trazer leveza ao dia a dia da mulher moderna. Acreditamos que se vestir bem é um ato de autocuidado.</p>
          <a href="#" class="link-about">Conheça nossa história</a>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>LILA & CO.</h4>
          <p class="footer-desc">Moda minimalista e sofisticada.</p>
        </div>
        <div class="footer-col">
          <h4>Loja</h4>
          <ul>
            <li><a href="#">Novidades</a></li>
            <li><a href="#">Roupas</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Social</h4>
          <ul>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Pinterest</a></li>
          </ul>
        </div>
      </div>
      <div class="copyright">&copy; 2025 Lila & Co. Todos os direitos reservados.</div>
    </div>
  </footer>
</template>

<style>
/* --- IMPORT DE FONTES --- */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&family=Poppins:wght@300;400;600&display=swap');

/* --- CSS GLOBAL --- */
:root {
  --lilac-light: #C7B1E6;
  --lilac-soft: #E6DDF5;
  --purple-soft: #7A4EB4;
  --white-ice: #F7F7F7;
  --gray-text: #555555;
  --black-text: #222222;
  --font-title: 'Poppins', sans-serif;
  --font-body: 'Montserrat', sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  background-color: var(--white-ice);
  color: var(--gray-text);
  line-height: 1.6;
  overflow-x: hidden;
}

a { text-decoration: none; color: inherit; transition: 0.3s; }
ul { list-style: none; }
button { border: none; background: none; cursor: pointer; }

/* --- UTILS --- */
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.btn {
  padding: 12px 35px;
  border-radius: 50px;
  font-family: var(--font-title);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-block;
}
.btn-primary {
  background-color: var(--lilac-light);
  color: #fff;
}
.btn-primary:hover {
  background-color: var(--purple-soft);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(122, 78, 180, 0.2);
}

.section-title {
  font-family: var(--font-title);
  color: var(--purple-soft);
  font-size: 2rem;
  text-align: center;
  margin-bottom: 10px;
  font-weight: 600;
}
.section-subtitle {
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 40px;
  color: #888;
}

/* --- HEADER --- */
header {
  position: fixed;
  top: 0;
  width: 100%;
  background: transparent;
  transition: all 0.4s ease;
  z-index: 1000;
  padding: 20px 0;
}
header.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0,0,0,0.05);
  padding: 15px 0;
}

nav { display: flex; justify-content: space-between; align-items: center; }
.logo {
  font-family: var(--font-title);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--purple-soft);
  letter-spacing: 2px;
}

.nav-links { display: flex; gap: 30px; }
.nav-links a {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gray-text);
  position: relative;
}
.nav-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 0;
  background-color: var(--lilac-light);
  transition: width 0.3s;
}
.nav-links a:hover { color: var(--purple-soft); }
.nav-links a:hover::after { width: 100%; }

/* Mobile Nav */
.hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; z-index: 1001; }
.bar { width: 25px; height: 3px; background-color: var(--purple-soft); transition: 0.3s; }

/* --- HERO --- */
.hero {
  height: 100vh;
  background: linear-gradient(to right, #fbfbfb 0%, #f2eff9 100%);
  display: flex;
  align-items: center;
  padding-top: 60px;
}
.hero-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.hero-text { 
  flex: 1; 
  padding-right: 50px; 
  opacity: 0; 
  transform: translateY(30px); 
  animation: fadeUp 1s forwards 0.5s; 
}
.hero-text h1 {
  font-family: var(--font-title);
  font-size: 3.5rem;
  line-height: 1.2;
  color: var(--black-text);
  margin-bottom: 20px;
}
.hero-text span { color: var(--purple-soft); }
.hero-image {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  opacity: 0; 
  transform: translateX(30px); 
  animation: fadeInRight 1s forwards 0.8s;
}
.img-placeholder {
  width: 400px;
  height: 550px;
  background-color: #ddd;
  border-radius: 200px 200px 0 0;
  background-image: url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  box-shadow: 20px 20px 0px var(--lilac-light);
  transition: transform 0.3s;
}
.img-placeholder:hover { transform: scale(1.02); }

@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInRight { to { opacity: 1; transform: translateX(0); } }

/* --- CARDS & GRID --- */
.highlights { padding: 100px 0; }
.grid-categories { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.cat-card { height: 400px; position: relative; border-radius: 10px; overflow: hidden; cursor: pointer; }
.cat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.cat-card:hover img { transform: scale(1.1); }
.cat-overlay {
  position: absolute; bottom: 0; left: 0; width: 100%;
  background: linear-gradient(to top, rgba(122,78,180,0.9), transparent);
  padding: 30px;
}
.cat-overlay h3 { color: #fff; font-family: var(--font-title); }

/* --- PRODUTOS --- */
.products { padding: 80px 0; background-color: #fff; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; }
.product-card { text-align: center; position: relative; transition: transform 0.3s; }
.product-card:hover { transform: translateY(-10px); }
.prod-img-container {
  background: var(--white-ice);
  height: 350px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  position: relative;
}
.prod-img-container img { width: 100%; height: 100%; object-fit: cover; }
.add-btn {
  position: absolute; bottom: -50px; left: 50%; transform: translateX(-50%);
  background: var(--lilac-light); /* Ajustado para variavel */
  color: white; padding: 10px 20px; border-radius: 25px;
  font-size: 0.8rem; white-space: nowrap; transition: bottom 0.3s ease;
  font-family: var(--font-title);
}
.prod-img-container:hover .add-btn { bottom: 20px; }
.product-card h4 { margin-bottom: 5px; color: var(--black-text); }
.product-card span { color: var(--purple-soft); font-weight: 600; }

/* --- ICONS & UI --- */
.nav-icons { display: flex; gap: 20px; align-items: center; color: var(--purple-soft); }
.cart-icon { position: relative; cursor: pointer; }
.cart-count {
  position: absolute; top: -8px; right: -8px;
  background-color: var(--purple-soft); color: white;
  font-size: 0.7rem; width: 18px; height: 18px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: bold;
}
.link-about { color: var(--purple-soft); font-weight: 600; border-bottom: 1px solid var(--purple-soft); }

/* --- SOBRE --- */
.about { padding: 100px 0; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
.about-img {
  width: 100%; height: 400px;
  background-image: url('https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1972&auto=format&fit=crop');
  background-size: cover; background-position: center; border-radius: 8px;
}
.about-text h2 { font-size: 2.5rem; color: var(--purple-soft); margin-bottom: 20px; }

/* --- TOAST --- */
.toast {
  position: fixed; bottom: 30px; right: -300px;
  background: var(--purple-soft); color: white;
  padding: 15px 25px; border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex; align-items: center; gap: 10px;
  transition: right 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  z-index: 2000; font-size: 0.9rem;
}
.toast.show { right: 30px; }

/* --- FOOTER --- */
footer { background-color: #fff; padding: 60px 0 20px; border-top: 1px solid #eee; }
.footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; }
.footer-desc { font-size: 0.9rem; color: #666; }
.copyright { text-align: center; color: #999; padding-top: 20px; margin-top: 40px; border-top: 1px solid #eee; font-size: 0.8rem; }

/* --- SCROLL REVEAL --- */
.reveal { opacity: 0; transform: translateY(50px); transition: all 0.8s ease; }
.reveal.active { opacity: 1; transform: translateY(0); }

/* --- RESPONSIVE --- */
@media (max-width: 768px) {
  .hamburger { display: flex; }
  
  .nav-links {
    position: fixed; top: 0; right: -100%; width: 70%; height: 100vh;
    background: white; flex-direction: column; justify-content: center; align-items: center;
    box-shadow: -5px 0 15px rgba(0,0,0,0.1); transition: 0.4s ease;
  }
  .nav-links.active { right: 0; }
  
  .hero-content { flex-direction: column-reverse; text-align: center; }
  .hero-text { padding: 0; margin-top: 30px; }
  .hero-text h1 { font-size: 2.5rem; }
  .img-placeholder { width: 100%; height: 400px; }
  
  .about-grid { grid-template-columns: 1fr; }
  .about-img { order: 2; }
}
</style>