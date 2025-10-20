/**
 * 主入口文件
 * 协调各个模块的初始化和页面特定的功能
 */

// 全局变量 - 避免重复声明
if (typeof navigationManager === 'undefined') {
    var navigationManager;
}
if (typeof newsManager === 'undefined') {
    var newsManager;
}
if (typeof backgroundSlider === 'undefined') {
    var backgroundSlider;
}
if (typeof versionManager === 'undefined') {
    var versionManager;
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否使用了统一调试管理器
    if (!window.DebugManager) {
        // 如果没有统一调试管理器，使用旧的调试系统
        if (debugMode) {
            const isLiteMode = localStorage.getItem('debugMode') === 'true' && 
                              !localStorage.getItem('debugFullMode');
            
            if (isLiteMode) {
                console.log('🐛 轻量级调试模式已开启 - 显示重要信息');
                console.log('当前页面:', window.location.pathname);
                console.log('输入 debugLite() 可关闭调试模式');
            } else {
                console.log('🐛 完整调试模式已开启 - 显示所有调试信息');
                console.log('当前页面:', window.location.pathname);
                console.log('输入 fuckbug() 可关闭调试模式');
            }
        }
    }
    
    // 创建模块调试器
    const debug = debugModule('main');
    debug.info('DOM加载完成，开始初始化各模块');
    
    // 延迟初始化，确保所有元素都已加载
    setTimeout(() => {
        // 初始化通用模块
        initCommonModules();
        
        // 根据页面类型初始化特定功能
        initPageSpecificFeatures();
        
        debug.info('✅ 所有模块初始化完成');
        debug.info('🎉 网站加载成功，所有功能已启用');
        
        // 如果没有统一调试管理器，显示用户环境信息
        if (!window.DebugManager) {
            const isLiteMode = localStorage.getItem('debugMode') === 'true' && 
                              !localStorage.getItem('debugFullMode');
            if (isLiteMode) {
                debugUserEnvironment();
            }
        }
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
    const debug = debugModule('main');
    
    // 初始化导航管理器
    navigationManager = new NavigationManager();
    
    // 初始化版本管理器
    versionManager = new VersionManager();
    
    debug.info('✅ 通用模块初始化完成');
}

// 根据页面类型初始化特定功能
function initPageSpecificFeatures() {
    const debug = debugModule('main');
    const currentPath = window.location.pathname;
    const currentFile = window.location.pathname.split('/').pop();
    
    debug.info('当前路径:', currentPath);
    debug.info('当前文件:', currentFile);
    
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
    const debug = debugModule('main');
    debug.info('✅ 初始化主页功能');
    
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
    const debug = debugModule('main');
    debug.info('✅ 初始化新闻页面功能');
    
    // 初始化新闻管理器
    newsManager = new NewsManager();
    
    // 初始化新闻页面功能
    initNewsPageFeatures();
}

// 初始化新闻页面功能
async function initNewsPageFeatures() {
    const debug = debugModule('news');
    debug.info('DOM 加载完成，开始初始化新闻页面');
    debug.info('当前域名 (SITE_DOMAIN):', newsManager.SITE_DOMAIN);
    
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
            debug.info('标签下拉菜单填充完成:', uniqueTags);
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

    debug.info('✅ 新闻页面初始化完成');
}

// 初始化新闻详情页面
function initNewsDetailPage() {
    const debug = debugModule('main');
    debug.info('初始化新闻详情页面功能');
    
    // 初始化新闻管理器
    newsManager = new NewsManager();
    
    // 初始化新闻详情页面功能
    initNewsDetailPageFeatures();
}

// 初始化新闻详情页面功能
async function initNewsDetailPageFeatures() {
    const debug = debugModule('news');
    debug.info('DOM 加载完成，开始初始化新闻详情页面');
    debug.info('当前域名 (SITE_DOMAIN):', newsManager.SITE_DOMAIN);
    
    newsManager.tryInitializeMarked();
    await newsManager.initializeApp();
    
    if (window.location.pathname.includes('news-detail.html')) {
        await newsManager.renderNewsDetail();
    }
    
    debug.info('✅ 新闻详情页面初始化完成');
}

// 初始化支持页面
function initSupportPage() {
    const debug = debugModule('main');
    debug.info('✅ 初始化支持页面功能');
    
    // 为按钮添加节流
    initSupportPageThrottling();
}

// 初始化监控页面
function initMonitoringPage() {
    const debug = debugModule('main');
    debug.info('✅ 初始化监控页面功能');
    
    // 监控页面特定功能
    debug.info('监控页面正在开发中...');
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
        const debug = debugModule('news');
        debug.info('从缓存恢复页面，重新加载新闻');
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

// 简化调试系统 - 只保留基础功能
// 避免重复声明
if (typeof debugMode === 'undefined') {
    var debugMode = false;
}

// 只有在开发环境或明确开启时才允许调试模式
// 避免重复声明
if (typeof isLocalDev === 'undefined') {
    var isLocalDev = window.location.hostname.includes('localhost') || 
                     window.location.hostname.includes('127.0.0.1');
}
if (typeof savedDebugMode === 'undefined') {
    var savedDebugMode = localStorage.getItem('debugMode') === 'true';
}

// 只有在本地开发环境或明确启用调试时才开启调试模式
if (isLocalDev) {
    debugMode = savedDebugMode;
} else {
    // 生产环境默认关闭调试模式
    debugMode = false;
}

// 确保localStorage中保存正确的状态
localStorage.setItem('debugMode', debugMode.toString());
window.debugMode = debugMode; // 全局访问

// 轻量级调试日志函数 - 显示用户友好信息
function debugLog(...args) {
    if (debugMode) {
        // 检查是否是轻量级模式
        const isLiteMode = localStorage.getItem('debugMode') === 'true' && 
                          !localStorage.getItem('debugFullMode');
        
        if (isLiteMode) {
            // 轻量级模式：显示用户友好的重要信息
            const message = args.join(' ');
            if (message.includes('❌') || message.includes('⚠️') || 
                message.includes('错误') || message.includes('失败') || 
                message.includes('警告') || message.includes('不支持') ||
                message.includes('初始化完成') || message.includes('加载成功') ||
                message.includes('页面加载') || message.includes('功能已启用') ||
                message.includes('网络环境') || message.includes('连接状态') ||
                message.includes('设备信息') || message.includes('浏览器信息')) {
                console.log(...args);
            }
        } else {
            // 完整模式：显示所有信息
            console.log(...args);
        }
    }
}

// 简化的模块化调试函数
function debugModule(moduleName) {
    return {
        info: (...args) => {
            if (debugMode) {
                // 检查是否是轻量级模式
                const isLiteMode = localStorage.getItem('debugMode') === 'true' && 
                                  !localStorage.getItem('debugFullMode');
                
                if (isLiteMode) {
                    // 轻量级模式：只显示用户友好的重要信息
                    const message = args.join(' ');
                    if (message.includes('🎉 网站加载成功，所有功能已启用') ||
                        message.includes('✅ 通用模块初始化完成') ||
                        message.includes('✅ 所有模块初始化完成') ||
                        message.includes('❌') || message.includes('⚠️') || 
                        message.includes('错误') || message.includes('失败') || 
                        message.includes('警告') || message.includes('不支持') ||
                        message.includes('🌐 网络环境信息') || 
                        message.includes('📱 设备信息') || 
                        message.includes('🌐 浏览器信息') ||
                        message.includes('📶 连接类型') ||
                        message.includes('⬇️ 下载速度') ||
                        message.includes('⏱️ 延迟') ||
                        message.includes('🔗 在线状态') ||
                        message.includes('📱 设备类型') ||
                        message.includes('🖥️ 屏幕分辨率') ||
                        message.includes('👁️ 视口大小') ||
                        message.includes('🔍 像素密度') ||
                        message.includes('🔧 浏览器') ||
                        message.includes('🌍 语言') ||
                        message.includes('⏰ 时区')) {
                        console.log(`[${moduleName}]`, ...args);
                    }
                } else {
                    // 完整模式：显示所有信息
                    console.log(`[${moduleName}]`, ...args);
                }
            }
        },
        warn: (...args) => {
            if (debugMode) {
                console.log(`[${moduleName}] ⚠️`, ...args);
            }
        },
        error: (...args) => {
            if (debugMode) {
                console.log(`[${moduleName}] ❌`, ...args);
            }
        }
    };
}

// 简化的系统信息调试
function debugSystemInfo() {
    if (!debugMode) return;
    
    debugLog('=== 系统信息 ===');
    debugLog('浏览器:', navigator.userAgent);
    debugLog('语言:', navigator.language);
    debugLog('屏幕:', `${screen.width}x${screen.height}`);
    debugLog('视口:', `${window.innerWidth}x${window.innerHeight}`);
    debugLog('在线状态:', navigator.onLine);
    debugLog('=== 系统信息结束 ===');
}

// 用户友好的网络环境检测
function debugUserEnvironment() {
    if (!debugMode) return;
    
    const debug = debugModule('user');
    
    // 网络连接信息 - 兼容多种浏览器
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection ||
                      navigator.msConnection;
    
    debug.info('🌐 网络环境信息:');
    debug.info(`🔗 在线状态: ${navigator.onLine ? '✅ 已连接' : '❌ 离线'}`);
    
    if (connection) {
        // 兼容不同浏览器的属性名
        const networkType = connection.effectiveType || 
                           connection.type || 
                           connection.effectiveConnectionType || 
                           '未知';
        const downlink = connection.downlink || 
                       connection.downlinkMax || 
                       '未知';
        const rtt = connection.rtt || 
                   connection.roundTripTime || 
                   '未知';
        const saveData = connection.saveData || false;
        
        debug.info(`📶 连接类型: ${networkType}`);
        if (downlink !== '未知') {
            debug.info(`⬇️ 下载速度: ${downlink} Mbps`);
        }
        if (rtt !== '未知') {
            debug.info(`⏱️ 延迟: ${rtt} ms`);
        }
        debug.info(`💾 省流量模式: ${saveData ? '开启' : '关闭'}`);
    } else {
        // 尝试通过其他方式获取网络信息
        const userAgent = navigator.userAgent;
        let browserInfo = '未知浏览器';
        let apiSupport = '不支持';
        
        if (userAgent.includes('Chrome')) {
            browserInfo = 'Chrome';
            apiSupport = '支持';
        } else if (userAgent.includes('Firefox')) {
            browserInfo = 'Firefox';
            apiSupport = '不支持（实验性功能）';
        } else if (userAgent.includes('Safari')) {
            browserInfo = 'Safari';
            apiSupport = '部分支持';
        } else if (userAgent.includes('Edge')) {
            browserInfo = 'Edge';
            apiSupport = '支持';
        }
        
        debug.info(`🌐 浏览器: ${browserInfo}`);
        debug.info(`📡 网络连接API: ${apiSupport}`);
        debug.info('💡 这是正常现象，不影响网站使用');
    }
    
    // 设备信息
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
    const deviceType = isTablet ? '平板' : isMobile ? '手机' : '电脑';
    
    debug.info('📱 设备信息:');
    debug.info(`📱 设备类型: ${deviceType}`);
    debug.info(`🖥️ 屏幕分辨率: ${screen.width}x${screen.height}`);
    debug.info(`👁️ 视口大小: ${window.innerWidth}x${window.innerHeight}`);
    debug.info(`🔍 像素密度: ${window.devicePixelRatio}x`);
    
    // 浏览器信息
    const browserInfo = getBrowserInfo();
    debug.info('🌐 浏览器信息:');
    debug.info(`🔧 浏览器: ${browserInfo.name} ${browserInfo.version}`);
    debug.info(`🌍 语言: ${navigator.language}`);
    debug.info(`⏰ 时区: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
}

// 获取浏览器信息
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = '未知';
    let browserVersion = '未知';
    
    if (ua.includes('Chrome')) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '未知';
    } else if (ua.includes('Firefox')) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '未知';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '未知';
    } else if (ua.includes('Edge')) {
        browserName = 'Edge';
        browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || '未知';
    }
    
    return { name: browserName, version: browserVersion };
}

// 简化的性能调试
function debugPerformance() {
    if (!debugMode) return;
    
    debugLog('=== 性能信息 ===');
    debugLog('页面加载时间:', performance.timing.loadEventEnd - performance.timing.navigationStart + 'ms');
    debugLog('资源数量:', performance.getEntriesByType('resource').length);
    debugLog('=== 性能信息结束 ===');
}

// 简化的调试模式切换
window.fuckbug = function() {
    if (debugMode) {
        // 检查当前模式
        const isFullMode = localStorage.getItem('debugFullMode') === 'true';
        
        if (isFullMode) {
            // 如果已经是完整模式，则关闭调试
            debugMode = false;
            window.debugMode = debugMode;
            localStorage.setItem('debugMode', 'false');
            localStorage.removeItem('debugFullMode');
            console.log('🐛 完整调试模式已关闭');
            console.log('🔄 正在刷新页面以应用调试设置...');
            
            // 自动刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
            return debugMode;
        } else {
            // 如果是从轻量级模式切换到完整模式
            debugMode = true;
            window.debugMode = debugMode;
            localStorage.setItem('debugMode', 'true');
            localStorage.setItem('debugFullMode', 'true'); // 切换到完整模式
            
            console.log('🐛 已切换到完整调试模式');
            console.log('🔧 开发者模式 - 显示所有调试信息');
            console.log('🌐 当前页面:', window.location.pathname);
            console.log('🔄 正在刷新页面以应用调试设置...');
            
            // 显示系统信息
            debugSystemInfo();
            debugPerformance();
            
        // 延迟刷新，让用户有时间看到信息
        setTimeout(() => {
            console.log('🔄 页面即将刷新...');
            window.location.reload();
        }, 3000);
            
            return debugMode;
        }
    }
    
    // 如果调试模式未开启，则开启完整调试模式
    debugMode = true;
    window.debugMode = debugMode;
    localStorage.setItem('debugMode', 'true');
    localStorage.setItem('debugFullMode', 'true'); // 标记为完整模式
    
    console.log('🐛 完整调试模式已开启！');
    console.log('🔧 开发者模式 - 显示所有调试信息');
    console.log('💻 适合开发者使用，信息详细全面');
    console.log('🌐 当前页面:', window.location.pathname);
    console.log('🔄 正在刷新页面以应用调试设置...');
    
    // 显示系统信息
    debugSystemInfo();
    debugPerformance();
    
    // 延迟刷新，让用户有时间看到信息
    setTimeout(() => {
        console.log('🔄 页面即将刷新...');
        window.location.reload();
    }, 3000);
    
    return debugMode;
};

// 删除复杂的调试指令，只保留基础功能

// 轻量级调试模式 - 用户友好版本
window.debugLite = function() {
    if (debugMode) {
        // 如果已经是轻量级模式，则关闭调试
        const isFullMode = localStorage.getItem('debugFullMode') === 'true';
        if (!isFullMode) {
            debugMode = false;
            window.debugMode = debugMode;
            localStorage.setItem('debugMode', 'false');
            console.log('🐛 轻量级调试模式已关闭');
            return;
        }
        
        // 如果是从完整模式切换到轻量级模式
        debugMode = true;
        window.debugMode = debugMode;
        localStorage.setItem('debugMode', 'true');
        localStorage.removeItem('debugFullMode'); // 切换到轻量级模式
        
        console.log('🐛 已切换到轻量级调试模式');
        console.log('📱 用户友好模式 - 只显示重要信息');
        console.log('🔄 正在刷新页面以应用调试设置...');
        
        // 延迟刷新，让用户有时间看到信息
        setTimeout(() => {
            console.log('🔄 页面即将刷新...');
            window.location.reload();
        }, 1000);
        
        return debugMode;
    }
    
    // 如果调试模式未开启，则开启轻量级模式
    debugMode = true;
    window.debugMode = debugMode;
    localStorage.setItem('debugMode', 'true');
    localStorage.removeItem('debugFullMode'); // 确保不是完整模式
    
    console.log('🐛 轻量级调试模式已开启');
    console.log('📱 用户友好模式 - 只显示重要信息');
    console.log('💡 适合普通用户使用，信息简洁易懂');
    console.log('🔄 正在刷新页面以应用调试设置...');
    
    // 延迟刷新，让用户有时间看到信息
    setTimeout(() => {
        console.log('🔄 页面即将刷新...');
        window.location.reload();
    }, 1000);
    
    return debugMode;
};

// 手动刷新控制
window.debugRefresh = function() {
    console.log('🔄 手动刷新页面...');
    window.location.reload();
};

// 取消自动刷新
window.debugCancelRefresh = function() {
    console.log('❌ 已取消自动刷新');
    // 清除所有定时器
    for (let i = 1; i < 99999; i++) {
        clearTimeout(i);
    }
};

// 简化的帮助信息
window.fuckhelp = function() {
    console.log('🐛 调试系统帮助:');
    console.log('debugLite() - 轻量级调试（用户友好，只显示重要信息）');
    console.log('fuckbug() - 完整调试（开发者模式，显示所有信息）');
    console.log('debugRefresh() - 手动刷新页面');
    console.log('debugCancelRefresh() - 取消自动刷新');
    console.log('fuckhelp() - 显示此帮助信息');
    console.log('');
    console.log('🔄 模式切换:');
    console.log('• 完整模式 → debugLite() → 轻量级模式');
    console.log('• 轻量级模式 → fuckbug() → 完整模式');
    console.log('• 再次调用相同指令 → 关闭调试');
    console.log('');
    console.log('📝 使用建议:');
    console.log('• 普通用户遇到问题: debugLite()');
    console.log('• 开发者调试代码: fuckbug()');
    console.log('• 查看帮助信息: fuckhelp()');
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
    const debug = debugModule('main');
    debug.info('开始初始化滚动动画...');
    
    // 先检查元素是否存在
    const featureCards = document.querySelectorAll('.feature-card');
    const serverCards = document.querySelectorAll('.server-card');
    const contributorCards = document.querySelectorAll('.contributor-card');
    
    debug.info('找到的元素:', {
        featureCards: featureCards.length,
        serverCards: serverCards.length,
        contributorCards: contributorCards.length
    });

    // 添加测试功能：在控制台可以手动触发动画
    window.triggerAnimations = function() {
        debug.info('手动触发所有动画');
        [...featureCards, ...serverCards, ...contributorCards].forEach(element => {
            element.classList.add('animate');
        });
    };
    
    // 专门测试服务器卡片动画
    window.testServerCards = function() {
        debug.info('测试服务器卡片动画');
        serverCards.forEach((card, index) => {
            debug.info(`服务器卡片 ${index + 1}:`, card);
            card.classList.add('animate');
        });
    };

    // 使用 Intersection Observer 实现滚动触发动画
    if (!window.IntersectionObserver) {
        debug.warn('浏览器不支持 Intersection Observer，直接显示所有元素');
        window.triggerAnimations();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        debug.info('Intersection Observer 触发:', entries.length, '个元素');
        entries.forEach(entry => {
            debug.info('元素进入视口:', entry.target.className, 'isIntersecting:', entry.isIntersecting);
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                debug.info('添加 animate 类到:', entry.target.className);
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
        debug.info('开始观察元素:', element.className);
        observer.observe(element);
    });

    debug.info(`初始化滚动动画，观察 ${allElements.length} 个元素`);
    
    // 备用方案：2秒后强制显示所有元素
    setTimeout(() => {
        const hiddenElements = document.querySelectorAll('.feature-card:not(.animate), .server-card:not(.animate), .contributor-card:not(.animate)');
        if (hiddenElements.length > 0) {
            debug.warn('检测到隐藏元素，强制显示:', hiddenElements.length, '个');
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
