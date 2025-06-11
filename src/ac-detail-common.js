import { supabase, CART_TABLE, getUserId } from './supabase-client.js';

// 상품 정보 가져오기
const productDetail = window.productDetail;
if (!productDetail) {
    console.error('Product detail not found');
}

// 전역 변수로 선언
let selectedPrice = productDetail ? productDetail.price : 0; // productDetail이 없을 경우 기본값 설정
let quantityInput;
let totalPriceAmount;

// 사용자 식별자
const userId = getUserId();

// GA4 상품 조회 이벤트
if (typeof gtag === 'function') {
    try {
        gtag('event', 'view_item', {
            currency: 'KRW',
            value: selectedPrice,
            items: [{
                item_id: productDetail ? productDetail.id : '',
                item_name: productDetail ? productDetail.name : '',
                price: selectedPrice,
                currency: 'KRW',
                quantity: 1
            }]
        });
    } catch (error) {
        console.error('GA4 이벤트 추적 중 오류 발생:', error);
    }
} else {
    console.log('GA4 추적을 건너뜁니다. gtag 함수가 존재하지 않습니다.');
}

// 장바구니 관련 공통 함수들
function getCurrentVersionFromUrlOrSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlVersion = urlParams.get('v');
    if (urlVersion) {
        console.log('Debug: Version from URL:', urlVersion);
        return urlVersion;
    }

    const sessionVersion = sessionStorage.getItem('currentVersion');
    if (sessionVersion) {
        console.log('Debug: Version from sessionStorage:', sessionVersion);
        // Map 'a' to '1' and 'b' to '2' for compatibility with existing 'v' logic
        return sessionVersion === 'a' ? '1' : '2';
    }

    // Default or fallback if no version found (e.g., direct access without version)
    console.log('Debug: No version found, defaulting to 1 (cart.html).');
    return '1'; // 기본값 설정 (index1.html의 기본 동작)
}

function getCurrentCartKey() {
    const version = getCurrentVersionFromUrlOrSession();
    return version === '1' ? 'cartItemsA' : 'cartItemsB';
}

function getCurrentCartPage() {
    const version = getCurrentVersionFromUrlOrSession();
    return version === '1' ? 'cart.html' : 'cart2.html';
}

function goToCart() {
    // index1.html에서 항상 cart.html로 이동
    if (location.pathname.includes('index1.html') || sessionStorage.getItem('currentVersion') === 'a') {
        window.location.href = 'cart.html';
    } else {
        window.location.href = 'cart2.html';
    }
}

function showPopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('cartPopup');
    
    if (overlay && popup) {
        // 먼저 display를 block으로 설정
        overlay.style.display = 'block';
        popup.style.display = 'block';
        
        // 약간의 지연 후 opacity 애니메이션 적용
        setTimeout(() => {
            overlay.style.opacity = '1';
            popup.style.opacity = '1';
            popup.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
    }
}

function closePopup() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('cartPopup');
    
    if (overlay && popup) {
        // 애니메이션 적용
        overlay.style.opacity = '0';
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -50%) scale(0.95)';
        
        // 애니메이션 완료 후 display를 none으로 설정
        setTimeout(() => {
            overlay.style.display = 'none';
            popup.style.display = 'none';
        }, 300);
    }
}

// 수량 변경 시 총 가격 업데이트
function updateTotalPrice() {
    if (quantityInput && totalPriceAmount && productDetail) {
        const quantity = parseInt(quantityInput.value) || 1;
        const totalPrice = productDetail.price * quantity;
        totalPriceAmount.textContent = totalPrice.toLocaleString() + '원';
    }
}

// 수량 증가/감소 버튼
function increaseQuantity(e) {
    e.stopPropagation();
    if (quantityInput) {
        let value = parseInt(quantityInput.value) || 1;
        value = Math.max(1, value + 1);
        quantityInput.value = value;
        updateTotalPrice();
    }
}

function decreaseQuantity(e) {
    e.stopPropagation();
    if (quantityInput) {
        let value = parseInt(quantityInput.value) || 1;
        value = Math.max(1, value - 1);
        quantityInput.value = value;
        updateTotalPrice();
    }
}

// 수량 직접 입력 시 총 가격 업데이트
function handleQuantityInput(e) {
    e.stopPropagation();
    if (quantityInput) {
        let value = parseInt(quantityInput.value);
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        quantityInput.value = value;
        updateTotalPrice();
    }
}

// 메인 페이지로 이동
function goToMainPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const version = urlParams.get('v');
    console.log('Debug: goToMainPage - URL version:', version);
    window.location.href = version === '1' ? 'index1.html' : 'index2.html';
}

