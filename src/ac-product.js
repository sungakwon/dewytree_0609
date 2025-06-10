console.log('ac-product.js is running');
// MOVE FILE TO src/ac-product.js

// 메인 페이지로 이동하는 함수
function goToMainPage() {
    const currentVersion = sessionStorage.getItem('currentVersion');
    if (currentVersion === 'a') {
        window.location.href = 'index1.html';
    } else {
        window.location.href = 'index2.html';
    }
}

// 제품 상세 페이지로 이동하는 함수
window.navigateToProduct = function(url) {
    const currentVersion = sessionStorage.getItem('currentVersion');
    let targetUrl = url;
    targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'v=' + (currentVersion === 'a' ? '1' : '2');
    window.location.href = targetUrl;
};

// 버전에 따라 컨텐츠 표시
function showVersionContent() {
    const hash = window.location.hash;
    const versionA = document.getElementById('version-a-content');
    const versionB = document.getElementById('version-b-content');
    
    if (hash === '#version-b') {
        versionA.style.display = 'none';
        versionB.style.display = 'block';
        sessionStorage.setItem('currentVersion', 'b');
    } else {
        versionA.style.display = 'block';
        versionB.style.display = 'none';
        sessionStorage.setItem('currentVersion', 'a');
    }
}

// 페이지 로드 및 해시 변경 시 컨텐츠 업데이트
window.addEventListener('load', showVersionContent);
window.addEventListener('hashchange', showVersionContent);

// 모든 제품 링크에 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href*="detail.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToProduct(this.href);
        });
    });
});

function getCurrentVersion() {
    if (window.location.hash === '#version-b') return 'B';
    return 'A';
}

function goToCart() {
    const currentVersion = sessionStorage.getItem('currentVersion');
    if (currentVersion === 'a') {
        window.location.href = 'cart.html';
    } else {
        window.location.href = 'cart2.html';
    }
}

// New functions to add:
function goToBrandPage() {
    const currentVersion = sessionStorage.getItem('currentVersion');
    if (currentVersion === 'a') {
        window.location.href = 'brand.html';
    } else {
        window.location.href = 'brand2.html';
    }
}
window.goToBrandPage = goToBrandPage;

function goToProductListPage() {
    const currentVersion = sessionStorage.getItem('currentVersion');
    if (currentVersion === 'a') {
        window.location.href = 'product.html';
    } else {
        window.location.href = 'product2.html';
    }
}
window.goToProductListPage = goToProductListPage;

function goToBestPage() {
    const currentVersion = sessionStorage.getItem('currentVersion');
    if (currentVersion === 'a') {
        window.location.href = 'best.html';
    } else {
        window.location.href = 'best2.html';
    }
}
window.goToBestPage = goToBestPage;

window.goToMainPage = goToMainPage;
window.goToCart = goToCart; 