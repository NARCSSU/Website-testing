
// 全局变量
let currentPage = 0;
let itemsPerPage = window.innerWidth <= 768 ? 3 : 6;
let filteredNews = null;
let allNewsWithContent = [];
const CACHE_DURATION = 60 * 60 * 1000;
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/news.json';
const GITEJSON_URL = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/news.json';
const SITE_DOMAIN = window.location.hostname || '';

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('/news/news')) {
        console.warn('检测到错误 URL，重定向到 /news.html');
        window.location.href = '/news.html';
    }
});

// 检查 document 和 marked 是否可用
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
        // 调试：记录 href 值
        console.log('渲染链接:', { href, title, text });
        // 检查 href 是否为字符串
        const isValidHref = typeof href === 'string' && href.trim() !== '';
        const isExternal = isValidHref && !href.startsWith('/') && !href.includes(SITE_DOMAIN) && !href.startsWith('#');
        const svgIcon = isExternal ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4 ml-1 align-sub" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path></svg>` : '';
        // 若 href 无效，返回纯文本
        if (!isValidHref) {
            console.warn(`无效的 href: ${href}，返回纯文本: ${text}`);
            return text;
        }
        return `<a href="${href}" ${title ? `title="${title}"` : ''} class="${isExternal ? 'external-link' : ''}">${text}${svgIcon}</a>`;
    };
    marked.setOptions({ renderer });
    return true;
}

// 延迟初始化 marked
function tryInitializeMarked(attempts = 5, delay = 100) {
    if (initializeMarked()) return;
    if (attempts <= 0) {
        console.error('多次尝试后仍无法加载 marked，放弃初始化');
        return;
    }
    setTimeout(() => tryInitializeMarked(attempts - 1, delay * 2), delay);
}

// 监听窗口大小变化
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        itemsPerPage = window.innerWidth <= 768 ? 3 : 6;
        loadNews();
    });
}

function getUniqueTags(newsData) {
    const tagsSet = new Set();
    newsData.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(tag => tagsSet.add(tag));
        }
    });
    return Array.from(tagsSet).sort();
}

function encodeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
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

    for (const item of newsData) {
        try {
            const fullContentUrl = item.content.startsWith('http') ? item.content : GITHUB_RAW_BASE + item.content;
            console.log(`加载 Markdown: ${fullContentUrl}`);
            const response = await fetch(fullContentUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`无法加载: ${fullContentUrl} (Status: ${response.status})`);
            const markdownContent = await response.text();
            item.markdownContent = markdownContent;
        } catch (error) {
            console.error(`预加载 ${item.id} 失败: ${error.message}`);
            item.markdownContent = '内容加载失败';
        }
    }
    allNewsWithContent = newsData;
    localStorage.setItem('news-full-cache', JSON.stringify(allNewsWithContent));
    localStorage.setItem('news-full-cache-timestamp', now.toString());
    console.log('Markdown 预加载完成');
}

async function initializeApp() {
    if (typeof document === 'undefined') {
        console.error('document 未定义，无法初始化应用');
        return;
    }
    const newsGrid = document.getElementById('news-grid');
    console.log('检查 DOM 元素:', {
        newsGrid: !!newsGrid,
        paginationContainer: !!document.querySelector('#news-pagination'),
        newsDetail: !!document.querySelector('#news-detail')
    });

    if (!newsGrid) {
        console.error('news-grid 未找到');
        return;
    }
    newsGrid.innerHTML = '<p class="loading-message">加载中...</p>';

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
        newsGrid.innerHTML = '';
    } catch (error) {
        console.error('加载新闻失败:', error.message);
        const cached = localStorage.getItem('news-cache');
        if (cached) {
            allNewsWithContent = JSON.parse(cached);
            await preloadMarkdownContent(allNewsWithContent);
            newsGrid.innerHTML = '';
            console.log('使用缓存数据初始化');
        } else {
            newsGrid.innerHTML = '<p class="error-message">无法加载新闻，请稍后重试</p>';
        }
    }
}

