(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const v = urlParams.get('v');
    if (v === '1') {
        sessionStorage.setItem('currentVersion', 'a');
    } else if (v === '2') {
        sessionStorage.setItem('currentVersion', 'b');
    }
})();

let selectedPrice = window.productDetail.price;
const quantityInput = document.getElementById('quantity');
const totalPriceAmount = document.querySelector('.total-price-amount');

// 페이지 로드 시 상품 조회 이벤트
window.addEventListener('load', function() {
    gtag('event', 'view_item', {
        currency: 'KRW',
        value: selectedPrice,
        items: [{
            item_id: window.productDetail.id,
            item_name: window.productDetail.name,
            price: selectedPrice,
            currency: 'KRW',
            quantity: 1
        }]
    });
});

function updateQuantity(change) {
    let quantity = parseInt(quantityInput.value);
    const pricePerItem = selectedPrice;

    quantity = Math.max(1, quantity + change);
    quantityInput.value = quantity;
    
    const totalPrice = (quantity * pricePerItem).toLocaleString() + '원';
    totalPriceAmount.textContent = totalPrice;
}

// 초기 총 금액 설정
updateQuantity(0);

// 장바구니 담기 버튼 클릭 이벤트
document.querySelector('.add-to-cart-button').addEventListener('click', function() {
    const quantity = parseInt(quantityInput.value);
    const item = {
        name: window.productDetail.name,
        price: selectedPrice,
        quantity: quantity,
        image: window.productDetail.image,
        id: window.productDetail.id  // 상품 ID 추가
    };

    // GA4 이벤트 트래킹
    gtag('event', 'add_to_cart', {
        currency: 'KRW',
        value: selectedPrice * quantity,
        items: [{
            item_id: window.productDetail.id,
            item_name: item.name,
            price: selectedPrice,
            currency: 'KRW',
            quantity: quantity
        }]
    });

    // 장바구니에 아이템 추가
    const cartItems = JSON.parse(localStorage.getItem(getCurrentCartKey())) || [];
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity += item.quantity;
    } else {
        cartItems.push(item);
    }
    
    localStorage.setItem(getCurrentCartKey(), JSON.stringify(cartItems));
    showPopup();
});

// 바로 구매하기 버튼 클릭 이벤트
document.querySelector('.buy-now-button').addEventListener('click', function() {
    const quantity = parseInt(quantityInput.value);
    
    // GA4 구매 시작 이벤트
    gtag('event', 'begin_checkout', {
        currency: 'KRW',
        value: selectedPrice * quantity,
        items: [{
            item_id: window.productDetail.id,
            item_name: window.productDetail.name,
            price: selectedPrice,
            currency: 'KRW',
            quantity: quantity
        }]
    });

    const deliveryInfo = {
        receiverName: '홍길동',
        phone1: '010',
        phone2: '1234',
        phone3: '5678',
        postcode: '06134',
        address1: '서울시 강남구 테헤란로',
        address2: '123-45',
        deliveryRequest: '부재시 경비실에 맡겨주세요'
    };
    
    localStorage.setItem('deliveryInfo', JSON.stringify(deliveryInfo));

    const item = {
        name: window.productDetail.name,
        price: selectedPrice,
        quantity: quantity,
        image: window.productDetail.image
    };
    
    const orderData = encodeURIComponent(JSON.stringify([item]));
    window.location.href = `order.html?orderData=${orderData}`;
});

function showPopup() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('cartPopup').style.display = 'block';
}

function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('cartPopup').style.display = 'none';
}

function goToCart() {
    // index1.html에서 항상 cart.html로 이동
    if (location.pathname.includes('index1.html') || sessionStorage.getItem('currentVersion') === 'a') {
        window.location.href = 'cart.html';
    } else {
        window.location.href = 'cart2.html';
    }
}

// 현재 버전 확인 (URL 또는 sessionStorage에서)
function getCurrentVersionFromUrlOrSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlVersion = urlParams.get('v');
    console.log('Debug: URL Version from URL Params:', urlVersion);
    if (urlVersion) {
        console.log('Debug: Version from URL:', urlVersion);
        return urlVersion;
    }

    const sessionVersion = sessionStorage.getItem('currentVersion');
    console.log('Debug: Version from sessionStorage:', sessionVersion);
    if (sessionVersion) {
        console.log('Debug: Version from sessionStorage (mapped):', sessionVersion === 'a' ? '1' : '2');
        // Map 'a' to '1' and 'b' to '2' for compatibility with existing 'v' logic
        return sessionVersion === 'a' ? '1' : '2';
    }

    // Default or fallback if no version found (e.g., direct access without version)
    console.log('Debug: No version found, defaulting to 1 (cart.html).');
    return '1'; // 기본값 설정 (index1.html의 기본 동작)
}

// 메인 페이지로 이동
function goToMainPage() {
    const currentVersion = getCurrentVersionFromUrlOrSession();
    if (currentVersion === '1') {
        window.location.href = 'index1.html';
    } else {
        window.location.href = 'index2.html';
    }
}

// 페이지 로드 시 현재 버전 저장
window.addEventListener('load', function() {
    const version = getCurrentVersionFromUrlOrSession();
    localStorage.setItem('selectedVersion', version);
});

function getCurrentCartKey() {
    const version = getCurrentVersionFromUrlOrSession();
    return version === '1' ? 'cartItemsA' : 'cartItemsB';
}

function getCurrentCartPage() {
    const version = getCurrentVersionFromUrlOrSession();
    return version === '1' ? 'cart.html' : 'cart2.html';
} 