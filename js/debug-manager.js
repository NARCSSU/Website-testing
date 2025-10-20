/**
 * 统一调试管理器
 * 解决多页面调试信息重复问题
 * 使用方法：在页面中引入此文件，然后使用 window.DebugManager
 */

(function() {
    'use strict';
    
    // 调试管理器类
    class DebugManager {
        constructor() {
            this.isInitialized = false;
            this.debugMode = false;
            this.isLiteMode = false;
            this.isFullMode = false;
            this.init();
        }
        
        // 初始化调试管理器
        init() {
            if (this.isInitialized) return;
            
            // 检查是否在本地开发环境
            const isLocalDev = window.location.hostname.includes('localhost') || 
                              window.location.hostname.includes('127.0.0.1') ||
                              window.location.hostname.includes('127.0.0.1');
            
            // 只有在本地开发环境或明确启用调试时才开启调试模式
            const savedDebugMode = localStorage.getItem('debugMode') === 'true';
            this.debugMode = isLocalDev || savedDebugMode;
            this.isLiteMode = this.debugMode && !localStorage.getItem('debugFullMode');
            this.isFullMode = this.debugMode && localStorage.getItem('debugFullMode') === 'true';
            
            // 设置全局变量
            window.debugMode = this.debugMode;
            
            this.isInitialized = true;
        }
        
        // 统一的调试日志函数
        log(...args) {
            if (!this.debugMode) return;
            
            if (this.isLiteMode) {
                // 轻量级模式：只显示用户友好的重要信息
                const message = args.join(' ');
                if (this.shouldShowInLiteMode(message)) {
                    console.log(...args);
                }
            } else {
                // 完整模式：显示所有信息
                console.log(...args);
            }
        }
        
        // 模块化调试函数
        module(moduleName) {
            return {
                info: (...args) => {
                    if (this.debugMode) {
                        if (this.isLiteMode) {
                            const message = args.join(' ');
                            if (this.shouldShowInLiteMode(message)) {
                                console.log(`[${moduleName}]`, ...args);
                            }
                        } else {
                            console.log(`[${moduleName}]`, ...args);
                        }
                    }
                },
                warn: (...args) => {
                    if (this.debugMode) {
                        console.log(`[${moduleName}] ⚠️`, ...args);
                    }
                },
                error: (...args) => {
                    if (this.debugMode) {
                        console.log(`[${moduleName}] ❌`, ...args);
                    }
                }
            };
        }
        
        // 判断轻量级模式是否应该显示此消息
        shouldShowInLiteMode(message) {
            return message.includes('🎉 网站加载成功，所有功能已启用') ||
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
                   message.includes('⏰ 时区');
        }
        
        // 切换调试模式
        toggle() {
            this.debugMode = !this.debugMode;
            localStorage.setItem('debugMode', this.debugMode.toString());
            window.debugMode = this.debugMode;
            
            if (this.debugMode) {
                console.log('🐛 调试模式已开启');
            } else {
                console.log('🐛 调试模式已关闭');
            }
        }
        
        // 切换到轻量级模式
        setLiteMode() {
            this.debugMode = true;
            localStorage.setItem('debugMode', 'true');
            localStorage.removeItem('debugFullMode');
            window.debugMode = this.debugMode;
            this.isLiteMode = true;
            this.isFullMode = false;
            console.log('🐛 轻量级调试模式已开启 - 显示重要信息');
        }
        
        // 切换到完整模式
        setFullMode() {
            this.debugMode = true;
            localStorage.setItem('debugMode', 'true');
            localStorage.setItem('debugFullMode', 'true');
            window.debugMode = this.debugMode;
            this.isLiteMode = false;
            this.isFullMode = true;
            console.log('🐛 完整调试模式已开启 - 显示所有调试信息');
        }
        
        // 关闭调试模式
        turnOff() {
            this.debugMode = false;
            localStorage.removeItem('debugMode');
            localStorage.removeItem('debugFullMode');
            window.debugMode = this.debugMode;
            this.isLiteMode = false;
            this.isFullMode = false;
            console.log('🐛 调试模式已关闭');
        }
        
        // 显示帮助信息
        showHelp() {
            console.log('🔧 调试系统帮助:');
            console.log('debugLite() - 开启轻量级调试模式（用户友好）');
            console.log('fuckbug() - 开启完整调试模式（开发者）');
            console.log('debugOff() - 关闭调试模式');
            console.log('fuckhelp() - 显示此帮助信息');
        }
    }
    
    // 创建全局调试管理器实例
    window.DebugManager = new DebugManager();
    
    // 兼容性函数
    window.debugLog = (...args) => window.DebugManager.log(...args);
    window.debugModule = (moduleName) => window.DebugManager.module(moduleName);
    
    // 调试命令
    window.debugLite = () => {
        window.DebugManager.setLiteMode();
        setTimeout(() => window.location.reload(), 1000);
    };
    
    window.fuckbug = () => {
        window.DebugManager.setFullMode();
        setTimeout(() => window.location.reload(), 1000);
    };
    
    window.debugOff = () => {
        window.DebugManager.turnOff();
        setTimeout(() => window.location.reload(), 1000);
    };
    
    window.fuckhelp = () => window.DebugManager.showHelp();
    
    // 页面加载完成后的初始化
    document.addEventListener('DOMContentLoaded', function() {
        const debug = window.DebugManager.module('main');
        
        if (window.DebugManager.debugMode) {
            if (window.DebugManager.isLiteMode) {
                console.log('🐛 轻量级调试模式已开启 - 显示重要信息');
                console.log('当前页面:', window.location.pathname);
                console.log('输入 debugLite() 可关闭调试模式');
            } else {
                console.log('🐛 调试模式已开启 - 显示所有调试信息');
                console.log('当前页面:', window.location.pathname);
                console.log('输入 fuckbug() 可关闭调试模式');
            }
        }
        
        debug.info('✅ 通用模块初始化完成');
        debug.info('✅ 所有模块初始化完成');
        debug.info('🎉 网站加载成功，所有功能已启用');
        
        // 显示用户环境信息
        if (window.DebugManager.debugMode) {
            window.DebugManager.showUserEnvironment();
        }
    });
    
    // 显示用户环境信息
    window.DebugManager.showUserEnvironment = function() {
        const debug = this.module('user');
        
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
            
            if (userAgent.includes('Chrome')) {
                browserInfo = 'Chrome';
            } else if (userAgent.includes('Firefox')) {
                browserInfo = 'Firefox';
            } else if (userAgent.includes('Safari')) {
                browserInfo = 'Safari';
            } else if (userAgent.includes('Edge')) {
                browserInfo = 'Edge';
            }
            
            debug.info(`🌐 浏览器: ${browserInfo}`);
            debug.info('ℹ️ 网络连接API需要现代浏览器支持');
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
        const browserInfo = this.getBrowserInfo();
        debug.info('🌐 浏览器信息:');
        debug.info(`🔧 浏览器: ${browserInfo.name} ${browserInfo.version}`);
        debug.info(`🌍 语言: ${navigator.language}`);
        debug.info(`⏰ 时区: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    };
    
    // 获取浏览器信息
    window.DebugManager.getBrowserInfo = function() {
        const ua = navigator.userAgent;
        let browserName = '未知';
        let browserVersion = '未知';
        
        if (ua.includes('Chrome')) {
            browserName = 'Chrome';
            const match = ua.match(/Chrome\/(\d+)/);
            browserVersion = match ? match[1] : '未知';
        } else if (ua.includes('Firefox')) {
            browserName = 'Firefox';
            const match = ua.match(/Firefox\/(\d+)/);
            browserVersion = match ? match[1] : '未知';
        } else if (ua.includes('Safari')) {
            browserName = 'Safari';
            const match = ua.match(/Version\/(\d+)/);
            browserVersion = match ? match[1] : '未知';
        } else if (ua.includes('Edge')) {
            browserName = 'Edge';
            const match = ua.match(/Edge\/(\d+)/);
            browserVersion = match ? match[1] : '未知';
        }
        
        return { name: browserName, version: browserVersion };
    };
    
})();
