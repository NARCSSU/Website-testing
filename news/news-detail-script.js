// 全局变量
let allNewsWithContent = [];
const GITHUB_RAW_BASE = 'https://luminolcraft-news.pages.dev/';
const GITEJSON_URL = 'https://luminolcraft-news.pages.dev/news.json';
const SITE_DOMAIN = window.location.hostname || '';
let currentPage = 0;
const itemsPerPage = 6;
let filteredNews = null;
const CACHE_DURATION = 24*60 * 60 * 1000;

function isValidUrl(url) {
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch (e) {
        return false;
    }
}

// 限制日志重复
let errorLogged = new Set();

// 简单的 markdown 渲染器（fallback）
function simpleMarkdownRender(text) {
    if (!text) return '';
    
    // 基础转换
    let html = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
            const isExternal = !href.startsWith('/') && !href.includes(SITE_DOMAIN) && !href.startsWith('#');
            const svgIcon = isExternal ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4 ml-1 align-sub" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path></svg>' : '';
            return `<a href="${href}" class="${isExternal ? 'external-link' : ''}">${text}${svgIcon}</a>`;
        });
        
    return '<p>' + html + '</p>';
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

/// 预加载 Markdown 和图片
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
            const fullContentUrl = convertGitHubUrlToCloudflare(item.content);
            console.log(`加载 Markdown: ${fullContentUrl}`);
            const response = await fetch(fullContentUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`无法加载: ${fullContentUrl} (状态: ${response.status})`);
            const markdownContent = await response.text();
            item.markdownContent = markdownContent;

            

            // 检查附加图片
            item.additionalImages = item.additionalImages.filter(url => {
                if (!url || url.trim() === '' || !isValidUrl(url)) {
                    console.warn(`新闻ID ${item.id} 的附加图片无效: ${url}，已过滤`);
                    return false;
                }
                return true;
            });
        } catch (error) {
            console.error(`预加载新闻ID ${item.id} 失败: ${error.message}, URL: ${fullContentUrl}`);
            item.markdownContent = '内容加载失败';
            item.image = 'https://via.placeholder.com/300x200/9e94d8/ffffff?text=Luminol+News';
        }
    }
    allNewsWithContent = newsData;
    localStorage.setItem('news-full-cache', JSON.stringify(allNewsWithContent));
    localStorage.setItem('news-full-cache-timestamp', now.toString());
    console.log('Markdown 预加载完成');
}

// 初始化 marked 库
function initializeMarked() {
    if (typeof document === 'undefined') {
        console.error('document 未定义，可能在非浏览器环境运行或 DOM 未加载');
        return false;
    }
    if (typeof marked === 'undefined') {
        console.error('marked 库未加载，请确保 <script src="https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js"> 在 news-detail-script.js 之前');
        return false;
    }
    console.log('marked 库加载成功，版本:', marked.version || '未知');
    const renderer = new marked.Renderer();
    renderer.link = (href, title, text) => {
        console.log('渲染链接:', { href, hrefType: typeof href, title, text });
        const isValidHref = href !== null && href !== undefined && typeof href === 'string' && href.trim() !== '';
        const isExternal = isValidHref && !href.startsWith('/') && !href.includes(SITE_DOMAIN) && !href.startsWith('#');
        const svgIcon = isExternal ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4 ml-1 align-sub" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path></svg>` : '';
        if (!isValidHref) {
            console.warn(`无效的 href: ${JSON.stringify(href)}，返回纯文本: ${text}`);
            return `<span class="invalid-link">${text}</span>`;
        }
        return `<a href="${href}" ${title ? `title="${title}"` : ''} class="${isExternal ? 'external-link' : ''}">${text}${svgIcon}</a>`;
    };
    marked.setOptions({ 
        renderer
    });
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


// 初始化应用
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
        await preloadMarkdownContent(data);
        console.log('allNewsWithContent:', allNewsWithContent);
    } catch (error) {
        console.error('初始化加载 news.json 失败:', error.message);
        document.querySelector('#news-detail').innerHTML = `
            <p class="error-message">
                无法加载新闻数据，请检查网络或稍后重试
                
            </p>`;//<button onclick="initializeApp(); renderNewsDetail();">重试</button>
    }
}

// 渲染新闻详情
async function renderNewsDetail() {


    
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    if (!id || !allNewsWithContent.length) {
        document.getElementById('news-detail').innerHTML = '<p class="error-message">新闻未找到</p>';
        document.title = '新闻未找到 - LuminolCraft'; // 错误情况下的标题
        return;
    }
    const newsItem = allNewsWithContent.find(item => item.id === id);
    if (!newsItem) {
        document.getElementById('news-detail').innerHTML = '<p class="error-message">新闻未找到</p>';
        document.title = '新闻未找到 - LuminolCraft'; // 错误情况下的标题
        return;
    }

    // 设置页面标题为新闻标题
    document.title = `${newsItem.title} - LuminolCraft`;

    const newsDetail = document.getElementById('news-detail');
    newsDetail.innerHTML = ''; // 清空加载中提示

    
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
    // 检查marked库是否可用，否则使用fallback
    if (typeof marked !== 'undefined') {
        contentDiv.innerHTML = marked.parse(newsItem.markdownContent || '');
    } else {
        contentDiv.innerHTML = simpleMarkdownRender(newsItem.markdownContent || '');
    }

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
            // 为附加图片添加 onerror 处理
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

    // 初始化代码高亮
    setTimeout(() => {
        if (typeof hljs !== 'undefined') {  
            hljs.highlightAll();
        }
    }, 100);
}

// 初始化汉堡菜单
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

// DOM 加载完成
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('DOM 加载完成，开始初始化');
        console.log('当前域名 (SITE_DOMAIN):', SITE_DOMAIN);
        
        tryInitializeMarked();
        await initializeApp();
        // 已移除 Three.js 背景
        if (window.location.pathname.includes('news-detail.html')) {
            await renderNewsDetail();
        }
        initHamburgerMenu();
        initDropdowns();
        console.log('初始化完成');
    });
} else {
    console.error('document 未定义，无法绑定 DOMContentLoaded 事件');
}