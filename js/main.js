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
    // 如果调试模式已开启，显示提示
    if (debugMode) {
        console.log('🐛 调试模式已开启 - 显示所有调试信息');
        console.log('当前页面:', window.location.pathname);
        console.log('输入 fuckbug() 可关闭调试模式');
    }
    
    debugLog('DOM加载完成，开始初始化各模块');
    
    // 延迟初始化，确保所有元素都已加载
    setTimeout(() => {
        // 初始化通用模块
        initCommonModules();
        
        // 根据页面类型初始化特定功能
        initPageSpecificFeatures();
        
        debugLog('所有模块初始化完成');
    }, 50);
});

// 页面完全加载后的额外初始化
window.addEventListener('load', function() {
    // 确保导航栏和页脚正确显示
    setTimeout(() => {
        const nav = document.querySelector('nav');
        const footer = document.querySelector('footer');
        
        if (nav && !nav.style.display) {
            nav.style.display = 'flex';
        }
        if (footer && !footer.style.display) {
            footer.style.display = 'block';
        }
    }, 100);
});

// 初始化通用模块
function initCommonModules() {
    // 初始化导航管理器
    navigationManager = new NavigationManager();
    
    // 初始化版本管理器
    versionManager = new VersionManager();
    
    debugLog('通用模块初始化完成');
}

// 根据页面类型初始化特定功能
function initPageSpecificFeatures() {
    const currentPath = window.location.pathname;
    const currentFile = window.location.pathname.split('/').pop();
    
    debugLog('当前路径:', currentPath);
    debugLog('当前文件:', currentFile);
    
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
    } else if (currentPath.includes('monitoring.html') || currentFile === 'monitoring.html') {
        // 监控页面
        initMonitoringPage();
    }
}

// 初始化主页
function initHomePage() {
    debugLog('初始化主页功能');
    
    // 初始化背景轮播
    backgroundSlider = new BackgroundSlider();
    
    // 初始化服务器状态监控（暂时注释掉，因为函数未实现）
    // initServerStatusMonitoring();
    
    // 为支持页面的按钮添加节流（如果存在）
    initSupportPageThrottling();
    
    // 初始化动画效果
    initAnimations();
}

// 初始化新闻页面
function initNewsPage() {
    debugLog('初始化新闻页面功能');
    
    // 初始化新闻管理器
    newsManager = new NewsManager();
    
    // 初始化新闻页面功能
    initNewsPageFeatures();
}

// 初始化新闻页面功能
async function initNewsPageFeatures() {
    debugLog('DOM 加载完成，开始初始化新闻页面');
    debugLog('当前域名 (SITE_DOMAIN):', newsManager.SITE_DOMAIN);
    
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
            debugLog('标签下拉菜单填充完成:', uniqueTags);
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

    debugLog('新闻页面初始化完成');
}

// 初始化新闻详情页面
function initNewsDetailPage() {
    debugLog('初始化新闻详情页面功能');
    
    // 初始化新闻管理器
    newsManager = new NewsManager();
    
    // 初始化新闻详情页面功能
    initNewsDetailPageFeatures();
}

// 初始化新闻详情页面功能
async function initNewsDetailPageFeatures() {
    debugLog('DOM 加载完成，开始初始化新闻详情页面');
    debugLog('当前域名 (SITE_DOMAIN):', newsManager.SITE_DOMAIN);
    
    newsManager.tryInitializeMarked();
    await newsManager.initializeApp();
    
    if (window.location.pathname.includes('news-detail.html')) {
        await newsManager.renderNewsDetail();
    }
    
    debugLog('新闻详情页面初始化完成');
}

// 初始化支持页面
function initSupportPage() {
    debugLog('初始化支持页面功能');
    
    // 为按钮添加节流
    initSupportPageThrottling();
}

