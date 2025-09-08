document.addEventListener('DOMContentLoaded', function() {
    // 初始化汉堡菜单功能
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
    
    initHamburgerMenu();

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
                    
                    document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                        if (otherMenu !== menu) {
                            otherMenu.style.display = 'none';
                        }
                    });
                    
                    if (menu.style.display === 'block') {
                        menu.style.opacity = '0';
                        menu.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            menu.style.display = 'none';
                        }, 300);
                    } else {
                        menu.style.display = 'block';
                        setTimeout(() => {
                            menu.style.opacity = '1';
                            menu.style.transform = 'translateY(0)';
                        }, 10);
                    }
                }
            });
        });
        
        window.addEventListener('resize', function() {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = '';
                menu.style.opacity = '';
                menu.style.transform = '';
            });
        });
    }

    initDropdowns();

    // 渲染新闻详情和画廊
    const newsDetail = document.querySelector('#news-detail');
    const galleryGrid = document.querySelector('#gallery-grid');
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    const cachedNews = JSON.parse(localStorage.getItem('news-cache') || '[]');
    const newsItem = cachedNews.find(item => item.id == newsId);

    if (newsItem) {
        newsDetail.innerHTML = `
            ${newsItem.pinned ? '<span class="pinned-icon">📌</span>' : ''}
            <h2>${newsItem.title}</h2>
            <span class="news-date">${newsItem.date}</span>
            <div class="news-tags">
                ${newsItem.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
            </div>
            <div class="news-img" style="background-image: url('${newsItem.image}');"></div>
            <p>${newsItem.content}</p>
        `;

        // 渲染画廊图片
        if (newsItem.additionalImages && newsItem.additionalImages.length > 0) {
            newsItem.additionalImages.forEach((image, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `<img src="${image}" alt="画廊图片 ${index + 1}" data-index="${index}">`;
                galleryGrid.appendChild(galleryItem);
            });
        } else {
            galleryGrid.innerHTML = '<p class="empty-message">暂无更多图片</p>';
        }
    } else {
        newsDetail.innerHTML = '<p class="error-message">新闻未找到</p>';
        galleryGrid.innerHTML = '<p class="empty-message">暂无更多图片</p>';
    }

    // 灯箱功能
    const lightbox = document.querySelector('#lightbox');
    const lightboxImage = document.querySelector('#lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    let currentImageIndex = 0;

    galleryGrid.addEventListener('click', (e) => {
        const img = e.target.closest('img');
        if (img) {
            currentImageIndex = parseInt(img.dataset.index);
            lightboxImage.src = newsItem.additionalImages[currentImageIndex];
            lightbox.style.display = 'flex';
            updateLightboxNavigation();
        }
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    lightboxPrev.addEventListener('click', () => {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            lightboxImage.src = newsItem.additionalImages[currentImageIndex];
            updateLightboxNavigation();
        }
    });

    lightboxNext.addEventListener('click', () => {
        if (currentImageIndex < newsItem.additionalImages.length - 1) {
            currentImageIndex++;
            lightboxImage.src = newsItem.additionalImages[currentImageIndex];
            updateLightboxNavigation();
        }
    });

    // 更新灯箱导航按钮显示
    function updateLightboxNavigation() {
        lightboxPrev.style.display = currentImageIndex > 0 ? 'block' : 'none';
        lightboxNext.style.display = currentImageIndex < newsItem.additionalImages.length - 1 ? 'block' : 'none';
    }

    // 点击灯箱外部关闭
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
});