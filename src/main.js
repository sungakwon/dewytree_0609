// 50% 확률로 index1.html이나 index2.html로 리디렉션하는 함수
function redirectToRandomPage() {
    try {
        // 50% 확률로 랜덤 숫자 생성 (0 또는 1)
        const random = Math.floor(Math.random() * 2);
        
        // 0이면 index1.html, 1이면 index2.html로 이동
        const targetPage = random === 0 ? 'index1.html' : 'index2.html';
        
        // 페이지 이동
        window.location.href = targetPage;
        
        console.log(`리디렉션: ${targetPage}`);
    } catch (error) {
        console.error('리디렉션 중 오류 발생:', error);
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 50% 확률로 다른 페이지로 리디렉션
        redirectToRandomPage();
    } catch (error) {
        console.error('페이지 초기화 중 오류 발생:', error);
    }
});