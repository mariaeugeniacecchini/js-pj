const API_URL = 'productos_apple.json';

const productList = document.getElementById('product-list');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const contactForm = document.getElementById('contactForm');

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = []; // para guardar todos los productos cargados desde el JSON

// Carga productos desde JSON local y los muestra
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    const products = await res.json();
    allProducts = products; // guardamos los productos para búsquedas futuras

    productList.innerHTML = '';
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" />
        <h3>${product.title}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button data-id="${product.id}">Agregar al carrito</button>
      `;
      productList.appendChild(card);
    });
  } catch (error) {
    productList.innerHTML = '<p>Error cargando productos.</p>';
    console.error(error);
  }
}

// Guarda carrito en localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Renderiza carrito
function renderCart() {
  cartList.innerHTML = '';

  if (cart.length === 0) {
    cartList.innerHTML = '<p>El carrito está vacío.</p>';
    cartTotal.textContent = '$0.00';
    cartCount.textContent = '0';
    return;
  }

  let total = 0;
  let count = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    count += item.quantity;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <div><img src="${item.image}" alt="${item.title}" /></div>
      <div>${item.title}</div>
      <div>$${item.price.toFixed(2)}</div>
      <div>
        <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="cart-quantity" />
      </div>
      <div>
        <button data-id="${item.id}" class="remove-item">Eliminar</button>
      </div>
    `;
    cartList.appendChild(itemDiv);
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = count;
}

// Añadir producto al carrito
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
}

// Cambiar cantidad
function updateQuantity(id, quantity) {
  const item = cart.find(i => i.id === id);
  if (item) {
    if (quantity < 1) {
      removeFromCart(id);
    } else {
      item.quantity = quantity;
      saveCart();
      renderCart();
    }
  }
}

// Eliminar producto
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

// Manejar clicks
function handleClick(e) {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.id && !e.target.classList.contains('remove-item')) {
    const id = parseInt(e.target.dataset.id);
    const product = allProducts.find(p => p.id === id);
    if (product) {
      addToCart(product);
    }
  }

  if (e.target.classList.contains('remove-item')) {
    const id = parseInt(e.target.dataset.id);
    removeFromCart(id);
  }
}

// Manejar cambios de cantidad
function handleInputChange(e) {
  if (e.target.classList.contains('cart-quantity')) {
    const id = parseInt(e.target.dataset.id);
    const newQty = parseInt(e.target.value);
    if (isNaN(newQty) || newQty < 1) {
      e.target.value = 1;
      updateQuantity(id, 1);
    } else {
      updateQuantity(id, newQty);
    }
  }
}

// Validación del formulario
function validateContactForm(e) {
  const nombre = contactForm.nombre.value.trim();
  const email = contactForm.email.value.trim();
  const mensaje = contactForm.mensaje.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nombre || !email || !mensaje) {
    alert('Por favor, completa todos los campos.');
    e.preventDefault();
    return;
  }
  if (!emailRegex.test(email)) {
    alert('Por favor, ingresa un correo electrónico válido.');
    e.preventDefault();
  }
}

// Inicialización
function init() {
  loadProducts();
  renderCart();

  productList.addEventListener('click', handleClick);
  cartList.addEventListener('click', handleClick);
  cartList.addEventListener('input', handleInputChange);
  contactForm.addEventListener('submit', validateContactForm);
}

init();
