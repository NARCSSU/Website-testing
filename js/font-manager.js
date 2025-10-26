/**
 * 字体管理模块
 * 负责字体加载、检测和优化
 * 
 * @author LuminolCraft Team
 * @version 1.0.0
 * @since 2025-10-26
 */

class FontManager {
    constructor() {
        this.fonts = {
            'MiSans VF': {
                name: 'MiSans VF',
                fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
                loaded: false,
                loading: false
            },
            'MiSans': {
                name: 'MiSans',
                fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
                loaded: false,
                loading: false
            }
        };
        
        this.loadingPromises = new Map();
        this.init();
    }

    /**
     * 初始化字体管理器
     */
    init() {
        this.setupFontDetection();
        this.preloadCriticalFonts();
        this.setupFontLoadingEvents();
        
        // 调试模式
        if (window.debugMode) {
            this.enableDebugMode();
        }
    }

    /**
     * 设置字体检测
     */
    setupFontDetection() {
        // 检测字体是否可用
        this.fonts['MiSans VF'].loaded = this.isFontAvailable('MiSans VF');
        this.fonts['MiSans'].loaded = this.isFontAvailable('MiSans');
        
        debugLog('字体检测结果:', {
            'MiSans VF': this.fonts['MiSans VF'].loaded,
            'MiSans': this.fonts['MiSans'].loaded
        });
    }

    /**
     * 预加载关键字体
     */
    preloadCriticalFonts() {
        const criticalFonts = [
            'https://cdn-font.hyperos.mi.com/font/css?family=MiSans_VF:VF:Chinese_Simplify,Latin&display=swap',
            'https://cdn-font.hyperos.mi.com/font/css?family=MiSans:400,500,600:Chinese_Simplify,Latin&display=swap'
        ];

        criticalFonts.forEach(url => {
            this.preloadFont(url);
        });
    }

