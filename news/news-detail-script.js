const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/news.json';
const GITEJSON_URL = 'https://raw.githubusercontent.com/LuminolCraft/news.json/main/news.json';
const SITE_DOMAIN = window.location.hostname || '';



const backLink = document.querySelector('.back-to-news');
if (backLink) {
    backLink.href = '/news.html';  // 强制根路径
}

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
        // 调试：记录详细的链接信息
        console.log('渲染链接:', { href, hrefType: typeof href, title, text });
        // 全面检查 href
        const isValidHref = href !== null && href !== undefined && typeof href === 'string' && href.trim() !== '';
        const isExternal = isValidHref && !href.startsWith('/') && !href.includes(SITE_DOMAIN) && !href.startsWith('#');
        const svgIcon = isExternal ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4 ml-1 align-sub" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path></svg>` : '';
        // 若 href 无效，返回纯文本并记录警告
        if (!isValidHref) {
            console.warn(`无效的 href: ${JSON.stringify(href)}，返回纯文本: ${text}`);
            return `<span class="invalid-link">${text}</span>`;
        }
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

let currentPage = 0;
const itemsPerPage = 6;
let filteredNews = null;
const CACHE_DURATION = 60 * 60 * 1000;

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('JS Loaded');
        console.log('当前域名 (SITE_DOMAIN):', SITE_DOMAIN);

        tryInitializeMarked();

        const container = document.getElementById('three-canvas-container');
        if (container) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            camera.position.z = 5;

            const colors = [];
            const particleMaterial = new THREE.PointsMaterial({
                size: 0.1,
                transparent: true,
                opacity: 0.8,
                vertexColors: true,
                blending: THREE.AdditiveBlending
            });

            const particlesGeometry = new THREE.BufferGeometry();
            const particlesCount = 100;
            const positions = new Float32Array(particlesCount * 3);
            const velocities = new Float32Array(particlesCount * 3).fill(0);

            for (let i = 0; i < particlesCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 10;
                positions[i + 1] = (Math.random() - 0.5) * 10;
                positions[i + 2] = (Math.random() - 0.5) * 10;
                velocities[i] = (Math.random() - 0.5) * 0.02;
                velocities[i + 1] = (Math.random() - 0.5) * 0.02;
                velocities[i + 2] = (Math.random() - 0.5) * 0.02;

                const r = Math.random() < 0.8 ? Math.random() * 0.2 + 0.6 : Math.random() * 0.4;
                const g = Math.random() < 0.8 ? Math.random() * 0.2 : Math.random() * 0.87;
                const b = Math.random() < 0.8 ? Math.random() * 0.2 + 0.6 : Math.random() * 0.92;
                colors.push(r, g, b);
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particlesGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
            const particles = new THREE.Points(particlesGeometry, particleMaterial);
            scene.add(particles);

            function animate() {
                requestAnimationFrame(animate);

                for (let i = 0; i < particlesCount * 3; i += 3) {
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];

                    if (positions[i] > 5 || positions[i] < -5) velocities[i] *= -1;
                    if (positions[i + 1] > 5 || positions[i + 1] < -5) velocities[i + 1] *= -1;
                    if (positions[i + 2] > 5 || positions[i + 2] < -5) velocities[i + 2] *= -1;
                }

                particlesGeometry.attributes.position.needsUpdate = true;
                particles.rotation.y += 0.002;
                renderer.render(scene, camera);
            }

            const updateInteraction = (e) => {
                if (!e) return;
                const rect = container.getBoundingClientRect();
                const x = ((e.clientX || e.touches[0]?.clientX) - rect.left) / rect.width * 2 - 1;
                const y = -((e.clientY || e.touches[0]?.clientY) - rect.top) / rect.height * 2 + 1;
                camera.position.x = x * 2;
                camera.position.y = y * 2;
                particleMaterial.size = 0.15;
                setTimeout(() => { particleMaterial.size = 0.1; }, 100);
            };
            document.addEventListener('mousemove', updateInteraction);
            document.addEventListener('touchmove', (e) => {
                e.preventDefault();
                updateInteraction(e);
            }, { passive: false });

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            animate();
        }

        function createDOMElement(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
            if (content) element.innerHTML = content;
            return element;
        }

        function encodeHTML(str) {
            return str.replace(/[&<>"']/g, match => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match]));
        }

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

        async function renderGallery(item) {
            const galleryGrid = document.querySelector('.gallery-grid');
            if (!galleryGrid) return;

            galleryGrid.innerHTML = '';
            const images = item.additionalImages || [];
            if (images.length === 0) {
                galleryGrid.parentElement.style.display = 'none';
                return;
            }

            images.forEach((imgSrc, index) => {
                const galleryItem = createDOMElement('div', { class: 'gallery-item' });
                const img = createDOMElement('img', {
                    src: imgSrc,
                    alt: `Gallery image ${index + 1}`,
                    'data-index': index
                });
                galleryItem.appendChild(img);
                galleryGrid.appendChild(galleryItem);
            });

            const lightbox = document.querySelector('.lightbox');
            const lightboxImage = document.querySelector('.lightbox-image');
            const lightboxClose = document.querySelector('.lightbox-close');
            const lightboxPrev = document.querySelector('.lightbox-prev');
            const lightboxNext = document.querySelector('.lightbox-next');
            let currentImageIndex = 0;

            galleryGrid.querySelectorAll('.gallery-item img').forEach(img => {
                img.addEventListener('click', () => {
                    currentImageIndex = parseInt(img.dataset.index);
                    lightboxImage.src = images[currentImageIndex];
                    lightbox.style.display = 'flex';
                });
            });

            lightboxClose.addEventListener('click', () => {
                lightbox.style.display = 'none';
            });

            lightboxPrev.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                lightboxImage.src = images[currentImageIndex];
            });

            lightboxNext.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % images.length;
                lightboxImage.src = images[currentImageIndex];
            });
        }

        async function renderNewsDetail() {
            const newsDetail = document.getElementById('news-detail');
            if (!newsDetail) {
                console.error('news-detail 未找到');
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const newsId = urlParams.get('id');
            if (!newsId) {
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
                    ${item.pinned ? '<span class="pinned-icon">📌</span>' : ''}
                    <h2>${encodeHTML(item.title)}</h2>
                    <div class="news-date">${item.date}</div>
                    <img class="news-img" src="${item.image}" alt="${encodeHTML(item.title)}" onerror="this.src='./images/fallback-image.jpg'; this.alt='主图片加载失败';">
                    <div class="news-tags">
                        ${item.tags?.map(tag => `<span class="tag">${encodeHTML(tag)}</span>`).join('') || ''}
                    </div>
                    <div class="news-content">${typeof marked !== 'undefined' ? marked.parse(markdownContent) : markdownContent}</div>
                `;

                await renderGallery(item);

                if (typeof marked !== 'undefined') {
                    marked.setOptions({
                        highlight: function(code, lang) {
                            if (typeof hljs !== 'undefined') {
                                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                                return hljs.highlight(code, { language }).value;
                            }
                            return code;
                        }
                    });
                }

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

        async function initializeApp() {
            console.log('检查 DOM 元素:', {
                newsGrid: !!document.querySelector('#news-grid'),
                paginationContainer: !!document.querySelector('#news-pagination'),
                newsDetail: !!document.querySelector('#news-detail'),
                galleryGrid: !!document.querySelector('.gallery-grid'),
                lightbox: !!document.querySelector('.lightbox')
            });

            const cached = localStorage.getItem('news-cache');
            if (!cached) {
                try {
                    const response = await fetch(GITEJSON_URL, { cache: 'no-store' });
                    if (!response.ok) {
                        throw new Error(`无法加载 news.json: ${response.status} - ${response.statusText}`);
                    }
                    const data = await response.json();
                    localStorage.setItem('news-cache', JSON.stringify(data));
                    localStorage.setItem('news-cache-timestamp', new Date().getTime().toString());
                } catch (error) {
                    console.error('初始化加载 news.json 失败:', error.message);
                }
            }
        }

        await initializeApp();
        if (window.location.pathname.includes('news-detail.html')) {
            await renderNewsDetail();
        }
        initHamburgerMenu();
        initDropdowns();
    });
} else {
    console.error('document 未定义，无法绑定 DOMContentLoaded 事件');
}