// DOM이 로드된 후 이벤트 리스너 등록

    // DOM 요소 선택
    quantityInput = document.querySelector('#quantity');
    totalPriceAmount = document.querySelector('.total-price-amount');
    const addToCartButton = document.querySelector('.add-to-cart-button');
    const buyNowButton = document.querySelector('.buy-now-button');
    const continueShoppingButton = document.querySelector('.continue-shopping');
    const goToCartButton = document.querySelector('.go-to-cart');
    const cartIcon = document.querySelector('.cart-icon');
    const decreaseButton = document.querySelector('.quantity-decrease');
    const increaseButton = document.querySelector('.quantity-increase');

    // 디버깅 로그


    // 수량 입력 필드 이벤트 리스너

        // 초기 수량 설정
        quantityInput.value = '1';
        quantityInput.addEventListener('change', handleQuantityInput);
    

    // 수량 감소 버튼 이벤트 리스너
 
        decreaseButton.addEventListener('click', decreaseQuantity);
    

    // 수량 증가 버튼 이벤트 리스너
    
        increaseButton.addEventListener('click', increaseQuantity);
  

    // 초기 총 가격 설정
    

    // 장바구니 담기 버튼 클릭 이벤트

    addToCartButton.addEventListener('click', async function () {
        const quantity = parseInt(quantityInput.value);
        const version = getCurrentVersionFromUrlOrSession(); // '1' 또는 '2'
    
        try {
            // 1. carts 테이블에서 해당 세션 ID로 카트가 있는지 확인
            const sessionId = userId || sessionStorage.getItem('sessionId') || crypto.randomUUID();
            sessionStorage.setItem('sessionId', sessionId);
    
            let { data: existingCart, error: findCartError } = await supabase
                .from('carts')
                .select('id')
                .eq('session_id', sessionId)
                .single();
    
            // 2. 없으면 새로 생성
            if (findCartError || !existingCart) {
                const { data: newCart, error: createCartError } = await supabase
                    .from('carts')
                    .insert({ session_id: sessionId })
                    .select()
                    .single();
    
                if (createCartError) throw createCartError;
                existingCart = newCart;
            }
    
            // 3. cart_items에 상품 추가
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: existingCart.id,
                    product_id: productDetail.id,
                    product_name: productDetail.name,
                    line: productDetail.line || 'amino', // 'ac' 또는 'amino'
                    quantity: quantity,
                    unit_price: productDetail.price,
                    added_at: new Date().toISOString()
                });
    
            if (insertError) throw insertError;
    
            // 4. GA 이벤트
            gtag('event', 'add_to_cart', {
                currency: 'KRW',
                value: productDetail.price * quantity,
                items: [{
                    item_id: productDetail.id,
                    item_name: productDetail.name,
                    price: productDetail.price,
                    quantity: quantity,
                    currency: 'KRW'
                }]
            });
    
            // 5. 장바구니 페이지로 이동
            window.location.href = getCurrentCartPage();
    
        } catch (err) {
            console.error('장바구니 저장 오류:', err);
            alert('장바구니에 상품을 담는 중 문제가 발생했습니다.');
        }
    });
    
    

    // 바로 구매하기 버튼 클릭 이벤트
 
        buyNowButton.addEventListener('click', async function() {
            const quantity = parseInt(quantityInput.value);
            
            try {
                const { data, error } = await supabase
                    .from('cart_items')
                    .upsert({
                        user_id: userId,
                        product_id: productDetail.id,
                        name: productDetail.name,
                        price: productDetail.price,
                        quantity: quantity,
                        image: productDetail.image,
                        total_price: productDetail.price * quantity,
                        added_at: new Date().toISOString()
                    })
                    .select();

                if (error) throw error;

                // GA4 이벤트 추적
                gtag('event', 'buy_now', {
                    currency: 'KRW',
                    value: productDetail.price * quantity,
                    items: [{
                        item_id: productDetail.id,
                        item_name: productDetail.name,
                        price: productDetail.price,
                        quantity: quantity,
                        currency: 'KRW'
                    }]
                });

                // 주문 페이지로 이동
                window.location.href = 'order.html';
            } catch (error) {
                console.error('Error in buy now:', error);
                alert('구매 처리 중 오류가 발생했습니다.');
            }
        });
    

    // 장바구니 팝업 버튼 이벤트 리스너

        continueShoppingButton.addEventListener('click', closePopup);
    

   
        goToCartButton.addEventListener('click', goToCart);
    

    // 장바구니 아이콘 클릭 이벤트
  
        cartIcon.addEventListener('click', goToCart);
    

    // 바로 구매하기 버튼 클릭 이벤트
 
        buyNowButton.addEventListener('click', async function() {
            const quantity = parseInt(quantityInput.value);
            
            try {
                const { data, error } = await supabase
                    .from('cart_items')
                    .upsert({
                        user_id: userId,
                        product_id: productDetail.id,
                        name: productDetail.name,
                        price: productDetail.price,
                        quantity: quantity,
                        image: productDetail.image,
                        total_price: productDetail.price * quantity,
                        added_at: new Date().toISOString()
                    })
                    .select();

                if (error) throw error;

                // GA4 이벤트 추적
                gtag('event', 'buy_now', {
                    currency: 'KRW',
                    value: productDetail.price * quantity,
                    items: [{
                        item_id: productDetail.id,
                        item_name: productDetail.name,
                        price: productDetail.price,
                        quantity: quantity,
                        currency: 'KRW'
                    }]
                });
                
                // 결제 페이지로 이동
                window.location.href = 'order.html';
                return;
            } catch (error) {
                console.error('바로 구매 중 오류 발생:', error);
                alert('바로 구매 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        });
    

    // 장바구니 팝업 버튼 이벤트 리스너

        continueShoppingButton.addEventListener('click', closePopup);
    

  
        goToCartButton.addEventListener('click', goToCart);
    


// 전역 함수로 등록
