/**
 * 导航管理模块
 * 负责处理导航栏的所有交互功能
 */
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        // 延迟初始化，确保DOM完全加载
        setTimeout(() => {
            this.initHamburgerMenu();
            this.initDropdowns();
            this.initScrollEffects();
            this.initSmoothScroll();
        }, 100);
    }

    // 初始化汉堡菜单功能
    initHamburgerMenu() {
        const menuButton = document.querySelector('.menu-button');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuButton && navLinks) {
            menuButton.addEventListener('click', function() {
                navLinks.classList.toggle('responsive');
            });
        }
    }

    // 初始化下拉菜单功能
    initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                let isOpen = false;
                let hoverTimeout = null;
                let isProcessing = false;
                
                // 显示菜单
                const showMenu = () => {
                    if (isProcessing) return;
                    isProcessing = true;
                    
                    if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                        hoverTimeout = null;
                    }
                    menu.style.opacity = '1';
                    menu.style.visibility = 'visible';
                    menu.style.transform = 'scaleY(1)';
                    isOpen = true;
                    
                    setTimeout(() => {
                        isProcessing = false;
                    }, 100);
                };
                
                // 隐藏菜单
                const hideMenu = () => {
                    if (isProcessing) return;
                    isProcessing = true;
                    
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                    menu.style.transform = 'scaleY(0.8)';
                    isOpen = false;
                    
                    setTimeout(() => {
                        isProcessing = false;
                    }, 100);
                };
                
                // 延迟隐藏菜单（用于桌面端鼠标悬停）
                const delayedHideMenu = () => {
                    hoverTimeout = setTimeout(() => {
                        if (!isOpen) return;
                        hideMenu();
                    }, 150);
                };
                
                // 检测是否为移动端（更准确的检测）
                const isMobile = () => {
                    return window.innerWidth <= 846 || 
                           ('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0);
                };
                
                // 桌面端鼠标事件（仅在非移动端启用）
                if (!isMobile()) {
                    dropdown.addEventListener('mouseenter', showMenu);
                    dropdown.addEventListener('mouseleave', delayedHideMenu);
                }
                
                // 移动端触摸事件
                toggle.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (isOpen) {
                        hideMenu();
                    } else {
                        showMenu();
                    }
                });
                
                // 点击事件（移动端和桌面端都支持）
                toggle.addEventListener('click', (e) => {
                    // 在移动端，点击切换菜单状态
                    if (isMobile()) {
                        e.preventDefault();
                        if (isOpen) {
                            hideMenu();
                        } else {
                            showMenu();
                        }
                    }
                    // 在桌面端，如果菜单已打开则关闭（防止重复打开）
                    else if (isOpen) {
                        e.preventDefault();
                        hideMenu();
                    }
                });
                
                // 监听窗口大小变化，动态切换行为
                window.addEventListener('resize', () => {
                    // 移除所有事件监听器
                    dropdown.removeEventListener('mouseenter', showMenu);
                    dropdown.removeEventListener('mouseleave', delayedHideMenu);
                    
                    // 根据当前屏幕大小重新添加事件
                    if (!isMobile()) {
                        dropdown.addEventListener('mouseenter', showMenu);
                        dropdown.addEventListener('mouseleave', delayedHideMenu);
                    }
                });
                
                // 点击外部区域关闭菜单
                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target) && isOpen) {
                        hideMenu();
                    }
                });
                
                // 触摸外部区域关闭菜单
                document.addEventListener('touchstart', (e) => {
                    if (!dropdown.contains(e.target) && isOpen) {
                        hideMenu();
                    }
                });
            }
        });
    }

    // 初始化滚动效果
    initScrollEffects() {
        const nav = document.querySelector('nav');
        
        // 检查nav元素是否存在
        if (!nav) {
            console.warn('导航栏元素未找到，跳过滚动效果初始化');
            return;
        }
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // 初始化平滑滚动
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// 导出类（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}

// 如果在浏览器环境中，创建全局实例
if (typeof window !== 'undefined') {
    window.NavigationManager = NavigationManager;
}