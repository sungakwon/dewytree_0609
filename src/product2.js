// MOVE FILE TO src/product2.js

// 제품 클릭 이벤트 핸들러
function handleProductClick(productId, productName, price) {
    gtag('event', 'select_item', {
        currency: 'KRW',
        value: price,
        items: [{
            item_id: productId,
            item_name: productName,
            price: price,
            currency: 'KRW'
        }]
    });
}

// hash만 사용하는 버전 판별 함수 (index2 계열)
function getCurrentVersion() {
    if (window.location.hash === '#version-b') return 'B';
    return 'A';
}

// 제품 카드에 클릭 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');
            const price = parseInt(this.getAttribute('data-price'));
            handleProductClick(productId, productName, price);
        });
    });
}); 