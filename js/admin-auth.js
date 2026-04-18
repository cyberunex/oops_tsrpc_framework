// 后台管理认证脚本
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true' && window.location.pathname.includes('login.html')) {
        // 如果已登录且在登录页，跳转到仪表盘
        // window.location.href = 'dashboard.html';
    }

    // 登录表单处理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // 模拟登录验证（实际项目中应调用后端 API）
            if (username && password) {
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUser', JSON.stringify({
                    username: username,
                    email: username + '@example.com',
                    avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username)
                }));
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                alert('登录成功！');
                window.location.href = 'dashboard.html';
            }
        });
    }

    // 注册表单处理
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;

            if (password !== confirmPassword) {
                alert('两次输入的密码不一致！');
                return;
            }

            // 模拟注册（实际项目中应调用后端 API）
            localStorage.setItem('registeredUser', JSON.stringify({
                username: username,
                email: email
            }));
            
            alert('注册成功！请登录');
            document.getElementById('login-tab').click();
        });
    }

    // 退出登录功能（在其他页面使用）
    window.logout = function() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
    };
});
