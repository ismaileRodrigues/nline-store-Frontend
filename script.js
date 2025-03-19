document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    updateTotal();
    updateCartCount();
});

let products = [];
let categories = [];
const cart = [];
let total = 0;

function loadCategories() {
    showLoading();
    fetch('https://online-store-backend-vw45.onrender.com/api/categories')
        .then(response => response.json())
        .then(data => {
            console.log('Categorias carregadas:', data);
            categories = data;
        })
        .catch(error => console.error('Error loading categories:', error))
        .finally(() => hideLoading());
}

function loadProducts() {
    showLoading();
    fetch('https://online-store-backend-vw45.onrender.com/api/products')
        .then(response => response.json())
        .then(data => {
            console.log('Produtos carregados:', data);
            products = data;
            renderProducts();
        })
        .catch(error => console.error('Error loading products:', error))
        .finally(() => hideLoading());
}

function renderProducts() {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    // Agrupar produtos por categoria
    const productsByCategory = {};
    products.forEach(product => {
        const category = product.category || 'sem-categoria';
        if (!productsByCategory[category]) {
            productsByCategory[category] = [];
        }
        productsByCategory[category].push(product);
    });

    // Renderizar cada categoria e seus produtos
    Object.keys(productsByCategory).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');
        categoryDiv.innerHTML = `<h2>${category.replace('-', ' ')}</h2>`;
        productsContainer.appendChild(categoryDiv);

        const productGrid = document.createElement('div');
        productGrid.classList.add('product-grid');
        categoryDiv.appendChild(productGrid);

        productsByCategory[category].forEach(product => {
            if (!product._id) {
                console.error('Produto inválido, sem _id:', product);
                return;
            }
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <details>
                    <summary>Ver descrição</summary>
                    <p>${product.description}</p>
                </details>
                <p>Preço: R$ ${product.price.toFixed(2)}</p>
                <button onclick="addToCart('${product._id}')">Adicionar ao Carrinho</button>
            `;
            productGrid.appendChild(productElement);
        });
    });
}

function showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (product) {
        cart.push(product);
        console.log('Produto adicionado ao carrinho:', product);
        renderCart();
        updateTotal();
        updateCartCount();
    } else {
        console.error('Produto não encontrado:', productId);
        alert('Erro ao adicionar o produto ao carrinho.');
    }
}

function renderCart() {
    const cartContainer = document.getElementById('cart');
    cartContainer.innerHTML = '';
    cart.forEach((item, index) => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Preço: R$ ${item.price.toFixed(2)}</p>
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartContainer.appendChild(cartItemElement);
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateTotal();
    updateCartCount();
}

function updateTotal() {
    total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total').innerText = `Total: R$ ${total.toFixed(2)}`;
}

function updateCartCount() {
    document.getElementById('cartCount').innerText = cart.length;
}

function makeOrder() {
    const userName = prompt("Por favor, insira o seu nome:");
    const orderSummary = cart.map(item => `${item.name} - R$ ${item.price.toFixed(2)}`).join('\n');
    const whatsappMessage = `Nome: ${userName}\nResumo do Pedido:\n${orderSummary}\nTotal: R$ ${total.toFixed(2)}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5541997457028&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
}

function openCartModal() {
    document.getElementById('cartModal').style.display = 'block';
}

function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('cartModal')) {
        closeCartModal();
    }
};
