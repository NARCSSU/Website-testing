// 全局变量
let currentPage = 0;
let itemsPerPage = window.innerWidth <= 768 ? 3 : 6;
let filteredNews = null;
let allNewsWithContent = [];
const NEWS_STORAGE_KEY = 'session_news_data';
const CACHE_DURATION = 24*60 * 60 * 1000;
// const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/';
const GITHUB_RAW_BASE = 'https://luminolcraft-news.pages.dev/';
const GITEJSON_URL = 'https://luminolcraft-news.pages.dev/news.json';
const SITE_DOMAIN = window.location.hostname || '';

// 新增：从sessionStorage初始化数据（解决刷新丢失问题）
function initNewsDataFromStorage() {
    const stored = sessionStorage.getItem(NEWS_STORAGE_KEY);
    if (stored) {
        try {
            allNewsWithContent = JSON.parse(stored);
            console.log('从sessionStorage恢复新闻数据');
        } catch (e) {
            console.error('解析sessionStorage数据失败', e);
            sessionStorage.removeItem(NEWS_STORAGE_KEY);
        }
    }
}

// 将GitHub URL转换为Cloudflare URL
function convertGitHubUrlToCloudflare(contentUrl) {
    if (!contentUrl.startsWith('http')) {
        // 相对路径，直接拼接Cloudflare基础URL
        return `${GITHUB_RAW_BASE}${contentUrl}`;
    }
    
    if (contentUrl.includes('raw.githubusercontent.com/LuminolCraft/news.json')) {
        // GitHub URL，转换为Cloudflare URL
        const path = contentUrl.split('raw.githubusercontent.com/LuminolCraft/news.json')[1];
        const cleanPath = path.replace('/refs/heads/main', '');
        return `https://luminolcraft-news.pages.dev${cleanPath}`;
    }
    
    // 其他情况，直接返回原URL
    return contentUrl;
}

async function preloadMarkdownContent(newsData) {
    console.log('预加载 Markdown 内容...');
    const now = Date.now();
    const cached = localStorage.getItem('news-full-cache');
    const timestamp = localStorage.getItem('news-full-cache-timestamp');

    if (cached && timestamp && (now - parseInt(timestamp)) < CACHE_DURATION) {
        allNewsWithContent = JSON.parse(cached);
        console.log('使用缓存的完整新闻数据');
        // 同步到sessionStorage
        sessionStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(allNewsWithContent));
        return;
    }

    for (const item of newsData) {
        try {
            const fullContentUrl = convertGitHubUrlToCloudflare(item.content);
            console.log(`加载 Markdown: ${fullContentUrl}`);
            const response = await fetch(fullContentUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`无法加载: ${fullContentUrl} (状态: ${response.status})`);
            const markdownContent = await response.text();
            item.markdownContent = markdownContent || '暂无内容'; // 确保非空
            item.additionalImages = item.additionalImages?.filter(url => url && url.trim() !== '') || [];
        } catch (error) {
            console.error(`预加载新闻 ${item.id} 失败: ${error.message}, URL: ${fullContentUrl}`);
            item.markdownContent = '内容加载失败';
        }
    }
    allNewsWithContent = newsData;
    localStorage.setItem('news-full-cache', JSON.stringify(allNewsWithContent));
    localStorage.setItem('news-full-cache-timestamp', now.toString());
    sessionStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(allNewsWithContent));
    console.log('新闻数据加载完成并缓存到sessionStorage');
}

function initializeMarked() {
    if (typeof document === 'undefined') {
        console.error('document 未定义，可能在非浏览器环境运行或 DOM 未加载');
        return false;
    }
    if (typeof marked === 'undefined') {
        console.error('marked 库未加载，请确保 <script src="https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js"> 在 news-script.js 之前');
        return false;
    }
    console.log('marked 库加载成功，版本:', marked.version || '未知');
    const renderer = new marked.Renderer();
    renderer.link = (href, title, text) => {
        const isValidHref = typeof href === 'string' && href.trim() !== '';
        const isExternal = isValidHref && !href.startsWith('/') && !href.includes(SITE_DOMAIN) && !href.startsWith('#');
        const svgIcon = isExternal ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4 ml-1 align-sub" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path></svg>` : '';
        if (!isValidHref) return text;
        return `<a href="${href}" ${title ? `title="${title}"` : ''} class="${isExternal ? 'external-link' : ''}">${text}${svgIcon}</a>`;
    };
    marked.setOptions({ renderer });
    return true;
}

function tryInitializeMarked(attempts = 5, delay = 100) {
    if (initializeMarked()) return;
    if (attempts <= 0) {
        console.error('多次尝试后仍无法加载 marked，放弃初始化');
        return;
    }
    setTimeout(() => tryInitializeMarked(attempts - 1, delay * 2), delay);
}

if (typeof window !== 'undefined') {
    window.addEventListener('resize', debounce(() => {
        itemsPerPage = window.innerWidth <= 768 ? 3 : 6;
        loadNews();
    }, 200)); // 新增防抖，避免频繁触发
}

