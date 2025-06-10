// 상품 정보 가져오기
const productDetail = window.productDetail;
if (!productDetail) {
    console.error('Product detail not found');
}

// 전역 변수로 선언
let selectedPrice = productDetail ? productDetail.price : 0; // productDetail이 없을 경우 기본값 설정
let quantityInput;
let totalPriceAmount;

// GA4 상품 조회 이벤트
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
        const quantity = parseInt(quantityInput.value);
        const totalPrice = productDetail.price * quantity;
        totalPriceAmount.textContent = totalPrice.toLocaleString() + '원';
    }
}

// 수량 증가/감소 버튼
function increaseQuantity() {
    if (quantityInput) {
        quantityInput.value = parseInt(quantityInput.value) + 1;
        updateTotalPrice();
    }
}

function decreaseQuantity() {
    if (quantityInput && parseInt(quantityInput.value) > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
        updateTotalPrice();
    }
}

// 수량 직접 입력 시 총 가격 업데이트
function handleQuantityInput() {
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
document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 선택
    quantityInput = document.getElementById('quantity');
    totalPriceAmount = document.querySelector('.total-price-amount');
    const addToCartButton = document.querySelector('.action-buttons .add-to-cart-button');
    const buyNowButton = document.querySelector('.action-buttons .buy-now-button');
    const continueShoppingButton = document.querySelector('.popup-buttons .continue-shopping');
    const goToCartButton = document.querySelector('.popup-buttons .go-to-cart');
    const cartIcon = document.querySelector('.cart-icon');
    const decreaseButton = document.querySelector('.quantity-controls button:first-child');
    const increaseButton = document.querySelector('.quantity-controls button:last-child');

    // 디버깅 로그
    console.log('DOM Elements:', {
        quantityInput: !!quantityInput,
        totalPriceAmount: !!totalPriceAmount,
        addToCartButton: !!addToCartButton,
        buyNowButton: !!buyNowButton,
        continueShoppingButton: !!continueShoppingButton,
        goToCartButton: !!goToCartButton,
        cartIcon: !!cartIcon,
        decreaseButton: !!decreaseButton,
        increaseButton: !!increaseButton
    });

    // 수량 입력 필드 이벤트 리스너
    if (quantityInput) {
        quantityInput.addEventListener('change', handleQuantityInput);
    }

    // 수량 감소 버튼 이벤트 리스너
    if (decreaseButton) {
        decreaseButton.addEventListener('click', decreaseQuantity);
    }

    // 수량 증가 버튼 이벤트 리스너
    if (increaseButton) {
        increaseButton.addEventListener('click', increaseQuantity);
    }

    // 초기 총 가격 설정
    if (quantityInput && totalPriceAmount && productDetail) {
        updateTotalPrice();
    }

    // 장바구니 담기 버튼 클릭 이벤트
    if (addToCartButton) {
        addToCartButton.addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            
            // 장바구니에 아이템 추가
            const cartKey = getCurrentCartKey();
            let cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
            
            // 이미 있는 아이템인지 확인
            const existingItemIndex = cartItems.findIndex(item => item.id === productDetail.id);
            
            if (existingItemIndex > -1) {
                // 이미 있는 아이템이면 수량만 업데이트
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // 새로운 아이템이면 추가
                cartItems.push({
                    id: productDetail.id,
                    name: productDetail.name,
                    price: productDetail.price,
                    quantity: quantity,
                    image: productDetail.image
                });
            }
            
            // 장바구니 업데이트
            localStorage.setItem(cartKey, JSON.stringify(cartItems));
            
            // GA4 이벤트 추적
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
            
            // 팝업 표시
            showPopup();
        });
    }

    // 바로 구매하기 버튼 클릭 이벤트
    if (buyNowButton) {
        buyNowButton.addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            
            // 장바구니에 아이템 추가
            const cartKey = getCurrentCartKey();
            let cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
            
            // 이미 있는 아이템인지 확인
            const existingItemIndex = cartItems.findIndex(item => item.id === productDetail.id);
            
            if (existingItemIndex > -1) {
                // 이미 있는 아이템이면 수량만 업데이트
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // 새로운 아이템이면 추가
                cartItems.push({
                    id: productDetail.id,
                    name: productDetail.name,
                    price: productDetail.price,
                    quantity: quantity,
                    image: productDetail.image
                });
            }
            
            // 장바구니 업데이트
            localStorage.setItem(cartKey, JSON.stringify(cartItems));
            
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
            
            // 장바구니 페이지로 이동
            window.location.href = getCurrentCartPage();
        });
    }

    // 장바구니 팝업 버튼 이벤트 리스너
    if (continueShoppingButton) {
        continueShoppingButton.addEventListener('click', closePopup);
    }

    if (goToCartButton) {
        goToCartButton.addEventListener('click', goToCart);
    }

    // 장바구니 아이콘 클릭 이벤트
    if (cartIcon) {
        cartIcon.addEventListener('click', goToCart);
    }

    // 수량 입력 필드 이벤트 리스너
    if (quantityInput) {
        quantityInput.addEventListener('change', handleQuantityInput);
    }

    // 수량 감소 버튼 이벤트 리스너
    if (decreaseButton) {
        decreaseButton.addEventListener('click', decreaseQuantity);
    }

    // 수량 증가 버튼 이벤트 리스너
    if (increaseButton) {
        increaseButton.addEventListener('click', increaseQuantity);
    }

    // 초기 총 가격 설정
    if (quantityInput && totalPriceAmount && productDetail) {
        updateTotalPrice();
    }

    // 장바구니 담기 버튼 클릭 이벤트
    if (addToCartButton) {
        addToCartButton.addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            
            // 장바구니에 아이템 추가
            const cartKey = getCurrentCartKey();
            let cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
            
            // 이미 있는 아이템인지 확인
            const existingItemIndex = cartItems.findIndex(item => item.id === productDetail.id);
            
            if (existingItemIndex > -1) {
                // 이미 있는 아이템이면 수량만 업데이트
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // 새로운 아이템이면 추가
                cartItems.push({
                    id: productDetail.id,
                    name: productDetail.name,
                    price: productDetail.price,
                    quantity: quantity,
                    image: productDetail.image
                });
            }
            
            // 장바구니 업데이트
            localStorage.setItem(cartKey, JSON.stringify(cartItems));
            
            // GA4 이벤트 추적
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
            
            // 팝업 표시
            showPopup();
        });
    }

    // 바로 구매하기 버튼 클릭 이벤트
    if (buyNowButton) {
        buyNowButton.addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            
            // 장바구니에 아이템 추가
            const cartKey = getCurrentCartKey();
            let cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
            
            // 이미 있는 아이템인지 확인
            const existingItemIndex = cartItems.findIndex(item => item.id === productDetail.id);
            
            if (existingItemIndex > -1) {
                // 이미 있는 아이템이면 수량만 업데이트
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // 새로운 아이템이면 추가
                cartItems.push({
                    id: productDetail.id,
                    name: productDetail.name,
                    price: productDetail.price,
                    quantity: quantity,
                    image: productDetail.image
                });
            }
            
            // 장바구니 업데이트
            localStorage.setItem(cartKey, JSON.stringify(cartItems));
            
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
            
            // 장바구니 페이지로 이동
            window.location.href = getCurrentCartPage();
        });
    }

    // 장바구니 팝업 버튼 이벤트 리스너
    if (continueShoppingButton) {
        continueShoppingButton.addEventListener('click', closePopup);
    }

    if (goToCartButton) {
        goToCartButton.addEventListener('click', goToCart);
    }
});

// 전역 함수로 등록
window.goToCart = goToCart;
window.goToMainPage = goToMainPage;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.handleQuantityInput = handleQuantityInput;
window.showPopup = showPopup;
window.closePopup = closePopup;
window.updateTotalPrice = updateTotalPrice;

// 전역 함수로 등록
window.goToCart = goToCart;
window.goToMainPage = goToMainPage;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.handleQuantityInput = handleQuantityInput;
window.showPopup = showPopup;
window.closePopup = closePopup;
window.updateTotalPrice = updateTotalPrice; 