const CART_KEY = 'cartItemsA';

// 메인 페이지로 이동하는 함수 - 항상 index1.html로 이동
function goToHome() {
    window.location.href = 'index1.html';
}

// 장바구니에 상품 제거
function removeItem(index) {
    try {
        const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        cartItems.splice(index, 1);
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        renderCartItems();
    } catch (error) {
        console.error('상품 제거 중 오류 발생:', error);
        alert('상품 제거 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 수량 업데이트
function updateQuantity(index, change) {
    try {
        const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        if (cartItems[index]) {
            cartItems[index].quantity = Math.max(1, cartItems[index].quantity + change);
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
            renderCartItems();
        }
    } catch (error) {
        console.error('수량 업데이트 중 오류 발생:', error);
        alert('수량 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 수량 직접 입력
function updateQuantityInput(index, value) {
    try {
        const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        if (cartItems[index]) {
            cartItems[index].quantity = Math.max(1, parseInt(value) || 1);
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
            renderCartItems();
        }
    } catch (error) {
        console.error('수량 입력 중 오류 발생:', error);
        alert('수량 입력 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 결제 페이지로 이동
function checkout() {
    try {
        const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        if (cartItems.length === 0) {
            alert('장바구니가 비어있습니다.');
            return;
        }
        
        const orderData = encodeURIComponent(JSON.stringify(cartItems));
        window.location.href = `order.html?orderData=${orderData}`;
    } catch (error) {
        console.error('결제 처리 중 오류 발생:', error);
        alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
    window.location.href = `order.html?orderData=${orderData}`;
}

// 장바구니 아이템 렌더링 함수
function renderCartItems() {
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
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString()}원</div>
            </div>
            <div class="cart-item-quantity">
                <div class="quantity-controls">
                    <button data-index="${index}" class="quantity-btn minus">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="quantity-input">
                    <button data-index="${index}" class="quantity-btn plus">+</button>
                </div>
            </div>
            <div class="cart-item-remove" data-index="${index}">✕</div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    // 금액 업데이트
    const shipping = subtotal >= 30000 ? 0 : 3000;
    document.getElementById('subtotal').textContent = subtotal.toLocaleString() + '원';
    document.getElementById('shipping').textContent = shipping.toLocaleString() + '원';
    document.getElementById('total').textContent = (subtotal + shipping).toLocaleString() + '원';

    // 수량 조절 버튼 이벤트 리스너 추가
    const minusBtns = document.querySelectorAll('.quantity-btn.minus');
    const plusBtns = document.querySelectorAll('.quantity-btn.plus');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const removeBtns = document.querySelectorAll('.cart-item-remove');

    minusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            updateQuantity(index, -1);
        });
    });

    plusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            updateQuantity(index, 1);
        });
    });

    quantityInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.closest('.quantity-controls').querySelector('.quantity-btn').dataset.index);
            const value = Math.max(1, parseInt(e.target.value) || 1);
            e.target.value = value;
            updateQuantityInput(index, value);
        });
    });

    removeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            removeItem(index);
        });
    });
}



// 장바구니에 아이템 추가 (중복 체크)
function addToCart(item) {
    const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.name === item.name);

    if (existingItemIndex !== -1) {
        // 이미 존재하는 상품이면 수량만 증가
        cartItems[existingItemIndex].quantity += item.quantity;
    } else {
        // 새로운 상품이면 배열에 추가
        cartItems.push(item);
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

// 페이지 로드 이벤트 리스너 추가
window.addEventListener('DOMContentLoaded', () => {
    renderCartItems();
}); 