// 初始化监控页面
function initMonitoringPage() {
    debugLog('初始化监控页面功能');
    
    // 监控页面特定功能
    debugLog('监控页面正在开发中...');
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
        debugLog('从缓存恢复页面，重新加载新闻');
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

// 调试模式开关 - 从localStorage读取状态
// 生产环境强制关闭调试模式
let debugMode = false;
// 只有在开发环境或明确开启时才允许调试模式
if (window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('127.0.0.1') ||
    localStorage.getItem('debugMode') === 'true') {
    debugMode = localStorage.getItem('debugMode') === 'true';
}
// 确保localStorage中保存正确的状态
localStorage.setItem('debugMode', debugMode.toString());
window.debugMode = debugMode; // 全局访问

// 调试日志函数
function debugLog(...args) {
    if (debugMode) {
        console.log(...args);
    }
}

// 切换调试模式
window.fuckbug = function() {
    // 检查是否已经开启调试模式
    if (debugMode) {
        // 如果已经开启，则关闭调试模式
        debugMode = false;
        window.debugMode = debugMode;
        localStorage.setItem('debugMode', 'false');
        console.log('调试模式已关闭');
        return debugMode;
    }
    
    // 开启调试模式并刷新页面
    console.log('🐛 调试模式已开启！');
    console.log('正在刷新页面以显示完整调试信息...');
    console.log('当前页面:', window.location.pathname);
    
    // 设置调试模式为开启并保存到localStorage
    debugMode = true;
    window.debugMode = debugMode;
    localStorage.setItem('debugMode', 'true');
    
    // 刷新页面
    setTimeout(() => {
        window.location.reload();
    }, 500);
    
    return debugMode;
};

// 重新初始化所有模块（显示真实调试信息）
window.reinitAll = function() {
    if (!debugMode) {
        console.log('请先开启调试模式：fuckbug()');
        return;
    }
    
    console.log('--- 重新初始化所有模块 ---');
    
    // 重新初始化版本管理器
    if (versionManager) {
        console.log('重新初始化 VersionManager...');
        versionManager.getWebsiteVersion();
        versionManager.calculateUptime();
        versionManager.setupVersionClickHandler();
    }
    
    // 重新初始化新闻管理器
    if (newsManager) {
        console.log('重新初始化 NewsManager...');
        // 这里可以重新触发新闻相关的调试信息
    }
    
    // 重新初始化背景轮播
    if (backgroundSlider) {
        console.log('重新初始化 BackgroundSlider...');
        // 这里可以重新触发背景轮播的调试信息
    }
    
    // 重新初始化动画
    console.log('重新初始化动画系统...');
    initAnimations();
    
    console.log('--- 重新初始化完成 ---');
};

// 初始化滚动动画效果
function initAnimations() {
    debugLog('开始初始化滚动动画...');
    
    // 先检查元素是否存在
    const featureCards = document.querySelectorAll('.feature-card');
    const serverCards = document.querySelectorAll('.server-card');
    const contributorCards = document.querySelectorAll('.contributor-card');
    
    debugLog('找到的元素:', {
        featureCards: featureCards.length,
        serverCards: serverCards.length,
        contributorCards: contributorCards.length
    });

    // 添加测试功能：在控制台可以手动触发动画
    window.triggerAnimations = function() {
        debugLog('手动触发所有动画');
        [...featureCards, ...serverCards, ...contributorCards].forEach(element => {
            element.classList.add('animate');
        });
    };
    
    // 专门测试服务器卡片动画
    window.testServerCards = function() {
        debugLog('测试服务器卡片动画');
        serverCards.forEach((card, index) => {
            debugLog(`服务器卡片 ${index + 1}:`, card);
            card.classList.add('animate');
        });
    };

    // 使用 Intersection Observer 实现滚动触发动画
    if (!window.IntersectionObserver) {
        debugLog('浏览器不支持 Intersection Observer，直接显示所有元素');
        window.triggerAnimations();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        debugLog('Intersection Observer 触发:', entries.length, '个元素');
        entries.forEach(entry => {
            debugLog('元素进入视口:', entry.target.className, 'isIntersecting:', entry.isIntersecting);
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                debugLog('添加 animate 类到:', entry.target.className);
                // 动画触发后停止观察，避免重复触发
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,  // 当元素10%进入视口时触发
        rootMargin: '0px 0px -50px 0px'  // 提前50px触发
    });

    // 观察所有需要动画的元素
    const allElements = [...featureCards, ...serverCards, ...contributorCards];
    allElements.forEach(element => {
        debugLog('开始观察元素:', element.className);
        observer.observe(element);
    });

    debugLog(`初始化滚动动画，观察 ${allElements.length} 个元素`);
    
    // 备用方案：2秒后强制显示所有元素
    setTimeout(() => {
        const hiddenElements = document.querySelectorAll('.feature-card:not(.animate), .server-card:not(.animate), .contributor-card:not(.animate)');
        if (hiddenElements.length > 0) {
            debugLog('检测到隐藏元素，强制显示:', hiddenElements.length, '个');
            hiddenElements.forEach(element => {
                element.classList.add('animate');
            });
        }
    }, 2000);
}

// // 初始化服务器状态监控
// function initServerStatusMonitoring() {
//     console.log('初始化服务器状态监控');
    
//     // 服务器配置 - 你可以根据需要修改这些地址
//     const serverConfig = {
//         address: 'craft.luminolsuki.moe', // 你的服务器地址
//         type: 'java' // 或 'bedrock'
//     };
    
//     const statusElement = document.getElementById('server-status');
//     if (!statusElement) {
//         console.warn('未找到服务器状态元素 #server-status');
//         return;
//     }
    
//     // 立即检查一次状态
//     checkServerStatus(serverConfig, statusElement);
    
//     // 每30秒检查一次状态
//     setInterval(() => {
//         checkServerStatus(serverConfig, statusElement);
//     }, 30000);
// }

// // 检查服务器状态
// async function checkServerStatus(config, statusElement) {
//     const apiUrl = `https://api.mcstatus.io/v2/status/${config.type}/${config.address}`;
    
//     try {
//         console.log(`检查服务器状态: ${config.address}`);
//         const response = await fetch(apiUrl, {
//             method: 'GET',
//             headers: {
//                 'User-Agent': 'LuminolMC-Status/1.0'
//             }
//         });
        
//         if (!response.ok) {
//             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//         }
        
//         const data = await response.json();
//         console.log(`服务器 ${config.address} 状态:`, { online: data.online, latency: data.latency });
        
//         // 更新状态显示
//         updateStatusDisplay(statusElement, data.online, data.latency);
        
//     } catch (error) {
//         console.error(`服务器 ${config.address} 状态检查失败:`, error);
//         updateStatusDisplay(statusElement, false, null, true);
//     }
// }

// // 更新状态显示
// function updateStatusDisplay(statusElement, isOnline, latency, hasError = false) {
//     const indicator = statusElement.querySelector('.status-indicator');
//     if (!indicator) {
//         console.warn('未找到状态指示器元素');
//         return;
//     }
    
//     if (hasError) {
//         indicator.textContent = '检查失败';
//         indicator.className = 'status-indicator error';
//     } else if (isOnline) {
//         const latencyText = latency ? ` (${Math.round(latency)}ms)` : '';
//         indicator.textContent = `在线${latencyText}`;
//         indicator.className = 'status-indicator online';
//     } else {
//         indicator.textContent = '离线';
//         indicator.className = 'status-indicator offline';
//     }
// }

// 导出全局变量供其他脚本使用
window.navigationManager = navigationManager;
window.newsManager = newsManager;
window.backgroundSlider = backgroundSlider;
window.versionManager = versionManager;