    /**
     * 预加载字体
     * @param {string} url 字体URL
     */
    preloadFont(url) {
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        const promise = new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = url;
            link.onload = () => {
                debugLog('字体预加载成功:', url);
                resolve();
            };
            link.onerror = () => {
                debugLog('字体预加载失败:', url);
                reject(new Error(`Failed to preload font: ${url}`));
            };
            
            document.head.appendChild(link);
        });

        this.loadingPromises.set(url, promise);
        return promise;
    }

    /**
     * 设置字体加载事件
     */
    setupFontLoadingEvents() {
        // 监听字体加载完成事件
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                debugLog('所有字体加载完成');
                this.onAllFontsLoaded();
            });

            // 监听单个字体加载
            document.fonts.addEventListener('loadingdone', (event) => {
                const fontFace = event.fontface;
                debugLog('字体加载完成:', fontFace.family);
                this.onFontLoaded(fontFace.family);
            });

            document.fonts.addEventListener('loadingerror', (event) => {
                const fontFace = event.fontface;
                debugLog('字体加载失败:', fontFace.family);
                this.onFontLoadError(fontFace.family);
            });
        }
    }

    /**
     * 检测字体是否可用
     * @param {string} fontName 字体名称
     * @returns {boolean} 是否可用
     */
    isFontAvailable(fontName) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // 设置测试文本
        const testText = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const testSize = '72px';
        
        // 测试字体
        context.font = `${testSize} ${fontName}`;
        const widthWithFont = context.measureText(testText).width;
        
        // 测试备用字体
        context.font = `${testSize} monospace`;
        const widthWithFallback = context.measureText(testText).width;
        
        return widthWithFont !== widthWithFallback;
    }

    /**
     * 等待字体加载
     * @param {string} fontName 字体名称
     * @param {number} timeout 超时时间（毫秒）
     * @returns {Promise<boolean>} 是否加载成功
     */
    async waitForFont(fontName, timeout = 10000) {
        if (this.fonts[fontName]?.loaded) {
            return true;
        }

        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const checkFont = () => {
                if (this.fonts[fontName]?.loaded) {
                    resolve(true);
                    return;
                }
                
                if (Date.now() - startTime > timeout) {
                    debugLog(`字体加载超时: ${fontName}`);
                    resolve(false);
                    return;
                }
                
                setTimeout(checkFont, 100);
            };
            
            checkFont();
        });
    }

    /**
     * 获取字体状态
     * @param {string} fontName 字体名称
     * @returns {Object} 字体状态
     */
    getFontStatus(fontName) {
        return this.fonts[fontName] || {
            name: fontName,
            loaded: false,
            loading: false,
            fallback: 'sans-serif'
        };
    }

    /**
     * 获取所有字体状态
     * @returns {Object} 所有字体状态
     */
    getAllFontStatus() {
        return { ...this.fonts };
    }

    /**
     * 字体加载完成回调
     * @param {string} fontName 字体名称
     */
    onFontLoaded(fontName) {
        if (this.fonts[fontName]) {
            this.fonts[fontName].loaded = true;
            this.fonts[fontName].loading = false;
        }
        
        // 更新页面字体类
        document.body.classList.add('font-loaded');
        document.body.classList.remove('font-loading');
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('fontLoaded', {
            detail: { fontName }
        }));
    }

    /**
     * 字体加载失败回调
     * @param {string} fontName 字体名称
     */
    onFontLoadError(fontName) {
        if (this.fonts[fontName]) {
            this.fonts[fontName].loaded = false;
            this.fonts[fontName].loading = false;
        }
        
        debugLog(`字体加载失败，使用备用字体: ${fontName}`);
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('fontLoadError', {
            detail: { fontName }
        }));
    }

    /**
     * 所有字体加载完成回调
     */
    onAllFontsLoaded() {
        debugLog('所有字体加载完成');
        
        // 更新页面状态
        document.body.classList.add('fonts-ready');
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('allFontsLoaded'));
    }

    /**
     * 启用调试模式
     */
    enableDebugMode() {
        debugLog('字体管理器调试模式已启用');
        
        // 添加调试样式
        const style = document.createElement('style');
        style.textContent = `
            .debug-fonts * {
                outline: 1px solid rgba(255, 0, 0, 0.1) !important;
            }
            
            .debug-fonts *::before {
                content: attr(class) !important;
                position: absolute !important;
                background: rgba(255, 0, 0, 0.8) !important;
                color: white !important;
                font-size: 10px !important;
                padding: 2px 4px !important;
                z-index: 9999 !important;
            }
        `;
        document.head.appendChild(style);
        
        // 添加调试按钮
        this.addDebugButton();
    }

    /**
     * 添加调试按钮
     */
    addDebugButton() {
        const button = document.createElement('button');
        button.textContent = '字体调试';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        button.addEventListener('click', () => {
            document.body.classList.toggle('debug-fonts');
            button.textContent = document.body.classList.contains('debug-fonts') 
                ? '关闭调试' 
                : '字体调试';
        });
        
        document.body.appendChild(button);
    }

    /**
     * 获取字体性能信息
     * @returns {Object} 性能信息
     */
    getPerformanceInfo() {
        const info = {
            totalFonts: Object.keys(this.fonts).length,
            loadedFonts: Object.values(this.fonts).filter(font => font.loaded).length,
            loadingFonts: Object.values(this.fonts).filter(font => font.loading).length,
            fontDetails: {}
        };
        
        Object.entries(this.fonts).forEach(([name, font]) => {
            info.fontDetails[name] = {
                loaded: font.loaded,
                loading: font.loading,
                fallback: font.fallback
            };
        });
        
        return info;
    }

    /**
     * 优化字体渲染
     */
    optimizeRendering() {
        // 设置字体渲染优化
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
            }
            
            .font-loading * {
                font-family: var(--font-fallback) !important;
            }
            
            .font-loaded * {
                font-family: var(--font-primary) !important;
            }
        `;
        document.head.appendChild(style);
        
        // 初始状态
        document.body.classList.add('font-loading');
    }
}

// 全局字体管理器实例
let fontManager;

// 初始化字体管理器
function initFontManager() {
    if (!fontManager) {
        fontManager = new FontManager();
        window.fontManager = fontManager;
        
        // 优化字体渲染
        fontManager.optimizeRendering();
        
        debugLog('字体管理器初始化完成');
    }
    return fontManager;
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFontManager);
} else {
    initFontManager();
}

// 导出字体管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FontManager;
}

// 全局函数
window.FontManager = FontManager;
window.initFontManager = initFontManager;
