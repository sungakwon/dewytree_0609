function navigateToProduct(url, productInfo) {
    // GA4 상품 클릭 이벤트
    gtag('event', 'select_item', {
        items: [{
            item_id: productInfo.id,
            item_name: productInfo.name,
            price: productInfo.price,
            currency: 'KRW'
        }]
    });
    window.location.href = url;
}

function goToMainPage() {
    window.location.href = 'index2.html';
}

function goToCart() {
    window.location.href = 'cart2.html';
}

window.goToMainPage = goToMainPage;
window.goToCart = goToCart;

document.addEventListener('DOMContentLoaded', function() {
    // 모든 구매하기 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productInfo = {
                id: 'AMINO-LINE',
                name: 'HI AMINO 라인',
                price: 0
            };
            navigateToProduct(this.getAttribute('href'), productInfo);
        });
    });
}); 