async function renderNewsItems(items, append = false) {
    if (typeof document === 'undefined') {
        console.error('document 未定义，无法渲染新闻');
        return;
    }
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) {
        console.error('news-grid 未找到');
        return;
    }
    if (!append) newsGrid.innerHTML = '';

    for (const item of items) {
        try {
            const markdownContent = item.markdownContent || '内容加载失败';
            const newsItemDiv = document.createElement('div');
            newsItemDiv.className = `news-item${item.pinned ? ' pinned' : ''}`;
            newsItemDiv.setAttribute('data-news-id', item.id);
            newsItemDiv.style.cursor = 'pointer';
            newsItemDiv.addEventListener('click', () => {
                window.location.href = `news-detail.html?id=${item.id}`;
            });

            let imageUrl = encodeHTML(item.image) || './placeholder.jpg';
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                imageUrl = `./${imageUrl}`;
            }

            newsItemDiv.innerHTML = `
                ${item.pinned ? '<span class="pinned-icon">📌</span>' : ''}
                <h2>${encodeHTML(item.title)}</h2>
                <span class="news-date">${encodeHTML(item.date)}</span>
                <div class="news-tags">
                    ${item.tags?.map(tag => `<span class="tag">${encodeHTML(tag)}</span>`).join('') || ''}
                </div>
                <div class="news-img" style="background-image: url('${imageUrl}');"></div>
                <div class="news-content">${typeof marked !== 'undefined' ? marked.parse(markdownContent) : markdownContent}</div>
            `;

            newsGrid.appendChild(newsItemDiv);
            console.log(`新闻 ${item.id} 渲染完成`);
        } catch (error) {
            console.error(`渲染新闻 ${item.id} 失败:`, error.message);
        }
    }
}

function renderPagination(totalItems, totalPages) {
    if (typeof document === 'undefined') return;
    const paginationContainer = document.getElementById('news-pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = `pagination-btn ${currentPage === 0 ? 'disabled' : ''}`;
    prevBtn.textContent = '上一页';
    prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            loadNews();
        }
    });
    paginationContainer.appendChild(prevBtn);

    for (let i = 0; i < totalPages; i++) {
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
    nextBtn.className = `pagination-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextBtn.textContent = '下一页';
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            loadNews();
        }
    });
    paginationContainer.appendChild(nextBtn);
}

async function loadNews() {
    const newsToDisplay = filteredNews || allNewsWithContent;
    const totalItems = newsToDisplay.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = newsToDisplay.slice(startIndex, endIndex);

    if (typeof document !== 'undefined') {
        const newsGrid = document.getElementById('news-grid');
        if (newsGrid) {
            newsGrid.style.display = 'block !important';
            newsGrid.style.visibility = 'visible !important';
        }
    }

    console.log('渲染新闻:', itemsToShow.length, '起始索引:', startIndex, '结束索引:', endIndex, '总页:', totalPages);
    await renderNewsItems(itemsToShow);
    renderPagination(totalItems, totalPages);
}

async function filterNews() {
    if (typeof document === 'undefined') return;
    const searchInput = document.querySelector('#news-search-input');
    const tagSelect = document.querySelector('#tag-select');
    const query = searchInput?.value.trim().toLowerCase() || '';
    const selectedTag = tagSelect?.value || '';

    console.log('筛选参数:', { query, selectedTag });

    currentPage = 0;
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) {
        console.error('新闻网格未找到');
        return;
    }
    newsGrid.innerHTML = '';

    if (query === '' && selectedTag === '') {
        console.log('无筛选条件，重置到完整新闻列表');
        filteredNews = null;
        await loadNews();
        return;
    }

    filteredNews = allNewsWithContent.filter(item => {
        const matchesTag = selectedTag === '' || (item.tags && item.tags.includes(selectedTag));
        const matchesSearch = query === '' || 
            item.title.toLowerCase().includes(query) || 
            (item.markdownContent || '').toLowerCase().includes(query);
        
        console.log(`检查新闻 ${item.id}:`, { matchesTag, matchesSearch });
        return matchesSearch && matchesTag;
    });

    console.log('筛选结果:', { filteredNewsLength: filteredNews.length });

    if (filteredNews.length === 0) {
        newsGrid.innerHTML = '<p class="empty-message">暂无匹配的新闻</p>';
        document.getElementById('news-pagination').innerHTML = '';
        return;
    }

    await loadNews();
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
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

// DOM 加载完成
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('DOM 加载完成，开始初始化');
        console.log('当前域名 (SITE_DOMAIN):', SITE_DOMAIN);
        
        // 尝试初始化 marked
        tryInitializeMarked();
        
        const tagSelect = document.getElementById('tag-select');
        const searchInput = document.getElementById('news-search-input');
        
        if (tagSelect) {
            tagSelect.addEventListener('change', filterNews);
        }
        if (searchInput) {
            searchInput.addEventListener('input', debounce(filterNews, 300));
        }

        await initializeApp();

        if (tagSelect && allNewsWithContent.length > 0) {
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

        if (window.location.pathname.includes('news.html')) {
            await loadNews();
        }

        initHamburgerMenu();
        console.log('初始化完成');
    });
} else {
    console.error('document 未定义，无法绑定 DOMContentLoaded 事件');
}