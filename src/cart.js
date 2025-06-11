import { supabase, CART_TABLE, getUserId } from './supabase-client.js';
import { trackGA4Event, trackBeginCheckout } from './analytics.js';

// 세션 ID 관리
const sessionId = getUserId() || sessionStorage.getItem('sessionId') || crypto.randomUUID();
if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', sessionId);
}

// cart 데이터를 저장할 전역 변수
let cartData;

// 메인 페이지로 이동하는 함수 - 항상 index2.html로 이동
function goToHome() {
    window.location.href = 'index2.html';
}

// 장바구니 데이터 불러오기
async function loadCartItems() {
    try {
        // 먼저 cart 테이블에서 해당 세션의 cart_id를 가져옴
        const { data: cartData, error: cartError } = await supabase
            .from('carts')
            .select('id')
            .eq('session_id', sessionId)
            .single();

        if (cartError) throw cartError;
        window.cartData = cartData; // 전역 변수에 저장

        // cart_items에서 해당 cart_id의 아이템들을 가져옴
        const { data, error } = await supabase
            .from(CART_TABLE)
            .select('*')
            .eq('cart_id', cartData.id);

        if (error) throw error;
        
        // 데이터 형식 변환
        return (data || []).map(item => ({
            id: item.id,
            name: item.product_name,
            price: item.unit_price,
            quantity: item.quantity,
            image: item.image_url || '', // image_url이 없을 경우 빈 문자열 반환
            total_price: item.unit_price * item.quantity
        }));
    } catch (error) {
        console.error('장바구니 데이터 불러오기 오류:', error);
        return [];
    }
}

// 장바구니 데이터 저장
async function saveCartItem(item) {
    try {
        const { error } = await supabase
            .from(CART_TABLE)
            .upsert({
                cart_id: cartData.id,
                product_id: item.id,
                product_name: item.name,
                unit_price: item.price,
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

// 장바구니에서 상품 제거
async function removeItem(productId) {
    try {
        const { error } = await supabase
            .from(CART_TABLE)
            .delete()
            .eq('id', productId)
            .eq('cart_id', window.cartData.id);

        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('상품 제거 중 오류 발생:', error);
        return false;
    }
}

// 수량 업데이트 (Supabase 버전)
async function updateQuantity(index, change) {
    try {
        const cartItems = await loadCartItems();
        if (cartItems[index]) {
            const updatedItem = { ...cartItems[index], quantity: cartItems[index].quantity + change };
            await saveCartItem(updatedItem);
            await renderCartItems();
        }
    } catch (error) {
        console.error('수량 업데이트 중 오류 발생:', error);
        alert('수량 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 수량 직접 입력 (Supabase 버전)
async function updateQuantityInput(index, value) {
    try {
        const cartItems = await loadCartItems();
        if (cartItems[index]) {
            const newQuantity = Math.max(1, parseInt(value) || 1);
            const updatedItem = { ...cartItems[index], quantity: newQuantity };
            await saveCartItem(updatedItem);
            await renderCartItems();
        }
    } catch (error) {
        console.error('수량 입력 중 오류 발생:', error);
        alert('수량 입력 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 결제 페이지로 이동 (Supabase 버전)
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
    }
}

// 장바구니에 아이템 추가 (중복 체크)
async function addToCart(item) {
    try {
        const cartItems = await loadCartItems();
        
        // 중복 상품 확인
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            // 이미 장바구니에 있는 경우 수량만 증가
            const updatedItem = { ...existingItem, quantity: existingItem.quantity + 1 };
            await saveCartItem(updatedItem);
        } else {
            // 새로운 상품인 경우 추가
            await saveCartItem(item);
        }
        
        // 장바구니 다시 렌더링
        await renderCartItems();
        
        // GA4 이벤트 추적
        trackGA4Event('add_to_cart', {
            currency: 'KRW',
            value: item.price,
            items: [{
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: 1
            }]
        });
    } catch (error) {
        console.error('장바구니 추가 중 오류 발생:', error);
        alert('장바구니 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 페이지 로드 이벤트 리스너 추가
window.addEventListener('DOMContentLoaded', async () => {
    await renderCartItems();
    
    // 로고 클릭 이벤트 처리
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', goToHome);
    }

    // 쇼핑 계속하기와 구매하기 버튼 이벤트 처리
    const continueShoppingBtn = document.querySelector('.continue-shopping-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', goToHome);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            await checkout();
            trackGA4Event('begin_checkout', {currency: 'KRW', value: parseFloat(document.getElementById('total').innerText.replace('원', '').replace(',', ''))});
        });
    }
});