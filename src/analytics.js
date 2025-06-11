// GA4 이벤트 추적 함수
function trackGA4Event(eventName, eventParams) {
    if (typeof gtag === 'function') {
        try {
            gtag('event', eventName, eventParams);
        } catch (error) {
            console.error('GA4 이벤트 추적 중 오류 발생:', error);
        }
    } else {
        console.log('GA4 추적을 건너뜁니다. gtag 함수가 존재하지 않습니다.');
    }
}

// 장바구니 관련 이벤트 추적
function trackAddToCart(product) {
    trackGA4Event('add_to_cart', {
        currency: 'KRW',
        value: product.price,
        items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: 1
        }]
    });
}

function trackBeginCheckout(total) {
    trackGA4Event('begin_checkout', {
        currency: 'KRW',
        value: total
    });
}

// 페이지 뷰 추적
function trackPageView() {
    trackGA4Event('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
}

// 수량 변경 이벤트 추적
function trackQuantityChange(product, newQuantity) {
    trackGA4Event('quantity_change', {
        currency: 'KRW',
        value: product.price * newQuantity,
        items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: newQuantity
        }]
    });
}

// 수량 제거 이벤트 추적
function trackRemoveItem(product) {
    trackGA4Event('remove_from_cart', {
        currency: 'KRW',
        value: product.price,
        items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: 1
        }]
    });
}

// 모듈 내보내기
export {
    trackGA4Event,
    trackAddToCart,
    trackBeginCheckout,
    trackPageView,
    trackQuantityChange,
    trackRemoveItem
};
