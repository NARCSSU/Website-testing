/**
 * 主题管理模块
 * 负责处理网站深浅色主题的切换和系统主题检测
 */
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.initTheme();
        this.bindThemeToggleEvents();
        this.watchSystemTheme();
    }

    /**
     * 初始化主题
     */
    initTheme() {
        const savedTheme = localStorage.getItem('siteTheme');
        
        if (savedTheme === 'dark') {
            this.setDarkTheme();
        } else if (savedTheme === 'light') {
            this.setLightTheme();
        } else {
            // 没有保存设置，让 CSS 自动处理
            this.letCSSHandleTheme();
        }
    }

    /**
     * 让 CSS 自动处理主题
     */
    letCSSHandleTheme() {
        // 移除手动主题类，让 CSS 媒体查询生效
        document.body.classList.remove('dark-theme');
        document.documentElement.style.colorScheme = '';
        
        // 根据当前实际样式更新按钮
        setTimeout(() => {
            const isDark = this.isCurrentlyDark();
            this.updateThemeButton(isDark);
        }, 100);
    }

    /**
     * 检测当前是否为深色主题
     */
    isCurrentlyDark() {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        const bgColor = computedStyle.backgroundColor;
        
        // 检查背景色是否为深色
        if (bgColor.includes('rgb(15, 23, 42)') || bgColor.includes('rgb(30, 41, 59)')) {
            return true;
        }
        
        // 检查是否有深色主题类
        return body.classList.contains('dark-theme');
    }

    /**
     * 绑定主题切换事件
     */
    bindThemeToggleEvents() {
        const themeButton = document.querySelector('.theme-toggle-btn');
        if (themeButton) {
            themeButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            // 从深色切换到浅色
            this.setLightTheme();
            localStorage.setItem('siteTheme', 'light');
        } else {
            // 从浅色切换到深色
            this.setDarkTheme();
            localStorage.setItem('siteTheme', 'dark');
        }
    }

    /**
     * 更新主题按钮图标
     */
    updateThemeButton(isDark) {
        const themeButton = document.querySelector('.theme-toggle-btn');
        if (themeButton) {
            const icon = themeButton.querySelector('i');
            
            if (isDark) {
                icon.className = 'fas fa-sun';
                themeButton.title = '切换到浅色主题';
            } else {
                icon.className = 'fas fa-moon';
                themeButton.title = '切换到深色主题';
            }
        }
    }

    /**
     * 设置深色主题
     */
    setDarkTheme() {
        document.documentElement.style.colorScheme = 'dark';
        document.body.classList.add('dark-theme');
        this.updateThemeButton(true);
    }

    /**
     * 设置浅色主题
     */
    setLightTheme() {
        document.documentElement.style.colorScheme = 'light';
        document.body.classList.remove('dark-theme');
        this.updateThemeButton(false);
    }

    /**
     * 监听系统主题变化
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // 系统主题变化时，总是跟随系统变化
                // 清除手动设置，让网页跟随系统
                localStorage.removeItem('siteTheme');
                
                if (e.matches) {
                    // 系统切换到深色
                    this.setDarkTheme();
                } else {
                    // 系统切换到浅色
                    this.setLightTheme();
                }
            });
        }
    }

    /**
     * 获取当前主题状态
     */
    getCurrentTheme() {
        return this.isCurrentlyDark() ? 'dark' : 'light';
    }

    /**
     * 强制设置主题（不保存到localStorage）
     */
    forceSetTheme(theme) {
        if (theme === 'dark') {
            this.setDarkTheme();
        } else {
            this.setLightTheme();
        }
    }

    /**
     * 清除保存的主题设置
     */
    clearSavedTheme() {
        localStorage.removeItem('siteTheme');
        this.letCSSHandleTheme();
    }
}

// 导出类（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

// 如果在浏览器环境中，创建全局实例
if (typeof window !== 'undefined') {
    window.ThemeManager = ThemeManager;
}

