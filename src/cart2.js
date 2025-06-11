import { supabase, CART_TABLE, getUserId } from './supabase-client.js';

// 로컬 스토리지 키
const CART_KEY = 'local_cart_items';

// 사용자 식별자
const userId = getUserId();

// 메인 페이지로 이동하는 함수 - 항상 index2.html로 이동
function goToHome() {
    window.location.href = 'index2.html';
}

// 장바구니 데이터 불러오기
async function loadCartItems() {
    try {
        // 먼저 로컬 스토리지에서 데이터를 가져오기 시도
        let cartItems = JSON.parse(localStorage.getItem(CART_KEY)) || [];

        // Supabase가 설정되어 있다면 서버 데이터로 업데이트
        if (supabase) {
            try {
                // 먼저 모든 데이터를 가져오기 시도
                const { data, error } = await supabase
                    .from('cart_items')
                    .select('*');

                if (error) {
                    console.error('Supabase 데이터 불러오기 오류:', error);
                    // 서버에서 오류가 발생해도 로컬 데이터를 사용
                } else {
                    // 로컬 데이터와 서버 데이터를 병합
                    const serverItems = data || [];
                    cartItems = [...cartItems, ...serverItems];
                    // 로컬 스토리지 업데이트
                    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
                }
            } catch (error) {
                console.error('Supabase 쿼리 실행 중 오류 발생:', error);
            }
        }

        // 데이터 형식 변환
        return cartItems.map(item => ({
            id: item.id || Date.now(),
            name: item.name || '상품 이름',
            price: item.price || 0,
            quantity: item.quantity || 1,
            image: item.image || '',
            total_price: item.price * (item.quantity || 1)
        }));
    } catch (error) {
        console.error('장바구니 데이터 처리 중 오류 발생:', error);
        return [];
    }
}

// 장바구니 데이터 저장
async function saveCartItem(item) {
    try {
        const { error } = await supabase
            .from(CART_TABLE)
            .upsert({
                user_id: userId,
                product_id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total_price: item.price * item.quantity,
                added_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('장바구니 데이터 저장 오류:', error);
        return false;
    }
}

// 장바구니에 상품 제거
async function removeItem(productId) {
    try {
        const { error } = await supabase
            .from(CART_TABLE)
            .delete()
            .eq('product_id', productId)
            .eq('user_id', userId);

        if (error) throw error;
        
        loadCartItems();
    } catch (error) {
        console.error('상품 제거 중 오류 발생:', error);
        alert('상품 제거 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 수량 업데이트
async function updateQuantity(index, change) {
    try {
        const cartItems = await loadCartItems();
        if (cartItems[index]) {
            const updatedItem = { ...cartItems[index], quantity: cartItems[index].quantity + change };
            await saveCartItem(updatedItem);
            loadCartItems();
        }
    } catch (error) {
        console.error('수량 업데이트 중 오류 발생:', error);
        alert('수량 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 수량 직접 입력
async function updateQuantityInput(index, value) {
    try {
        const cartItems = await loadCartItems();
        if (cartItems[index]) {
            const newQuantity = Math.max(1, parseInt(value) || 1);
            const updatedItem = { ...cartItems[index], quantity: newQuantity };
            await saveCartItem(updatedItem);
            loadCartItems();
        }
    } catch (error) {
        console.error('수량 입력 중 오류 발생:', error);
        alert('수량 입력 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 결제 페이지로 이동
async function checkout() {
    try {
        const cartItems = await loadCartItems();
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
window.addEventListener('DOMContentLoaded', async () => {
    await loadCartItems();
    
    // 로고 클릭 이벤트 처리
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', goToHome);
    }

    // 장바구니 비어있을 때의 쇼핑 계속하기 버튼
    const emptyContinueBtn = document.querySelector('.cart-empty .continue-shopping-btn');
    if (emptyContinueBtn) {
        emptyContinueBtn.addEventListener('click', goToHome);
    }

    // 장바구니 요약 영역의 버튼들
    const summaryContinueBtn = document.querySelector('.cart-summary .continue-shopping-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (summaryContinueBtn) {
        summaryContinueBtn.addEventListener('click', goToHome);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            await checkout();
            trackGA4Event('begin_checkout', {currency: 'KRW', value: parseFloat(document.getElementById('total').innerText.replace('원', '').replace(',', ''))});
        });
    }
});

// 장바구니 아이템 렌더링 함수
async function renderCartItems() {
    try {
        const cartItems = await loadCartItems();
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartEmpty = document.querySelector('.cart-empty');
        const cartSummary = document.querySelector('.cart-summary');
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total');

        if (!cartItemsContainer || !cartEmpty || !cartSummary || !subtotalElement || !shippingElement || !totalElement) {
            console.error('필수 DOM 요소가 없습니다');
            return;
        }

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
            // 초기 수량이 1로 설정되도록
            if (typeof item.quantity !== 'number' || item.quantity < 1) {
                item.quantity = 1;
            }
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

            const minusBtn = itemElement.querySelector('.quantity-btn.minus');
            const plusBtn = itemElement.querySelector('.quantity-btn.plus');
            const quantityInput = itemElement.querySelector('.quantity-input');
            const removeBtn = itemElement.querySelector('.cart-item-remove');

            // 수량 조절 이벤트 리스너
            if (minusBtn) {
                minusBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const updatedItem = { ...item, quantity: Math.max(1, item.quantity - 1) };
                    await saveCartItem(updatedItem);
                    await renderCartItems();
                });
            }

            if (plusBtn) {
                plusBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const updatedItem = { ...item, quantity: item.quantity + 1 };
                    await saveCartItem(updatedItem);
                    await renderCartItems();
                });
            }

            if (quantityInput) {
                quantityInput.addEventListener('change', async (e) => {
                    e.stopPropagation();
                    const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                    e.target.value = newQuantity;
                    const updatedItem = { ...item, quantity: newQuantity };
                    await saveCartItem(updatedItem);
                    await renderCartItems();
                });
            }

            if (removeBtn) {
                removeBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await removeItem(item.id);
                    await renderCartItems();
                });
            }

            cartItemsContainer.appendChild(itemElement);
        });

        // 장바구니 요약 정보 업데이트
        updateCartSummary(subtotal);
    } catch (error) {
        console.error('장바구니 데이터를 불러오는 중 오류 발생:', error);
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

    // 기존 이벤트 리스너 제거
    const minusBtn = div.querySelector('.quantity-btn.minus');
    const plusBtn = div.querySelector('.quantity-btn.plus');
    const quantityInput = div.querySelector('.quantity-input');

    // 기존 이벤트 리스너 제거
    if (minusBtn) {
        minusBtn.removeEventListener('click', () => {});
        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateQuantity(index, -1);
        });
    }

    if (plusBtn) {
        plusBtn.removeEventListener('click', () => {});
        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateQuantity(index, 1);
        });
    }

    if (quantityInput) {
        quantityInput.removeEventListener('change', () => {});
        quantityInput.addEventListener('change', (e) => {
            e.stopPropagation();
            updateQuantityInput(index, e.target.value);
        });
    }

    return div;
}



// 장바구니 요약 정보 업데이트
function updateCartSummary(subtotal) {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');

    if (subtotalElement && shippingElement && totalElement) {
        const shipping = subtotal >= 30000 ? 0 : 3000;
        subtotalElement.textContent = subtotal.toLocaleString() + '원';
        shippingElement.textContent = shipping.toLocaleString() + '원';
        totalElement.textContent = (subtotal + shipping).toLocaleString() + '원';
    }
}
 