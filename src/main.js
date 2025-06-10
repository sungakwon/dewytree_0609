import './style.css'

// 랜덤하게 버전을 선택하는 함수
function getRandomVersion() {
    return Math.random() < 0.5; // true면 version A, false면 version B
}

// 버전을 설정하는 함수
function setVersion() {
    const body = document.body;
    const versionBContent = document.querySelector('.version-b-content');
    
    // 항상 Version B 설정
    body.classList.add('version-b');
    body.classList.remove('version-a');
    versionBContent.style.display = 'block';
    console.log('Version B(AMINO 라인)가 표시됩니다.');
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 항상 Version B로 설정
    setVersion();

    // 구매하기 버튼 클릭 시 버전 정보 저장
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', (e) => {
            console.log('구매하기 버튼 클릭 - Version B');
            localStorage.setItem('selectedVersion', 'B');
        });
    });
});

// A/B 테스트를 위한 랜덤 리다이렉션
document.addEventListener('DOMContentLoaded', function() {
    // 테스트를 위한 카운터 (localStorage 사용)
    let countA = parseInt(localStorage.getItem('versionACount') || '0');
    let countB = parseInt(localStorage.getItem('versionBCount') || '0');
    
    // 50:50 확률로 A 또는 B 버전으로 리다이렉션
    const isVersionA = Math.random() < 0.5;
    const version = isVersionA ? 'index1.html' : 'index2.html';
    
    // 카운터 증가 및 저장
    if (isVersionA) {
        localStorage.setItem('versionACount', ++countA);
    } else {
        localStorage.setItem('versionBCount', ++countB);
    }
    
    // 바로 리다이렉션
    window.location.href = version;
});

// 카운터 초기화 함수 (필요시 콘솔에서 resetCounts() 호출)
window.resetCounts = function() {
    localStorage.removeItem('versionACount');
    localStorage.removeItem('versionBCount');
    alert('카운터가 초기화되었습니다.');
};
