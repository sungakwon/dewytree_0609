const CART_KEY = 'cartItemsB';

// 메인 페이지로 이동하는 함수 - 항상 index2.html로 이동
function goToHome() {
    window.location.href = 'index2.html';
}

// 장바구니에 상품 제거
function removeItem(index) {
    try {
        const cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        cartItems.splice(index, 1);
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        loadCartItems();
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
            loadCartItems();
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
            loadCartItems();
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
}

// 페이지 로드 이벤트 리스너 추가
window.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
});



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

    // 수량 조절 버튼 이벤트 리스너 추가
    const minusBtns = document.querySelectorAll('.quantity-btn.minus');
    const plusBtns = document.querySelectorAll('.quantity-btn.plus');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const removeBtns = document.querySelectorAll('.cart-item-remove');

    // 이벤트 리스너가 이미 추가되어 있는지 확인
    const hasEventListeners = (element, eventName) => {
        const eventListeners = getEventListeners(element)[eventName];
        return eventListeners && eventListeners.length > 0;
    };

    minusBtns.forEach(btn => {
        if (!hasEventListeners(btn, 'click')) {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                updateQuantity(index, -1);
            });
        }
    });

    plusBtns.forEach(btn => {
        if (!hasEventListeners(btn, 'click')) {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                updateQuantity(index, 1);
            });
        }
    });

    quantityInputs.forEach(input => {
        if (!hasEventListeners(input, 'change')) {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.closest('.quantity-controls').querySelector('.quantity-btn').dataset.index);
                const value = Math.max(1, parseInt(e.target.value) || 1);
                e.target.value = value;
                updateQuantityInput(index, value);
            });
        }
    });

    removeBtns.forEach(btn => {
        if (!hasEventListeners(btn, 'click')) {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                removeItem(index);
            });
        }
    });

    // 쇼핑 계속하기와 구매하기 버튼 이벤트 처리
    const continueShoppingBtn = document.querySelector('.continue-shopping-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', goToHome);
    }
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            checkout();
            trackGA4Event('begin_checkout', {currency: 'KRW', value: parseFloat(document.getElementById('total').innerText.replace('원', '').replace(',', ''))});
        });
    }
}

// 장바구니 아이템 요소 생성
function createCartItemElement(item, index) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    // 이미지 경로 처리
    let imagePath = item.image || '/images/default-product.jpg'; // 기본 이미지 설정
    
    div.innerHTML = `
        <img src="${imagePath}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">${item.price.toLocaleString()}원</span>
        </div>
        <div class="cart-item-quantity">
            <div class="quantity-controls">
                <button data-index="${index}" class="quantity-btn minus">-</button>
                <input type="number" value="${item.quantity}" min="1" class="quantity-input">
                <button data-index="${index}" class="quantity-btn plus">+</button>
            </div>
        </div>
        <span class="cart-item-remove" data-index="${index}">✕</span>
    `;
    return div;
}



// 장바구니 요약 정보 업데이트
function updateCartSummary(subtotal) {
    const shipping = subtotal >= 30000 ? 0 : 3000;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = subtotal.toLocaleString() + '원';
    document.getElementById('shipping').textContent = shipping.toLocaleString() + '원';
    document.getElementById('total').textContent = total.toLocaleString() + '원';
}

 