/**
 * 新闻功能模块
 * 包含新闻列表、详情、分页、搜索等功能
 */

class NewsManager {
    constructor() {
        this.currentPage = 0;
        this.itemsPerPage = window.innerWidth <= 768 ? 3 : 6;
        this.filteredNews = null;
        this.allNewsWithContent = [];
        this.NEWS_STORAGE_KEY = 'session_news_data';
        this.CACHE_DURATION = 24 * 60 * 60 * 1000;
        this.GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/';
        this.GITEJSON_URL = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/news.json';
        this.SITE_DOMAIN = window.location.hostname || '';
        this.errorLogged = new Set();
        
        this.init();
    }

    init() {
        this.initFromStorage();
        this.initMarked();
        this.initEventListeners();
    }

    // 从sessionStorage初始化数据
    initFromStorage() {
        const stored = sessionStorage.getItem(this.NEWS_STORAGE_KEY);
        if (stored) {
            try {
                this.allNewsWithContent = JSON.parse(stored);
                console.log('从sessionStorage恢复新闻数据');
            } catch (e) {
                console.error('解析sessionStorage数据失败', e);
                sessionStorage.removeItem(this.NEWS_STORAGE_KEY);
            }
        }
    }

    // 初始化marked库
    initMarked() {
        if (typeof document === 'undefined') {
            console.error('document 未定义，可能在非浏览器环境运行或 DOM 未加载');
            return false;
        }
        if (typeof marked === 'undefined') {
            console.error('marked 库未加载，请确保 marked 库已加载');
            return false;
        }
        console.log('marked 库加载成功，版本:', marked.version || '未知');
        const renderer = new marked.Renderer();
        renderer.link = (href, title, text) => {
            const isValidHref = typeof href === 'string' && href.trim() !== '';
            const isExternal = isValidHref && !href.startsWith('/') && !href.includes(this.SITE_DOMAIN) && !href.startsWith('#');
            const svgIcon = isExternal ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4 ml-1 align-sub" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path></svg>` : '';
            if (!isValidHref) return text;
            return `<a href="${href}" ${title ? `title="${title}"` : ''} class="${isExternal ? 'external-link' : ''}">${text}${svgIcon}</a>`;
        };
        marked.setOptions({ renderer });
        return true;
    }

    // 延迟初始化marked
    tryInitializeMarked(attempts = 5, delay = 100) {
        if (this.initMarked()) return;
        if (attempts <= 0) {
            console.error('多次尝试后仍无法加载 marked，放弃初始化');
            return;
        }
        console.log(`尝试初始化marked，剩余尝试次数: ${attempts}`);
        setTimeout(() => this.tryInitializeMarked(attempts - 1, delay * 2), delay);
    }

