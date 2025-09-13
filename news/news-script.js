// 全局变量
let currentPage = 0;
let itemsPerPage = window.innerWidth <= 768 ? 3 : 6; // 移动端3个，桌面端6个
let filteredNews = null;
let allNewsWithContent = [];
const CACHE_DURATION = 60 * 60 * 1000;

// 监听窗口大小变化以动态调整 itemsPerPage
window.addEventListener('resize', () => {
    itemsPerPage = window.innerWidth <= 768 ? 3 : 6;
    loadNews(); // 重新加载新闻以应用新的分页
});

// 辅助函数：获取唯一标签
function getUniqueTags(newsData) {
    const tagsSet = new Set();
    newsData.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(tag => tagsSet.add(tag));
        }
    });
    return Array.from(tagsSet).sort();
}

// 辅助函数：转义 HTML（防止 XSS）
function encodeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
}

// 预加载 Markdown 内容
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
            const response = await fetch(item.content, { cache: 'no-store' });
            if (!response.ok) throw new Error(`无法加载: ${item.content}`);
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

// 渲染新闻项
async function renderNewsItems(items, append = false) {
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
                <div class="news-content">${marked.parse(markdownContent)}</div>
            `;

            newsGrid.appendChild(newsItemDiv);
            console.log(`新闻 ${item.id} 渲染完成`);
        } catch (error) {
            console.error(`渲染新闻 ${item.id} 失败: ${error.message}`);
        }
    }
    console.log('渲染新闻项完成');
}

// 渲染分页
function renderPagination(totalItems, totalPages) {
    const paginationContainer = document.getElementById('news-pagination');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    if (totalItems === 0 && !filteredNews?.some(item => item.pinned)) {
        return;
    }

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn' + (currentPage === 0 ? ' disabled' : '');
    prevBtn.disabled = currentPage === 0;
    prevBtn.textContent = '上一页';
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 0) {
            currentPage--;
            loadNews();
        }
    });
    paginationContainer.appendChild(prevBtn);

    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    startPage = Math.max(0, endPage - maxVisiblePages + 1);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = (i + 1).toString();
        pageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            loadNews();
        });
        paginationContainer.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn' + (currentPage === totalPages - 1 ? ' disabled' : '');
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.textContent = '下一页';
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages - 1) {
            currentPage++;
            loadNews();
        }
    });
    paginationContainer.appendChild(nextBtn);
}

// 加载新闻
async function loadNews() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) {
        console.error('news-grid 未找到');
        return;
    }

    let items = filteredNews || allNewsWithContent;
    if (!items || items.length === 0) {
        newsGrid.innerHTML = '<p class="empty-message">暂无新闻</p>';
        document.getElementById('news-pagination').innerHTML = '';
        return;
    }

    // 分离置顶和非置顶新闻
    const pinnedItems = items.filter(item => item.pinned).sort((a, b) => b.id - a.id); // 降序排序
    const nonPinnedItems = items.filter(item => !item.pinned).sort((a, b) => b.id - a.id); // 降序排序
    const totalItems = items.length;
    const totalPinnedItems = pinnedItems.length;
    const totalNonPinnedItems = nonPinnedItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // 计算当前页的起始和结束索引
    const startIndex = currentPage * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;

    // 优先显示置顶项
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
}

// 筛选新闻
async function filterNews() {
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

// 防抖函数
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 初始化应用
async function initializeApp() {
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
        const response = await fetch('https://raw.githubusercontent.com/LuminolCraft/news.json/refs/heads/main/news.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`无法加载 news.json: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log('news.json 加载成功:', data);
        localStorage.setItem('news-cache', JSON.stringify(data));
        localStorage.setItem('news-cache-timestamp', new Date().getTime().toString());

        await preloadMarkdownContent(data);
        newsGrid.innerHTML = ''; // 清除加载提示
    } catch (error) {
        console.error('加载新闻失败:', error.message);
        const cached = localStorage.getItem('news-cache');
        if (cached) {
            allNewsWithContent = JSON.parse(cached);
            await preloadMarkdownContent(allNewsWithContent);
            newsGrid.innerHTML = ''; // 清除加载提示
        } else {
            newsGrid.innerHTML = '<p class="error-message">无法加载新闻，请稍后重试</p>';
        }
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

// DOM 加载完成
document.addEventListener('DOMContentLoaded', async function() {
    const tagSelect = document.getElementById('tag-select');
    const searchInput = document.getElementById('news-search-input');
    if (tagSelect) {
        tagSelect.addEventListener('change', filterNews);
    }
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterNews, 300));
    }

    await initializeApp();

    // 填充标签筛选下拉菜单
    if (tagSelect && allNewsWithContent.length > 0) {
        const uniqueTags = getUniqueTags(allNewsWithContent);
        tagSelect.innerHTML = '<option value="">所有标签</option>';
        uniqueTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagSelect.appendChild(option);
        });
    }

    if (window.location.pathname.includes('news.html')) {
        await loadNews();
    }
    initHamburgerMenu();
});