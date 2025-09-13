// 全局常量（在 DOMLoaded 外）
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/';  // GitHub Raw 基础 URL（用于 MD）
const GITEJSON_URL = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/news.json';  // 切换到 GitHub Raw

let currentPage = 0;
const itemsPerPage = 6;
let filteredNews = null;
const CACHE_DURATION = 60 * 60 * 1000;

document.addEventListener('DOMContentLoaded', async function() {
    
    // 工具函数：创建 DOM 元素
    function createDOMElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        if (content) element.innerHTML = content;
        return element;
    }

    // 工具函数：HTML 编码
    function encodeHTML(str) {
        return str.replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match]));
    }

    // 工具函数：防抖
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 全局初始化
    async function initializeApp() {
        console.log('检查 DOM 元素:', {
            newsGrid: !!document.querySelector('#news-grid'),
            paginationContainer: !!document.querySelector('#news-pagination'),
            newsDetail: !!document.querySelector('#news-detail'),
            galleryGrid: !!document.querySelector('.gallery-grid'),
            lightbox: !!document.querySelector('.lightbox')
        });

        try {
            const response = await fetch(GITEJSON_URL, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`无法加载 news.json: ${response.status} - ${response.statusText}`);
            }
            const data = await response.json();
            console.log('news.json 加载成功:', data);
            localStorage.setItem('news-cache', JSON.stringify(data));
            localStorage.setItem('news-cache-timestamp', new Date().getTime().toString());
        } catch (error) {
            console.error('加载新闻失败:', error.message);
            const cached = localStorage.getItem('news-cache');
            if (cached) {
                data = JSON.parse(cached);
            }
        }
    }

    // 渲染新闻详情
    async function renderNewsDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const newsId = urlParams.get('id');
        const newsDetail = document.querySelector('#news-detail');

        if (!newsId || !newsDetail) {
            console.error('无效的新闻 ID 或未找到详情容器', { newsId, newsDetailExists: !!newsDetail });
            newsDetail.innerHTML = '<p class="error-message">无效的新闻 ID</p>';
            return;
        }

        const cachedNews = JSON.parse(localStorage.getItem('news-cache') || '[]');
        console.log('Cached news IDs:', cachedNews.map(item => item.id));
        const item = cachedNews.find(item => item.id == newsId);

        if (!item) {
            console.error('未找到对应的新闻，ID:', newsId, 'Available IDs:', cachedNews.map(item => item.id));
            newsDetail.innerHTML = '<p class="error-message">未找到对应的新闻 (ID: ' + newsId + ')</p>';
            return;
        }

        try {
            const fullContentUrl = item.content.startsWith('http') ? item.content : GITHUB_RAW_BASE + item.content;
            console.log(`加载详情 Markdown: ${fullContentUrl}`);
            const response = await fetch(fullContentUrl, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`无法加载 Markdown 内容: ${fullContentUrl} (Status: ${response.status})`);
            }
            const markdownContent = await response.text();

            newsDetail.innerHTML = `
                <h2>${encodeHTML(item.title)}</h2>
                <div class="news-date">${item.date}</div>
                <img class="news-img" src="${item.image}" alt="${encodeHTML(item.title)}" onerror="this.src='./images/fallback-image.jpg'; this.alt='主图片加载失败';">
                <div class="news-tags">
                    ${item.tags?.map(tag => `<span class="tag">${encodeHTML(tag)}</span>`).join('') || ''}
                </div>
                <div class="news-content">${marked.parse(markdownContent)}</div>
            `;

            await renderGallery(item);
        } catch (error) {
            console.error(`渲染新闻 ${item.id} 失败: ${error.message}`);
            newsDetail.innerHTML = '<p class="error-message">加载新闻内容失败</p>';
        }
    }
    // 渲染画廊和 lightbox
    async function renderGallery(item) {
        const galleryGrid = document.querySelector('.gallery-grid');
        const lightbox = document.querySelector('.lightbox');
        const lightboxImage = document.querySelector('.lightbox-image');
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxPrev = document.querySelector('.lightbox-prev');
        const lightboxNext = document.querySelector('.lightbox-next');

        if (!galleryGrid || !lightbox || !lightboxImage || !lightboxClose || !lightboxPrev || !lightboxNext) {
            console.error('未找到画廊或 lightbox 元素', {
                galleryGrid: !!galleryGrid,
                lightbox: !!lightbox,
                lightboxImage: !!lightboxImage,
                lightboxClose: !!lightboxClose,
                lightboxPrev: !!lightboxPrev,
                lightboxNext: !!lightboxNext
            });
            if (galleryGrid) {
                galleryGrid.innerHTML = '<p class="error-message">画廊初始化失败</p>';
            }
            return;
        }

        // 清空画廊并移除现有事件监听器
        galleryGrid.innerHTML = '';
        const existingImages = galleryGrid.querySelectorAll('img');
        existingImages.forEach(img => img.replaceWith(img.cloneNode(true))); // 移除旧的事件监听器

        if (item.additionalImages && item.additionalImages.length > 0) {
            let currentIndex = 0;

            // 渲染画廊图片
            item.additionalImages.forEach((imgUrl, index) => {
                const galleryItem = createDOMElement('div', { class: 'gallery-item' });
                const img = createDOMElement('img', {
                    src: imgUrl,
                    alt: `附加图片 ${index + 1}`,
                    'data-index': index
                });
                img.onerror = () => {
                    console.error(`图片加载失败: ${imgUrl}`);
                    img.src = './images/fallback-image.jpg'; // 请替换为实际的备用图片路径
                    img.alt = '图片加载失败';
                };
                img.addEventListener('click', () => {
                    currentIndex = index;
                    lightboxImage.src = imgUrl;
                    lightboxImage.dataset.index = index;
                    lightboxImage.onerror = () => {
                        console.error(`Lightbox 图片加载失败: ${imgUrl}`);
                        lightboxImage.src = './images/fallback-image.jpg';
                    };
                    lightbox.style.display = 'flex';
                    console.log('显示 lightbox，当前图片:', imgUrl);
                });
                galleryItem.appendChild(img);
                galleryGrid.appendChild(galleryItem);
            });

            // 移除旧的事件监听器并重新绑定
            const newClose = lightboxClose.cloneNode(true);
            lightboxClose.replaceWith(newClose);
            newClose.addEventListener('click', () => {
                lightbox.style.display = 'none';
                console.log('关闭 lightbox');
            });

            const newPrev = lightboxPrev.cloneNode(true);
            lightboxPrev.replaceWith(newPrev);
            newPrev.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    lightboxImage.src = item.additionalImages[currentIndex];
                    lightboxImage.dataset.index = currentIndex;
                    console.log('切换到上一张图片:', item.additionalImages[currentIndex]);
                }
            });

            const newNext = lightboxNext.cloneNode(true);
            lightboxNext.replaceWith(newNext);
            newNext.addEventListener('click', () => {
                if (currentIndex < item.additionalImages.length - 1) {
                    currentIndex++;
                    lightboxImage.src = item.additionalImages[currentIndex];
                    lightboxImage.dataset.index = currentIndex;
                    console.log('切换到下一张图片:', item.additionalImages[currentIndex]);
                }
            });
        } else {
            galleryGrid.innerHTML = '<p class="empty-message">暂无更多图片</p>';
        }
    }

    async function loadNews() {
        console.time('loadNews'); // 开始计时
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) {
            console.error('news-grid 未找到');
            return;
        }
    
        let items = filteredNews || allNewsWithContent;
        if (!items || items.length === 0) {
            newsGrid.innerHTML = '<p class="empty-message">暂无新闻</p>';
            document.getElementById('news-pagination').innerHTML = '';
            console.timeEnd('loadNews');
            return;
        }
    
        const pinnedItems = items.filter(item => item.pinned).sort((a, b) => b.id - a.id);
        const nonPinnedItems = items.filter(item => !item.pinned).sort((a, b) => b.id - a.id);
        const totalItems = items.length;
        const totalPinnedItems = pinnedItems.length;
        const totalNonPinnedItems = nonPinnedItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
    
        const startIndex = currentPage * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;
    
        let itemsToShow = [];
        const pinnedStart = Math.min(startIndex, totalPinnedItems);
        const pinnedEnd = Math.min(endIndex, totalPinnedItems);
        if (pinnedStart < totalPinnedItems) {
            itemsToShow = pinnedItems.slice(pinnedStart, pinnedEnd);
        }
    
        const remainingSlots = itemsPerPage - (pinnedEnd - pinnedStart);
        if (remainingSlots > 0 && endIndex > totalPinnedItems) {
            const nonPinnedStart = Math.max(0, startIndex - totalPinnedItems);
            const nonPinnedEnd = Math.min(nonPinnedStart + remainingSlots, totalNonPinnedItems);
            if (nonPinnedStart < totalNonPinnedItems) {
                itemsToShow = itemsToShow.concat(nonPinnedItems.slice(nonPinnedStart, nonPinnedEnd));
            }
        }
    
        newsGrid.innerHTML = '';
        newsGrid.style.display = 'block !important';
        newsGrid.style.visibility = 'visible !important';
        console.log('渲染新闻:', itemsToShow.length, '起始索引:', startIndex, '结束索引:', endIndex);
        await renderNewsItems(itemsToShow);
        renderPagination(totalItems, totalPages);
        console.timeEnd('loadNews'); // 结束计时
    }

    async function preloadMarkdownContent(newsData) {
        console.log('预加载 Markdown 内容...');
        const now = Date.now();
        const cached = localStorage.getItem('news-full-cache');
        const timestamp = localStorage.getItem('news-full-cache-timestamp');
    
        if (cached && timestamp && (now - parseInt(timestamp)) < CACHE_DURATION) {
            allNewsWithContent = JSON.parse(cached);
            console.log('使用缓存的完整新闻数据');
            return;
        }
    
        // 限制并发请求（例如，5 个同时请求）
        const batchSize = 5;
        for (let i = 0; i < newsData.length; i += batchSize) {
            const batch = newsData.slice(i, i + batchSize);
            await Promise.all(batch.map(async item => {
                try {
                    const response = await fetch(item.content, { cache: 'no-store' });
                    if (!response.ok) throw new Error(`无法加载: ${item.content}`);
                    item.markdownContent = await response.text();
                } catch (error) {
                    console.error(`预加载 ${item.id} 失败: ${error.message}`);
                    item.markdownContent = '内容加载失败';
                }
            }));
        }
        allNewsWithContent = newsData;
        localStorage.setItem('news-full-cache', JSON.stringify(allNewsWithContent));
        localStorage.setItem('news-full-cache-timestamp', now.toString());
        console.log('Markdown 预加载完成');
    }

    // 渲染新闻详情
    async function renderNewsDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const newsId = urlParams.get('id');
        const newsDetail = document.querySelector('#news-detail');
    
        if (!newsId || !newsDetail) {
            console.error('无效的新闻 ID 或未找到详情容器', { newsId, newsDetailExists: !!newsDetail });
            newsDetail.innerHTML = '<p class="error-message">无效的新闻 ID</p>';
            return;
        }
    
        const cachedNews = JSON.parse(localStorage.getItem('news-cache') || '[]');
        console.log('Cached news IDs:', cachedNews.map(item => item.id));  // 新增：打印所有 ID
        const item = cachedNews.find(item => item.id == newsId);
    
        if (!item) {
            console.error('未找到对应的新闻，ID:', newsId, 'Available IDs:', cachedNews.map(item => item.id));
            newsDetail.innerHTML = '<p class="error-message">未找到对应的新闻 (ID: ' + newsId + ')</p>';
            return;
        }
    
        try {
            const fullContentUrl = item.content.startsWith('http') ? item.content : GITHUB_RAW_BASE + item.content;
            console.log(`加载详情 Markdown: ${fullContentUrl}`);
            const response = await fetch(fullContentUrl, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`无法加载 Markdown 内容: ${fullContentUrl} (Status: ${response.status})`);
            }
            const markdownContent = await response.text();
    
            // 渲染结构（仅将 Markdown 内容放到 .news-content 中）
            newsDetail.innerHTML = `
                <h2>${encodeHTML(item.title)}</h2>
                <div class="news-date">${item.date}</div>
                <img class="news-img" src="${item.image}" alt="${encodeHTML(item.title)}" onerror="this.src='./images/fallback-image.jpg'; this.alt='主图片加载失败';">
                <div class="news-tags">
                    ${item.tags?.map(tag => `<span class="tag">${encodeHTML(tag)}</span>`).join('') || ''}
                </div>
                <div class="news-content">${marked.parse(markdownContent)}</div>
            `;
    
            // 渲染画廊
            await renderGallery(item);
    
            // 配置 marked 的高亮（如果未全局配置，在这里设置）
            marked.setOptions({
                highlight: function(code, lang) {
                    if (typeof hljs !== 'undefined') {
                        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                        return hljs.highlight(code, { language }).value;
                    }
                    return code; // 回退到无高亮
                }
            });
    
            // 仅对代码块应用高亮（避免整个容器被高亮）
            if (typeof hljs !== 'undefined') {
                const codeBlocks = newsDetail.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    hljs.highlightElement(block);
                });
                console.log(`Highlight.js applied to ${codeBlocks.length} code blocks`);
            } else {
                console.error('Highlight.js is not available');
            }
    
        } catch (error) {
            console.error(`渲染新闻 ${item.id} 失败: ${error.message}`);
            newsDetail.innerHTML = '<p class="error-message">加载新闻内容失败</p>';
        }
    }

    // 汉堡菜单
    function initHamburgerMenu() {
        const menuButton = document.querySelector('.menu-button');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuButton && navLinks) {
            menuButton.addEventListener('click', function() {
                navLinks.classList.toggle('responsive');
                
                const icon = menuButton.querySelector('i');
                if (navLinks.classList.contains('responsive')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
            
            const navItems = navLinks.querySelectorAll('a');
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    if (navLinks.classList.contains('responsive')) {
                        navLinks.classList.remove('responsive');
                        const icon = menuButton.querySelector('i');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
            });
        }
    }

    // 初始化下拉菜单
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            dropdown.addEventListener('mouseenter', function() {
                if (window.innerWidth >= 768) {
                    menu.style.display = 'block';
                    setTimeout(() => {
                        menu.style.opacity = '1';
                        menu.style.transform = 'translateY(0)';
                    }, 10);
                }
            });
            
            dropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth >= 768) {
                    menu.style.opacity = '0';
                    menu.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        menu.style.display = 'none';
                    }, 300);
                }
            });
            
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                    menu.style.opacity = menu.style.display === 'block' ? '1' : '0';
                    menu.style.transform = menu.style.display === 'block' ? 'translateY(0)' : 'translateY(10px)';
                }
            });
        });
    }

    // 初始化
    await initializeApp();
    if (window.location.pathname.includes('news-detail.html')) {
        await renderNewsDetail();
    }
    initHamburgerMenu();
    initDropdowns();
});


