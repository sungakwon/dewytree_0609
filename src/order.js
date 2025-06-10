let selectedPaymentMethod = '';
let orderItems = [];

// 배송 정보 자동 입력
function fillDeliveryInfo() {
    // localStorage에서 배송 정보 불러오기
    const savedDeliveryInfo = JSON.parse(localStorage.getItem('deliveryInfo'));
    
    // 기본 배송 정보
    const defaultDeliveryInfo = {
        receiverName: '홍길동',
        phone1: '010',
        phone2: '1234',
        phone3: '5678',
        postcode: '06134',
        address1: '서울시 강남구 테헤란로',
        address2: '123-45',
        deliveryRequest: '부재시 경비실에 맡겨주세요'
    };

    // localStorage에 저장된 정보가 있으면 그것을 사용하고, 없으면 기본값 사용
    const deliveryInfo = savedDeliveryInfo || defaultDeliveryInfo;
    
    document.getElementById('receiver-name').value = deliveryInfo.receiverName;
    document.getElementById('phone1').value = deliveryInfo.phone1;
    document.getElementById('phone2').value = deliveryInfo.phone2;
    document.getElementById('phone3').value = deliveryInfo.phone3;
    document.getElementById('postcode').value = deliveryInfo.postcode;
    document.getElementById('address1').value = deliveryInfo.address1;
    document.getElementById('address2').value = deliveryInfo.address2;
    document.getElementById('delivery-request').value = deliveryInfo.deliveryRequest;
    
    // 사용한 배송 정보는 삭제
    localStorage.removeItem('deliveryInfo');
}

// URL에서 주문 데이터 가져오기
function getOrderDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderData = urlParams.get('orderData');
    return orderData ? JSON.parse(decodeURIComponent(orderData)) : [];
}

// 주문 상품 목록 렌더링
function renderOrderItems() {
    const orderItemsList = document.getElementById('orderItemsList');
    orderItems = getOrderDataFromURL();
    let subtotal = 0;

    orderItemsList.innerHTML = '';
    orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <img src="${item.image.startsWith('/') ? item.image.slice(1) : item.image}" alt="${item.name}" class="item-image">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price.toLocaleString()}원 × ${item.quantity}개</div>
                <div class="item-total">${(item.price * item.quantity).toLocaleString()}원</div>
            </div>
        `;
        orderItemsList.appendChild(itemElement);
    });

    // 금액 업데이트
    const shipping = subtotal >= 19800 ? 0 : 3000;
    document.getElementById('subtotal').textContent = subtotal.toLocaleString() + '원';
    document.getElementById('shipping').textContent = shipping.toLocaleString() + '원';
    document.getElementById('total').textContent = (subtotal + shipping).toLocaleString() + '원';
}

// 결제 수단 선택
function selectPaymentMethod(element, method) {
    const methods = document.querySelectorAll('.payment-method');
    methods.forEach(m => m.classList.remove('selected'));
    element.classList.add('selected');
    selectedPaymentMethod = method;
}

// 주문 처리
function processOrder() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) {
        alert('결제 수단을 선택해주세요.');
        return;
    }

    // 결제 완료 팝업 표시
    showPaymentComplete();
}

// 결제 완료 팝업 표시
function showPaymentComplete() {
    const paymentItemsList = document.getElementById('paymentItemsList');
    const paymentTotal = document.getElementById('paymentTotal');
    let subtotal = 0;

    // 결제 상품 목록 생성
    paymentItemsList.innerHTML = '';
    orderItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'payment-item';
        itemElement.innerHTML = `
            <img src="${item.image.startsWith('/') ? item.image.slice(1) : item.image}" alt="${item.name}">
            <div class="payment-item-info">
                <div class="payment-item-name">${item.name}</div>
                <div class="payment-item-quantity">수량: ${item.quantity}개</div>
                <div class="payment-item-price">${(item.price * item.quantity).toLocaleString()}원</div>
            </div>
        `;
        paymentItemsList.appendChild(itemElement);
    });

    // 총 결제 금액 표시
    const shipping = subtotal >= 19800 ? 0 : 3000;
    const total = subtotal + shipping;
    paymentTotal.innerHTML = `
        <div>상품금액: ${subtotal.toLocaleString()}원</div>
        <div>배송비: ${shipping.toLocaleString()}원</div>
        <div style="margin-top: 10px; font-size: 20px;">총 결제금액: ${total.toLocaleString()}원</div>
    `;

    // 팝업 표시
    document.getElementById('paymentCompleteOverlay').style.display = 'flex';
}

// 홈으로 이동
function goToHome() {
    // 장바구니 비우기
    localStorage.removeItem('cartItems');
    // 홈으로 이동
    window.location.href = 'index.html';
}

// 페이지 로드 시 실행
window.addEventListener('load', function() {
    renderOrderItems();  // 주문 정보 표시
    fillDeliveryInfo();  // 배송 정보 자동 입력
    // 결제 수단 선택 시 결제하기 버튼 활성화
    const paymentInputs = document.querySelectorAll('input[name="payment"]');
    const orderButton = document.getElementById('orderButton');

    paymentInputs.forEach(input => {
        input.addEventListener('change', function() {
            orderButton.disabled = false;
        });
    });
});

function searchAddress() {
    // 여기에 주소 검색 API 연동 코드가 들어갈 예정입니다
    alert('주소 검색 기능은 현재 준비중입니다.');
} 