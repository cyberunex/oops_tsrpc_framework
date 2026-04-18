// 全局 JavaScript - 主题切换、语言切换、通用功能

// 主题管理
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.bindEvents();
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.updateIcons();
    }

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateIcons() {
        const themeIcons = document.querySelectorAll('[data-theme-icon]');
        themeIcons.forEach(icon => {
            if (this.currentTheme === 'light') {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
        });
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="toggle-theme"]')) {
                e.preventDefault();
                this.toggle();
            }
        });
    }
}

// 语言管理
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'zh-CN';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.bindEvents();
    }

    async loadLanguage(lang) {
        try {
            const pageName = this.getPageName();
            const response = await fetch(`data/${pageName}_${lang}.json`);
            if (response.ok) {
                this.translations = await response.json();
                this.applyTranslations();
            } else {
                // 加载默认语言包
                await this.loadLanguage('zh-CN');
            }
        } catch (error) {
            console.log('Language file not found, using defaults');
        }
    }

    getPageName() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = this.translations[key];
                } else {
                    element.textContent = this.translations[key];
                }
            }
        });
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        this.loadLanguage(lang);
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const langSwitch = e.target.closest('[data-lang]');
            if (langSwitch) {
                e.preventDefault();
                const lang = langSwitch.getAttribute('data-lang');
                this.setLanguage(lang);
            }
        });
    }

    t(key) {
        return this.translations[key] || key;
    }
}

// 回到顶部功能
class ScrollToTop {
    constructor() {
        this.button = document.querySelector('[data-action="scroll-top"]');
        if (this.button) {
            this.init();
        }
    }

    init() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.button.style.display = 'flex';
            } else {
                this.button.style.display = 'none';
            }
        });

        this.button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// 客服聊天功能
class ChatSupport {
    constructor() {
        this.messages = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChatHistory();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="send-message"]')) {
                this.sendMessage();
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.matches('#chatInput')) {
                this.sendMessage();
            }
        });
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            
            // 模拟自动回复
            setTimeout(() => {
                this.addMessage('感谢您的咨询，客服人员将尽快回复您。', 'support');
            }, 1000);
        }
    }

    addMessage(text, type) {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.saveChatHistory();
    }

    saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.messages));
    }

    loadChatHistory() {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            this.messages = JSON.parse(history);
            const messagesContainer = document.querySelector('.chat-messages');
            if (messagesContainer) {
                this.messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `chat-message ${msg.type}`;
                    messageDiv.textContent = msg.text;
                    messagesContainer.appendChild(messageDiv);
                });
            }
        }
    }
}

// 分页组件
class Pagination {
    constructor(container, options = {}) {
        this.container = container;
        this.currentPage = options.currentPage || 1;
        this.totalPages = options.totalPages || 1;
        this.itemsPerPage = options.itemsPerPage || 10;
        this.onPageChange = options.onPageChange || (() => {});
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        if (!this.container) return;

        let html = '<nav><ul class="pagination justify-content-center">';
        
        // 上一页
        html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link glass-page" href="#" data-page="${this.currentPage - 1}">«</a></li>`;

        // 页码
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `<li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link glass-page" href="#" data-page="${i}">${i}</a></li>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // 下一页
        html += `<li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
            <a class="page-link glass-page" href="#" data-page="${this.currentPage + 1}">»</a></li>`;

        html += '</ul></nav>';
        this.container.innerHTML = html;

        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.getAttribute('data-page'));
                if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
                    this.currentPage = page;
                    this.onPageChange(page);
                    this.render();
                }
            });
        });
    }
}

// 数据加载工具
class DataLoader {
    static async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading JSON:', error);
            return null;
        }
    }

    static async loadPageData(pageName, lang = 'zh-CN') {
        return await this.loadJSON(`data/${pageName}_${lang}.json`);
    }
}

// 用户认证管理（后台）
class AuthManager {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    isLoggedIn() {
        return this.user !== null;
    }

    login(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        this.user = userData;
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.user = null;
    }

    getUser() {
        return this.user;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.languageManager = new LanguageManager();
    window.scrollToTop = new ScrollToTop();
    window.chatSupport = new ChatSupport();
    window.authManager = new AuthManager();
});

// 导出供其他页面使用
window.ThemeManager = ThemeManager;
window.LanguageManager = LanguageManager;
window.Pagination = Pagination;
window.DataLoader = DataLoader;
window.AuthManager = AuthManager;