    // 初始化事件监听器
    initEventListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', debounce(() => {
                this.itemsPerPage = window.innerWidth <= 768 ? 3 : 6;
                this.loadNews();
            }, 200));
        }
    }

    // 预加载Markdown内容
    async preloadMarkdownContent(newsData) {
        console.log('预加载 Markdown 内容...');
        const now = Date.now();
        const cached = localStorage.getItem('news-full-cache');
        const timestamp = localStorage.getItem('news-full-cache-timestamp');

        if (cached && timestamp && (now - parseInt(timestamp)) < this.CACHE_DURATION) {
            this.allNewsWithContent = JSON.parse(cached);
            console.log('使用缓存的完整新闻数据');
            sessionStorage.setItem(this.NEWS_STORAGE_KEY, JSON.stringify(this.allNewsWithContent));
            return;
        }

        for (const item of newsData) {
            try {
                const fullContentUrl = item.content.startsWith('http') 
                    ? item.content 
                    : `${this.GITHUB_RAW_BASE}${item.content}`;
                console.log(`加载 Markdown: ${fullContentUrl}`);
                const response = await fetch(fullContentUrl, { cache: 'no-store' });
                if (!response.ok) throw new Error(`无法加载: ${fullContentUrl} (状态: ${response.status})`);
                const markdownContent = await response.text();
                item.markdownContent = markdownContent || '暂无内容';
                item.additionalImages = item.additionalImages?.filter(url => url && url.trim() !== '') || [];
            } catch (error) {
                console.error(`预加载新闻 ${item.id} 失败: ${error.message}, URL: ${fullContentUrl}`);
                item.markdownContent = '内容加载失败';
            }
        }
        this.allNewsWithContent = newsData;
        localStorage.setItem('news-full-cache', JSON.stringify(this.allNewsWithContent));
        localStorage.setItem('news-full-cache-timestamp', now.toString());
        sessionStorage.setItem(this.NEWS_STORAGE_KEY, JSON.stringify(this.allNewsWithContent));
        console.log('新闻数据加载完成并缓存到sessionStorage');
    }

    // 获取唯一标签
    getUniqueTags(newsData) {
        const tagsSet = new Set();
        newsData.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet);
    }

    // 筛选新闻
    filterNews() {
        const tagSelect = document.getElementById('tag-select');
        const searchInput = document.getElementById('news-search-input');
        const tag = tagSelect ? tagSelect.value : '';
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        console.log('筛选条件:', { tag, query });

        this.filteredNews = this.allNewsWithContent.filter(item => {
            const matchesTag = !tag || (item.tags && item.tags.includes(tag));
            const dateStr = item.date ? new Date(item.date).toLocaleDateString('zh-CN') : '';
            const matchesQuery = !query || 
                (item.title && item.title.toLowerCase().includes(query)) || 
                (item.markdownContent && item.markdownContent.toLowerCase().includes(query)) ||
                (dateStr.toLowerCase().includes(query));
            return matchesTag && matchesQuery;
        });

        console.log('筛选结果:', { filteredNewsCount: this.filteredNews.length });

        this.currentPage = 0;
        this.loadNews();
    }

    // 初始化应用
    async initializeApp() {
        console.log('检查 DOM 元素:', {
            newsGrid: !!document.querySelector('#news-grid'),
            paginationContainer: !!document.querySelector('#news-pagination'),
            tagSelect: !!document.getElementById('tag-select'),
            searchInput: !!document.getElementById('news-search-input')
        });

        try {
            const response = await fetch(this.GITEJSON_URL, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`无法加载 news.json: ${response.status} - ${response.statusText}`);
            }
            const data = await response.json();
            console.log('news.json 加载成功:', data);
            localStorage.setItem('news-cache', JSON.stringify(data));
            localStorage.setItem('news-cache-timestamp', new Date().getTime().toString());
            await this.preloadMarkdownContent(data);
            console.log('allNewsWithContent:', this.allNewsWithContent);
        } catch (error) {
            console.error('初始化加载 news.json 失败:', error.message);
            const newsGrid = document.querySelector('#news-grid');
            if (newsGrid) {
                newsGrid.innerHTML = `
                    <p class="error-message">
                        无法加载新闻数据，请检查网络或稍后重试
                        <button onclick="newsManager.initializeApp(); newsManager.loadNews();">重试</button>
                    </p>`;
            }
        }
    }

    // 更新分页
    updatePagination(totalItems) {
        const paginationContainer = document.getElementById('news-pagination');
        if (!paginationContainer) return;

        const pageCount = Math.ceil(totalItems / this.itemsPerPage);
        paginationContainer.innerHTML = '';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = '上一页';
        prevBtn.disabled = this.currentPage === 0;
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadNews();
            }
        });
        paginationContainer.appendChild(prevBtn);

        for (let i = 0; i < pageCount; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
            btn.textContent = i + 1;
            btn.addEventListener('click', () => {
                this.currentPage = i;
                this.loadNews();
            });
            paginationContainer.appendChild(btn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = '下一页';
        nextBtn.disabled = this.currentPage === pageCount - 1;
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < pageCount - 1) {
                this.currentPage++;
                this.loadNews();
            }
        });
        paginationContainer.appendChild(nextBtn);
    }

    // 加载新闻
    async loadNews() {
        const newsGrid = document.querySelector('#news-grid');
        if (!newsGrid) return;
        
        this.initFromStorage();
        
        if (!this.allNewsWithContent || this.allNewsWithContent.length === 0) {
            await this.initializeApp();
        }

        try {
            let newsData = this.filteredNews !== null ? this.filteredNews : this.allNewsWithContent;

            // 排序逻辑
            newsData = newsData.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return new Date(b.date) - new Date(a.date);
            });

            // 分页逻辑
            const start = this.currentPage * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            const paginatedData = newsData.slice(start, end);

            newsGrid.innerHTML = '';
            let hasImage;

            paginatedData.forEach(item => {
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';

                if (item.pinned) {
                    newsItem.classList.add('pinned');
                }

                newsItem.addEventListener('click', () => {
                    window.location.href = `news-detail.html?id=${item.id}`;
                });

                const title = document.createElement('h3');
                title.innerHTML = item.pinned ? `📌 ${item.title}` : item.title;

                const meta = document.createElement('div');
                meta.className = 'news-meta';
                meta.innerHTML = `
                    <span class="news-date">${new Date(item.date).toLocaleDateString('zh-CN')}</span>
                    <div class="news-tags">
                        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                `;

                hasImage = false;
                const imgContainer = document.createElement('div');
                imgContainer.className = 'news-img';
                if (item.image && item.image.trim() !== '' && item.image !== '""') {
                    imgContainer.style.backgroundImage = `url('${item.image}')`;
                    hasImage = true;
                }
                if (!hasImage) {
                    newsItem.classList.add('no-image');
                }

                const content = document.createElement('div');
                content.className = 'news-content';
                const shortContent = item.markdownContent
                    ? item.markdownContent.substring(0, 100) + '...'
                    : '暂无内容';
                content.innerHTML = marked.parse(shortContent);

                newsItem.appendChild(title);
                newsItem.appendChild(meta);
                if (hasImage) newsItem.appendChild(imgContainer);
                newsItem.appendChild(content);

                newsGrid.appendChild(newsItem);
            });

            this.updatePagination(newsData.length);
        } catch (error) {
            console.error('加载新闻失败:', error);
            newsGrid.innerHTML = '<p class="error-message">加载新闻失败，请重试</p>';
        }
    }

    // 渲染新闻详情
    async renderNewsDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = parseInt(urlParams.get('id'));
        if (!id || !this.allNewsWithContent.length) {
            document.getElementById('news-detail').innerHTML = '<p class="error-message">新闻未找到</p>';
            document.title = '新闻未找到 - LuminolCraft';
            return;
        }
        const newsItem = this.allNewsWithContent.find(item => item.id === id);
        if (!newsItem) {
            document.getElementById('news-detail').innerHTML = '<p class="error-message">新闻未找到</p>';
            document.title = '新闻未找到 - LuminolCraft';
            return;
        }

        // 设置页面标题
        document.title = `${newsItem.title} - LuminolCraft`;

        const newsDetail = document.getElementById('news-detail');
        newsDetail.innerHTML = '';

        const title = document.createElement('h2');
        title.textContent = newsItem.pinned ? `📌 ${newsItem.title}` : newsItem.title;
        const date = document.createElement('div');
        date.className = 'news-date';
        date.textContent = new Date(newsItem.date).toLocaleDateString('zh-CN');
        const tags = document.createElement('div');
        tags.className = 'news-tags';
        newsItem.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.textContent = tag;
            tags.appendChild(tagEl);
        });

        let hasImage = false;
        const newsImgContainer = document.createElement('div');
        newsImgContainer.className = 'news-img';
        if (newsItem.image && newsItem.image.trim() !== '' && newsItem.image !== '""') {
            newsImgContainer.style.backgroundImage = `url('${newsItem.image}')`;
            newsImgContainer.style.height = '400px';
            newsImgContainer.style.width = '100%';
            hasImage = true;
        }
        if (!hasImage) {
            newsDetail.classList.add('no-image');
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'news-content';
        contentDiv.innerHTML = marked.parse(newsItem.markdownContent || '');

        const gallerySection = document.createElement('div');
        gallerySection.className = 'gallery-section';
        const galleryTitle = document.createElement('h3');
        galleryTitle.textContent = '附加图片';
        gallerySection.appendChild(galleryTitle);
        const galleryGrid = document.createElement('div');
        galleryGrid.className = 'gallery-grid';
        if (newsItem.additionalImages && newsItem.additionalImages.length > 0) {
            newsItem.additionalImages.forEach(imgUrl => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                const galleryImg = document.createElement('img');
                galleryImg.src = imgUrl;
                galleryImg.alt = '附加图片';
                galleryImg.onerror = () => {
                    galleryImg.src = 'https://via.placeholder.com/200x150/9e94d8/ffffff?text=附加图片不可用';
                    console.warn(`附加图片加载失败: ${imgUrl}，使用占位符`);
                };
                galleryItem.appendChild(galleryImg);
                galleryGrid.appendChild(galleryItem);
                galleryImg.addEventListener('click', () => {
                    const lightbox = document.querySelector('.lightbox');
                    const lightboxImg = document.querySelector('.lightbox-image');
                    lightboxImg.src = imgUrl;
                    lightboxImg.onerror = () => {
                        lightboxImg.src = 'https://via.placeholder.com/300x200/9e94d8/ffffff?text=图片不可用';
                    };
                    lightbox.style.display = 'flex';
                });
            });
        } else {
            galleryGrid.innerHTML = '<p class="empty-message">暂无附加图片</p>';
        }
        gallerySection.appendChild(galleryGrid);

        newsDetail.appendChild(title);
        newsDetail.appendChild(date);
        newsDetail.appendChild(tags);
        newsDetail.appendChild(newsImgContainer);
        newsDetail.appendChild(contentDiv);
        newsDetail.appendChild(gallerySection);

        const lightbox = document.querySelector('.lightbox');
        if (lightbox) {
            document.querySelector('.lightbox-close').addEventListener('click', () => {
                lightbox.style.display = 'none';
            });
        }
    }

}

// 导出类（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsManager;
}
