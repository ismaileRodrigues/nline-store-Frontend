// Código principal da loja com melhorias de filtro e desempenho

let products = []; let categories = []; const cart = []; let total = 0; let currentPage = 1; const productsPerPage = 20;

// Elementos do filtro const searchInput = document.getElementById('searchInput'); const minPriceInput = document.getElementById('minPrice'); const maxPriceInput = document.getElementById('maxPrice');

// Aguarda o carregamento do DOM document.addEventListener('DOMContentLoaded', async () => { showLoading(); try { const response = await fetch('https://online-store-backend-vw45.onrender.com/api/store-status'); const data = await response.json();

if (data.status === 'closed') {
        document.body.innerHTML = '<h1>Loja Fechada</h1> <br> <p>Fale conosco:  <a href="https://api.whatsapp.com/send?phone=5541998642005" target="_blank" class="text-white mx-2"><i class="fab fa-whatsapp fa-2x"></i></a></p>';
    } else {
        await Promise.all([loadCategories(), loadProducts()]);
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

// Funções de carregamento com cache async function loadCategories() { const cached = localStorage.getItem('categories'); const timestamp = localStorage.getItem('categoriesTimestamp'); const now = Date.now();

if (cached && timestamp && (now - timestamp < 3600000)) {
    categories = JSON.parse(cached);
    return;
}

try {
    const res = await fetch('https://online-store-backend-vw45.onrender.com/api/categories');
    categories = await res.json();
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('categoriesTimestamp', now);
} catch (error) {
    console.error('Erro ao carregar categorias:', error);
}

}

async function loadProducts(page = 1) { const cached = localStorage.getItem(products_page_${page}); const timestamp = localStorage.getItem(productsTimestamp_page_${page}); const now = Date.now();

if (cached && timestamp && (now - timestamp < 3600000)) {
    products = JSON.parse(cached);
    return;
}

try {
    const res = await fetch(`https://online-store-backend-vw45.onrender.com/api/products?page=${page}&limit=${productsPerPage}`);
    products = await res.json();
    localStorage.setItem(`products_page_${page}`, JSON.stringify(products));
    localStorage.setItem(`productsTimestamp_page_${page}`, now);
} catch (error) {
    console.error('Erro ao carregar produtos:', error);
}

}

// Renderização de categorias e produtos function renderCategoryNav() { const nav = document.getElementById('categoryNav'); nav.innerHTML = '';

const uniqueCategories = [...new Set(products.map(p => p.category || 'sem-categoria'))];

uniqueCategories.forEach(category => {
    const span = document.createElement('span');
    span.classList.add('category-link');
    span.setAttribute('data-category', category);
    span.textContent = category.replace('-', ' ');
    span.addEventListener('click', () => {
        const section = document.getElementById(`category-${category}`);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
    nav.appendChild(span);
});

window.addEventListener('scroll', highlightActiveCategory);

}

function renderProducts() { const container = document.getElementById('products'); container.innerHTML = '';

const searchQuery = searchInput?.value.toLowerCase() || '';
const minPrice = parseFloat(minPriceInput?.value) || 0;
const maxPrice = parseFloat(maxPriceInput?.value) || Infinity;

const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery) &&
    p.price >= minPrice &&
    p.price <= maxPrice
);

if (filtered.length === 0) {
    container.innerHTML = '<p>Nenhum produto encontrado</p>';
    return;
}

const byCategory = {};
filtered.forEach(p => {
    const cat = p.category || 'sem-categoria';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
});

Object.keys(byCategory).forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.classList.add('category');
    catDiv.id = `category-${cat}`;
    catDiv.innerHTML = `<h2>${cat.replace('-', ' ')}</h2>`;

    const grid = document.createElement('div');
    grid.classList.add('product-grid');
    byCategory[cat].forEach(p => {
        const el = document.createElement('div');
        el.classList.add('product');
        el.innerHTML = `
            <img src="${p.image}" alt="${p.name}" onclick="openProductModal('${p._id}')">
            <h3>${p.name}</h3>
            <p>Preço: R$ ${p.price.toFixed(2)}</p>
            <button onclick="addToCart('${p._id}')">Adicionar ao Carrinho</button>
        `;
        grid.appendChild(el);
    });

    catDiv.appendChild(grid);
    container.appendChild(catDiv);
});

}

// Demais funções (modal, carrinho, etc) function openProductModal(id) { const p = products.find(p => p._id === id); const modal = document.getElementById('productModal'); const details = document.getElementById('productDetails');

if (p && modal && details) {
    details.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description || 'Sem descrição'}</p>
        <p>Preço: R$ ${p.price.toFixed(2)}</p>
        <button onclick="addToCart('${p._id}'); closeProductModal()">Adicionar ao Carrinho</button>
    `;
    modal.style.display = 'block';
}

}

function closeProductModal() { document.getElementById('productModal').style.display = 'none'; }

function highlightActiveCategory() { const links = document.querySelectorAll('.category-link'); let active = null; document.querySelectorAll('.category').forEach(div => { const rect = div.getBoundingClientRect(); if (rect.top >= 0 && rect.top <= window.innerHeight / 2) { active = div.id.replace('category-', ''); } }); links.forEach(link => { if (link.getAttribute('data-category') === active) link.classList.add('active'); else link.classList.remove('active'); }); }

function showLoading() { const el = document.getElementById('loading'); if (el) el.style.display = 'flex'; }

function hideLoading() { const el = document.getElementById('loading'); if (el) el.style.display = 'none'; }

function addToCart(id) { const p = products.find(p => p._id === id); if (p) { cart.push(p); renderCart(); updateTotal(); updateCartCount(); } }

function renderCart() { const container = document.getElementById('cart'); container.innerHTML = ''; cart.forEach((item, index) => { const el = document.createElement('div'); el.classList.add('cart-item'); el.innerHTML = <img src="${item.image}" alt="${item.name}"> <h3>${item.name}</h3> <p>Preço: R$ ${item.price.toFixed(2)}</p> <button onclick="removeFromCart(${index})">Remover</button>; container.appendChild(el); }); }

function removeFromCart(i) { cart.splice(i, 1); renderCart(); updateTotal(); updateCartCount(); }

function updateTotal() { total = cart.reduce((sum, item) => sum + item.price, 0); document.getElementById('total').innerText = Total: R$ ${total.toFixed(2)}; }

function updateCartCount() { document.getElementById('cartCount').innerText = cart.length; }

function makeOrder() { const summary = cart.map(p => ${p.name} - R$ ${p.price.toFixed(2)}).join('\n'); const msg = Resumo do Pedido:\n${summary}\nTotal: R$ ${total.toFixed(2)}; const url = https://api.whatsapp.com/send?phone=5541997457028&text=${encodeURIComponent(msg)}; window.open(url, '_blank'); }

function openCartModal() { document.getElementById('cartModal').style.display = 'block'; }

function closeCartModal() { document.getElementById('cartModal').style.display = 'none'; }

window.onclick = function(event) { if (event.target == document.getElementById('cartModal')) closeCartModal(); if (event.target == document.getElementById('productModal')) closeProductModal(); };

 searchInput?.addEventListener('input', renderProducts); minPriceInput?.addEventListener('input', renderProducts); maxPriceInput?.addEventListener('input', renderProducts);

