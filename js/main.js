/**
 * 主入口文件
 * 协调各个模块的初始化和页面特定的功能
 */

// 全局变量
let navigationManager;
let newsManager;
let backgroundSlider;
let versionManager;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化各模块');
    
    // 初始化通用模块
    initCommonModules();
    
    // 根据页面类型初始化特定功能
    initPageSpecificFeatures();
    
    console.log('所有模块初始化完成');
});

// 初始化通用模块
function initCommonModules() {
    // 初始化导航管理器
    navigationManager = new NavigationManager();
    
    // 初始化版本管理器
    versionManager = new VersionManager();
    
    console.log('通用模块初始化完成');
}

// 根据页面类型初始化特定功能
function initPageSpecificFeatures() {
    const currentPath = window.location.pathname;
    const currentFile = window.location.pathname.split('/').pop();
    
    console.log('当前路径:', currentPath);
    console.log('当前文件:', currentFile);
    
    if (currentPath.includes('news.html') || currentFile === 'news.html' || currentFile === 'debug-news.html') {
        // 新闻列表页面
        initNewsPage();
    } else if (currentPath.includes('news-detail.html') || currentFile === 'news-detail.html') {
        // 新闻详情页面
        initNewsDetailPage();
    } else if (currentPath === '/' || currentPath.includes('index.html') || currentFile === 'index.html' || currentFile === '') {
        // 主页
        initHomePage();
    } else if (currentPath.includes('support.html') || currentFile === 'support.html') {
        // 支持页面
        initSupportPage();
    }
}

// 初始化主页
function initHomePage() {
    console.log('初始化主页功能');
    
    // 初始化背景轮播
    backgroundSlider = new BackgroundSlider();
    
    // 为支持页面的按钮添加节流（如果存在）
    initSupportPageThrottling();
}

// 初始化新闻页面
function initNewsPage() {
    console.log('初始化新闻页面功能');
    
    // 初始化新闻管理器
    newsManager = new NewsManager();
    
    // 初始化新闻页面功能
    initNewsPageFeatures();
}

// 初始化新闻页面功能
async function initNewsPageFeatures() {
    console.log('DOM 加载完成，开始初始化新闻页面');
    console.log('当前域名 (SITE_DOMAIN):', newsManager.SITE_DOMAIN);
    
    newsManager.initFromStorage();
    
    newsManager.tryInitializeMarked();
    await newsManager.initializeApp();

    const tagSelect = document.getElementById('tag-select');
    const searchInput = document.getElementById('news-search-input');
    
    if (tagSelect) {
        tagSelect.addEventListener('change', () => newsManager.filterNews());
        if (newsManager.allNewsWithContent.length > 0) {
            const uniqueTags = newsManager.getUniqueTags(newsManager.allNewsWithContent);
            tagSelect.innerHTML = '<option value="">所有标签</option>';
            uniqueTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                tagSelect.appendChild(option);
            });
            console.log('标签下拉菜单填充完成:', uniqueTags);
        }
    }
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => newsManager.filterNews(), 300));
    }

    // 确保页面加载时自动触发一次筛选（显示所有新闻）
    if (window.location.pathname.includes('news.html')) {
        await newsManager.loadNews();
        // 初始状态无筛选条件时显示全部
        if (newsManager.filteredNews === null) {
            newsManager.filterNews();
        }
    }

    console.log('新闻页面初始化完成');
}

// 初始化新闻详情页面
function initNewsDetailPage() {
    console.log('初始化新闻详情页面功能');
    
    // 初始化新闻管理器
    newsManager = new NewsManager();
    
    // 初始化新闻详情页面功能
    initNewsDetailPageFeatures();
}

// 初始化新闻详情页面功能
async function initNewsDetailPageFeatures() {
    console.log('DOM 加载完成，开始初始化新闻详情页面');
    console.log('当前域名 (SITE_DOMAIN):', newsManager.SITE_DOMAIN);
    
    newsManager.tryInitializeMarked();
    await newsManager.initializeApp();
    
    if (window.location.pathname.includes('news-detail.html')) {
        await newsManager.renderNewsDetail();
    }
    
    console.log('新闻详情页面初始化完成');
}

// 初始化支持页面
function initSupportPage() {
    console.log('初始化支持页面功能');
    
    // 为按钮添加节流
    initSupportPageThrottling();
}

// 为支持页面的按钮添加节流
function initSupportPageThrottling() {
    // 节流函数
    function throttle(func, wait) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= wait) {
                lastCall = now;
                return func.apply(this, args);
            }
            // 非侵入式提示
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                background: #333; color: white; padding: 10px 20px; border-radius: 5px;
                z-index: 1000; opacity: 0; transition: opacity 0.3s;
            `;
            toast.textContent = '操作过于频繁，请稍后重试';
            document.body.appendChild(toast);
            setTimeout(() => toast.style.opacity = '1', 10);
            setTimeout(() => toast.remove(), 2000);
        };
    }

    // 为按钮添加节流
    document.querySelectorAll('.method-item a').forEach(button => {
        const originalClick = button.onclick || (() => {});
        button.onclick = throttle(e => {
            console.debug('Button clicked:', button.href); // 调试日志
            originalClick.call(button, e); // 执行原始点击事件
        }, 1000); // 1秒节流
    });
}

// 页面显示事件处理（用于处理浏览器缓存恢复）
window.addEventListener('pageshow', async function(event) {
    if (event.persisted) {
        console.log('从缓存恢复页面，重新加载新闻');
    }
    if (window.location.pathname.includes('news.html')) {
        if (newsManager) {
            // 从sessionStorage恢复数据
            newsManager.initFromStorage();
            
            if (newsManager.allNewsWithContent && newsManager.allNewsWithContent.length > 0) {
                await newsManager.loadNews();
                // 恢复后无筛选条件时显示全部
                if (newsManager.filteredNews === null) {
                    newsManager.filterNews();
                }
            } else if (typeof newsManager.initializeApp === 'function') {
                await newsManager.initializeApp().then(() => {
                    newsManager.loadNews();
                    if (newsManager.filteredNews === null) {
                        newsManager.filterNews();
                    }
                });
            }
        }
    }
});

// 导出全局变量供其他脚本使用
window.navigationManager = navigationManager;
window.newsManager = newsManager;
window.backgroundSlider = backgroundSlider;
window.versionManager = versionManager;
