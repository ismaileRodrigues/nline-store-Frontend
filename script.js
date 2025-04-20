// Variáveis globais let products = []; let categories = []; const cart = []; let total = 0; let currentPage = 1; const productsPerPage = 20; let searchQuery = ''; let minPrice = 0; let maxPrice = Infinity;

// Ao carregar a página document.addEventListener('DOMContentLoaded', async () => { showLoading(); try { const response = await fetch('https://online-store-backend-vw45.onrender.com/api/store-status'); const data = await response.json();

if (data.status === 'closed') {
        document.body.innerHTML = '<h1>Loja Fechada</h1><p>Fale conosco: <a href="https://api.whatsapp.com/send?phone=5541998642005" target="_blank" class="text-white mx-2"><i class="fab fa-whatsapp fa-2x"></i></a></p>';
    } else {
        await Promise.all([loadCategories(), loadProducts(currentPage)]);
        renderCategoryNav();
        renderProducts();
        updateTotal();
        updateCartCount();
    }
} catch (error) {
    console.error('Erro ao verificar o estado da loja:', error);
} finally {
    hideLoading();
}

});

function showLoading() { const loadingElement = document.getElementById('loading'); if (loadingElement) loadingElement.style.display = 'flex'; }

function hideLoading() { const loadingElement = document.getElementById('loading'); if (loadingElement) loadingElement.style.display = 'none'; }

async function loadCategories() { const cached = localStorage.getItem('categories'); const cachedTime = localStorage.getItem('categoriesTimestamp'); const now = Date.now(); if (cached && cachedTime && now - cachedTime < 3600000) { categories = JSON.parse(cached); return; } try { const res = await fetch('https://online-store-backend-vw45.onrender.com/api/categories'); categories = await res.json(); localStorage.setItem('categories', JSON.stringify(categories)); localStorage.setItem('categoriesTimestamp', now); } catch (error) { console.error('Erro ao carregar categorias:', error); } }

async function loadProducts(page = 1) { currentPage = page; const cached = localStorage.getItem(products_page_${page}); const cachedTime = localStorage.getItem(productsTimestamp_page_${page}); const now = Date.now(); if (cached && cachedTime && now - cachedTime < 3600000) { products = JSON.parse(cached); return; } try { const res = await fetch(https://online-store-backend-vw45.onrender.com/api/products?page=${page}&limit=${productsPerPage}); products = await res.json(); localStorage.setItem(products_page_${page}, JSON.stringify(products)); localStorage.setItem(productsTimestamp_page_${page}, now); } catch (error) { console.error('Erro ao carregar produtos:', error); } }

function groupProductsByCategory(items) { return items.reduce((acc, item) => { const category = item.category || 'sem-categoria'; if (!acc[category]) acc[category] = []; acc[category].push(item); return acc; }, {}); }

function renderCategoryNav() { const nav = document.getElementById('categoryNav'); if (!nav) return; nav.innerHTML = ''; const grouped = groupProductsByCategory(products); for (const category in grouped) { const link = document.createElement('span'); link.classList.add('category-link'); link.dataset.category = category; link.textContent = category.replace('-', ' '); link.onclick = () => document.getElementById(category-${category})?.scrollIntoView({ behavior: 'smooth' }); nav.appendChild(link); } window.addEventListener('scroll', highlightActiveCategory); }

function renderProducts() { const container = document.getElementById('products'); if (!container) return; container.innerHTML = ''; let filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.price >= minPrice && p.price <= maxPrice ); if (!filtered.length) { container.innerHTML = '<p>Nenhum produto disponível</p>'; return; } const grouped = groupProductsByCategory(filtered); for (const category in grouped) { const div = document.createElement('div'); div.className = 'category'; div.id = category-${category}; div.innerHTML = <h2>${category.replace('-', ' ')}</h2>; const grid = document.createElement('div'); grid.className = 'product-grid'; grouped[category].forEach(p => { const el = document.createElement('div'); el.className = 'product'; el.innerHTML = <img src="${p.image}" alt="${p.name}" onclick="openProductModal('${p._id}')"> <h3>${p.name}</h3> <p>Preço: R$ ${p.price.toFixed(2)}</p> <button onclick="addToCart('${p._id}')">Adicionar ao Carrinho</button>; grid.appendChild(el); }); div.appendChild(grid); container.appendChild(div); } const pag = document.createElement('div'); pag.innerHTML = <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button> <button onclick="goToPage(${currentPage + 1})">Próximo</button>; container.appendChild(pag); }

function goToPage(page) { showLoading(); loadProducts(page).then(() => { renderProducts(); updateTotal(); updateCartCount(); hideLoading(); }); }

function highlightActiveCategory() { const links = document.querySelectorAll('.category-link'); let active = null; document.querySelectorAll('.category').forEach(div => { const rect = div.getBoundingClientRect(); if (rect.top >= 0 && rect.top <= window.innerHeight / 2) { active = div.id.replace('category-', ''); } }); links.forEach(link => { link.classList.toggle('active', link.dataset.category === active); }); }

function openProductModal(id) { const p = products.find(p => p._id === id); if (!p) return; const modal = document.getElementById('productModal'); document.getElementById('productDetails').innerHTML = <img src="${p.image}" alt="${p.name}"> <h3>${p.name}</h3> <p>${p.description || 'Sem descrição disponível'}</p> <p>Preço: R$ ${p.price.toFixed(2)}</p> <button onclick="addToCart('${p._id}'); closeProductModal()">Adicionar ao Carrinho</button>; modal.style.display = 'block'; }

function closeProductModal() { document.getElementById('productModal').style.display = 'none'; }

function addToCart(id) { const p = products.find(p => p._id === id); if (!p) return alert('Produto não encontrado'); cart.push(p); renderCart(); updateTotal(); updateCartCount(); }

function renderCart() { const c = document.getElementById('cart'); c.innerHTML = ''; cart.forEach((item, i) => { const el = document.createElement('div'); el.className = 'cart-item'; el.innerHTML = <img src="${item.image}" alt="${item.name}"> <h3>${item.name}</h3> <p>Preço: R$ ${item.price.toFixed(2)}</p> <button onclick="removeFromCart(${i})">Remover</button>; c.appendChild(el); }); }

function removeFromCart(i) { cart.splice(i, 1); renderCart(); updateTotal(); updateCartCount(); }

function updateTotal() { total = cart.reduce((sum, item) => sum + item.price, 0); document.getElementById('total').innerText = Total: R$ ${total.toFixed(2)}; }

function updateCartCount() { document.getElementById('cartCount').innerText = cart.length; }

function makeOrder() { const resumo = cart.map(i => ${i.name} - R$ ${i.price.toFixed(2)}).join('\n'); const msg = Resumo do Pedido:\n${resumo}\nTotal: R$ ${total.toFixed(2)}; window.open(https://api.whatsapp.com/send?phone=5541997457028&text=${encodeURIComponent(msg)}); }

function openCartModal() { document.getElementById('cartModal').style.display = 'block'; }

function closeCartModal() { document.getElementById('cartModal').style.display = 'none'; }

window.onclick = e => { if (e.target === document.getElementById('cartModal')) closeCartModal(); if (e.target === document.getElementById('productModal')) closeProductModal(); };

