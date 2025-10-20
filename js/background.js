/**
 * 背景轮播功能模块
 * 负责背景图片的切换和动画效果
 */

class BackgroundSlider {
    constructor() {
        this.backgroundImages = [
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/3cda066bccaefea3eb268d4ca10f018a.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585028843869744.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585018650004905.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585012522922876.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585006053756264.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585000138805953.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_584991582604759.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669234245588716.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669226165759604.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669218057352159.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669214276923463.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669203224465863.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669202127295447.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669192564244096.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669027140045097.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585061010780930.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585054865315151.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585036168830575.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585018650004905.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_585006053756264.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/9ae17d2b-8fb3-4f05-8a75-48c40de55bd0.webp',
            'https://gitee.com/Narcssu/craft.luminolsuki.moe-imagehosting/raw/master/images/Image_669276986426772.webp',
        ];
        
        this.header = null;
        this.currentIndex = 0;
        this.background = null;
        this.switchInterval = null;
        this.preloaded = new Map(); // url -> { ok: boolean, src: string }
        this.fallbackPrefix = '/images/'; // local fallback dir
        this.isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }

    init() {
        this.header = document.querySelector('header');
        if (!this.header) {
            console.warn('未找到header元素，背景轮播功能将不会启动');
            return;
        }
        
        this.preloadAll().then(() => {
            this.setupInitialBackground();
            this.startSliding();
        });

        // Page visibility handling to save CPU/GPU
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopSliding();
            } else {
                if (!this.isReducedMotion) this.startSliding();
            }
        });
    }

    // Preload all images with fallback
    preloadAll() {
        const preloadOne = (url) => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.preloaded.set(url, { ok: true, src: url });
                resolve();
            };
            img.onerror = () => {
                // try local fallback using filename
                try {
                    const fileName = url.split('/').pop();
                    const fallbackUrl = this.fallbackPrefix + fileName;
                    const img2 = new Image();
                    img2.onload = () => {
                        this.preloaded.set(url, { ok: true, src: fallbackUrl });
                        resolve();
                    };
                    img2.onerror = () => {
                        this.preloaded.set(url, { ok: false, src: '' });
                        resolve();
                    };
                    img2.src = fallbackUrl;
                } catch (_) {
                    this.preloaded.set(url, { ok: false, src: '' });
                    resolve();
                }
            };
            img.src = url;
        });

        // Respect prefers-reduced-motion by not preloading everything eagerly
        const list = this.isReducedMotion ? this.backgroundImages.slice(0, 3) : this.backgroundImages;
        return Promise.all(list.map(preloadOne));
    }

    resolveSrc(url) {
        const info = this.preloaded.get(url);
        if (info && info.ok && info.src) return info.src;
        // if not preloaded yet, optimistically use original url
        return url;
    }

    // 设置初始背景
    setupInitialBackground() {
        // 初始索引设为随机值，实现每次刷新不同背景
        this.currentIndex = Math.floor(Math.random() * this.backgroundImages.length);

        // 创建初始背景（使用随机选中的图片）
        this.background = document.createElement('div');
        this.background.className = 'header-background fade-in';
        this.background.style.backgroundImage = `url(${this.resolveSrc(this.backgroundImages[this.currentIndex])})`;
        this.header.appendChild(this.background);
    }

    // 随机获取下一张图片索引（不重复当前）
    getNextIndex() {
        if (this.backgroundImages.length <= 1) return 0;
        
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * this.backgroundImages.length);
        } while (nextIndex === this.currentIndex);

        return nextIndex;
    }

    // 切换背景图片
    switchBackground() {
        const nextIndex = this.getNextIndex();
        
        // 创建新背景元素
        const newBackground = document.createElement('div');
        newBackground.className = 'header-background new-background';
        newBackground.style.backgroundImage = `url(${this.resolveSrc(this.backgroundImages[nextIndex])})`;
        this.header.appendChild(newBackground);
        
        // 触发当前背景的淡出动画
        this.background.classList.remove('fade-in');
        this.background.classList.add('fade-out');
        
        // 稍微延迟后触发新背景的淡入动画
        setTimeout(() => {
            newBackground.classList.remove('new-background');
            newBackground.classList.add('fade-in');
        }, 200); // 小延迟让动画更有层次感

        // 动画完成后清理旧背景
        setTimeout(() => {
            this.background.remove();
            this.background = newBackground;
            this.currentIndex = nextIndex;
        }, 1200); // 与CSS过渡时间保持一致
    }

    // 开始轮播
    startSliding() {
        if (this.switchInterval || this.isReducedMotion) return;
        // 每5秒切换一次背景，略微降低频率
        this.switchInterval = setInterval(() => {
            this.switchBackground();
        }, 3600);
    }

    // 停止轮播
    stopSliding() {
        if (this.switchInterval) {
            clearInterval(this.switchInterval);
            this.switchInterval = null;
        }
    }

    // 手动切换到下一张
    next() {
        this.switchBackground();
    }

    // 手动切换到上一张
    previous() {
        const prevIndex = this.currentIndex === 0 ? this.backgroundImages.length - 1 : this.currentIndex - 1;
        this.currentIndex = prevIndex;
        this.switchBackground();
    }

    // 销毁背景轮播
    destroy() {
        this.stopSliding();
        if (this.background) {
            this.background.remove();
        }
    }
}

// 导出类（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundSlider;
}