function getUniqueTags(newsData) {
    const tagsSet = new Set();
    newsData.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(tag => tagsSet.add(tag));
        }
    });
    return Array.from(tagsSet);
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function filterNews() {
    const tagSelect = document.getElementById('tag-select');
    const searchInput = document.getElementById('news-search-input');
    const tag = tagSelect ? tagSelect.value : '';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    console.log('筛选条件:', { tag, query });

    filteredNews = allNewsWithContent.filter(item => {
        const matchesTag = !tag || (item.tags && item.tags.includes(tag));
        const dateStr = item.date ? new Date(item.date).toLocaleDateString('zh-CN') : '';
        const matchesQuery = !query || 
            (item.title && item.title.toLowerCase().includes(query)) || 
            (item.markdownContent && item.markdownContent.toLowerCase().includes(query)) ||
            (dateStr.toLowerCase().includes(query));
        return matchesTag && matchesQuery;
    });

    console.log('筛选结果:', { filteredNewsCount: filteredNews.length });

    currentPage = 0;
    loadNews();
}

async function initializeApp() {
    console.log('检查 DOM 元素:', {
        newsGrid: !!document.querySelector('#news-grid'),
        paginationContainer: !!document.querySelector('#news-pagination'),
        tagSelect: !!document.getElementById('tag-select'),
        searchInput: !!document.getElementById('news-search-input')
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
        await preloadMarkdownContent(data);
        console.log('allNewsWithContent:', allNewsWithContent);
    } catch (error) {
        console.error('初始化加载 news.json 失败:', error.message);
        const newsGrid = document.querySelector('#news-grid');
        if (newsGrid) {
            newsGrid.innerHTML = `
                <p class="error-message">
                    无法加载新闻数据，请检查网络或稍后重试
                    <button onclick="initializeApp(); loadNews();">重试</button>
                </p>`;
        }
    }
}

function updatePagination(totalItems) {
    const paginationContainer = document.getElementById('news-pagination');
    if (!paginationContainer) return;

    const pageCount = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '上一页';
    prevBtn.disabled = currentPage === 0;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            loadNews();
        }
    });
    paginationContainer.appendChild(prevBtn);

    for (let i = 0; i < pageCount; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i + 1;
        btn.addEventListener('click', () => {
            currentPage = i;
            loadNews();
        });
        paginationContainer.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '下一页';
    nextBtn.disabled = currentPage === pageCount - 1;
    nextBtn.addEventListener('click', () => {
        if (currentPage < pageCount - 1) {
            currentPage++;
            loadNews();
        }
    });
    paginationContainer.appendChild(nextBtn);
}

async function loadNews() {
    const newsGrid = document.querySelector('#news-grid');
    if (!newsGrid) return;
    
    // 先从sessionStorage恢复数据
    initNewsDataFromStorage();
    
    if (!allNewsWithContent || allNewsWithContent.length === 0) {
        await initializeApp();
    }

    try {
        let newsData = filteredNews !== null ? filteredNews : allNewsWithContent;

        // 排序逻辑保持不变
        newsData = newsData.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.date) - new Date(a.date);
        });

        // 分页逻辑保持不变
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
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

        updatePagination(newsData.length);
    } catch (error) {
        console.error('加载新闻失败:', error);
        newsGrid.innerHTML = '<p class="error-message">加载新闻失败，请重试</p>';
    }
}

function initHamburgerMenu() {
    if (typeof document === 'undefined') return;
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

function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (!toggle || !menu) return;

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
                if (e.target.classList.contains('menu-toggle')) {
                    e.preventDefault();
                }
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                menu.style.opacity = menu.style.display === 'block' ? '1' : '0';
                menu.style.transform = menu.style.display === 'block' ? 'translateY(0)' : 'translateY(10px)';
            }
        });
    });
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('DOM 加载完成，开始初始化');
        console.log('当前域名 (SITE_DOMAIN):', SITE_DOMAIN);
        
        // 先从sessionStorage恢复数据
        initNewsDataFromStorage();
        
        tryInitializeMarked();
        await initializeApp();

        const tagSelect = document.getElementById('tag-select');
        const searchInput = document.getElementById('news-search-input');
        
        if (tagSelect) {
            tagSelect.addEventListener('change', filterNews);
            if (allNewsWithContent.length > 0) {
                const uniqueTags = getUniqueTags(allNewsWithContent);
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
            searchInput.addEventListener('input', debounce(filterNews, 300));
        }

        // 确保页面加载时自动触发一次筛选（显示所有新闻）
        if (window.location.pathname.includes('news.html')) {
            await loadNews();
            // 初始状态无筛选条件时显示全部
            if (filteredNews === null) {
                filterNews();
            }
        }

        initHamburgerMenu();
        initDropdowns();
        console.log('初始化完成');
    });

    window.addEventListener('pageshow', async function(event) {
        if (event.persisted) {
            console.log('从缓存恢复页面，重新加载新闻');
        }
        if (window.location.pathname.includes('news.html')) {
            // 从sessionStorage恢复数据
            initNewsDataFromStorage();
            
            if (allNewsWithContent && allNewsWithContent.length > 0) {
                await loadNews();
                // 恢复后无筛选条件时显示全部
                if (filteredNews === null) {
                    filterNews();
                }
            } else if (typeof initializeApp === 'function') {
                await initializeApp().then(() => {
                    loadNews();
                    if (filteredNews === null) {
                        filterNews();
                    }
                });
            }
        }
    });
} else {
    console.error('document 未定义，无法绑定 DOMContentLoaded 事件');
}
