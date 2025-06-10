const CART_KEY = 'cartItemsB';

// 메인 페이지로 이동하는 함수 - 항상 index2.html로 이동
function goToHome() {
    window.location.href = 'index2.html';
}

function checkout() {
    const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (cartItems.length === 0) {
        alert('장바구니가 비어있습니다.');
        return;
    }
    const orderData = encodeURIComponent(JSON.stringify(cartItems));
    window.location.href = `order.html?orderData=${orderData}`;
}

// 장바구니 아이템 로드
function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartSummary = document.querySelector('.cart-summary');

    if (cartItems.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartSummary.style.display = 'none';
        cartEmpty.style.display = 'block';
        return;
    }

    cartItemsContainer.style.display = 'block';
    cartSummary.style.display = 'block';
    cartEmpty.style.display = 'none';
    cartItemsContainer.innerHTML = '';

    let subtotal = 0;
    cartItems.forEach((item, index) => {
        const itemElement = createCartItemElement(item, index);
        cartItemsContainer.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });

    updateCartSummary(subtotal);
}

// 장바구니 아이템 요소 생성
function createCartItemElement(item, index) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    // 이미지 경로 수정
    let imagePath = item.image;
    if (item.id === 'AC-MASK-001') {
        imagePath = '/images/ac-mask-pack.jpg';
    }
    
    div.innerHTML = `
        <img src="${imagePath}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">${item.price.toLocaleString()}원</span>
        </div>
        <div class="cart-item-quantity">
            <div class="quantity-controls">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantityInput(${index}, this.value)">
                <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
        </div>
        <span class="cart-item-remove" onclick="removeItem(${index})">✕</span>
    `;
    return div;
}

// 수량 업데이트
function updateQuantity(index, change) {
    const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (cartItems[index]) {
        cartItems[index].quantity = Math.max(1, cartItems[index].quantity + change);
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        loadCartItems();
    }
}

// 수량 직접 입력
function updateQuantityInput(index, value) {
    const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (cartItems[index]) {
        cartItems[index].quantity = Math.max(1, parseInt(value) || 1);
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        loadCartItems();
    }
}

// 아이템 제거
function removeItem(index) {
    const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    cartItems.splice(index, 1);
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    loadCartItems();
}

// 장바구니 요약 정보 업데이트
function updateCartSummary(subtotal) {
    const shipping = subtotal >= 30000 ? 0 : 3000;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = subtotal.toLocaleString() + '원';
    document.getElementById('shipping').textContent = shipping.toLocaleString() + '원';
    document.getElementById('total').textContent = total.toLocaleString() + '원';
}

// 페이지 로드 시 장바구니 아이템 로드
document.addEventListener('DOMContentLoaded', loadCartItems); 