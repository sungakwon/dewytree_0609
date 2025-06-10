// Google Analytics 설정
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-VFQZ1B9D87');

// 상품 클릭 이벤트 처리
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

// 버전 저장
function saveVersion(version) {
    localStorage.setItem('selectedVersion', version);
}

// 페이지 로드 시 Version A 스타일 강제 적용
window.onload = function() {
    const heroSection = document.querySelector('.hero-section');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const ctaButton = document.querySelector('.cta-button');

    // 배경색 강제 적용
    heroSection.style.cssText = `
        background-color: #f4ffed !important;
        background: #f4ffed !important;
        background-image: none !important;
    `;

    // 텍스트 색상 강제 적용
    heroTitle.style.cssText = `
        color: #a8d954 !important;
        font-weight: 700 !important;
    `;

    heroSubtitle.style.cssText = `
        color: #666 !important;
        font-weight: 400 !important;
    `;

    ctaButton.style.cssText = `
        background-color: #a8d954 !important;
        color: white !important;
    `;
}

// 구매하기 버튼 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 모든 구매하기 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productInfo = {
                id: productCard.dataset.productId || 'unknown',
                name: productCard.querySelector('h3').textContent,
                price: parseInt(productCard.dataset.price || '0')
            };
            navigateToProduct(this.getAttribute('href'), productInfo);
        });
    });
}); 