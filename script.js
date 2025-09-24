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

    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 滚动显示动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        });
    });

    function initBackgroundSlider() {
        // 背景图片数组 - 替换为你的实际图片路径
        const backgroundImages = [
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
        
        const header = document.querySelector('header');
        // 初始索引设为随机值，实现每次刷新不同背景
        let currentIndex = Math.floor(Math.random() * backgroundImages.length);

        // 创建初始背景（使用随机选中的图片）
        let background = document.createElement('div');
        background.className = 'header-background fade-in';
        background.style.backgroundImage = `url(${backgroundImages[currentIndex]})`;
        header.appendChild(background);

        // 随机获取下一张图片索引（不重复当前）
        function getNextIndex() {
          if (backgroundImages.length <= 1) return 0;
        
          let nextIndex;
          do {
            nextIndex = Math.floor(Math.random() * backgroundImages.length);
          } while (nextIndex === currentIndex);

          return nextIndex;
        }

        // 切换背景图片
        function switchBackground() {
          const nextIndex = getNextIndex();
        
          // 创建新背景元素
          const newBackground = document.createElement('div');
          newBackground.className = 'header-background new-background';
          newBackground.style.backgroundImage = `url(${backgroundImages[nextIndex]})`;
          header.appendChild(newBackground);
        
          // 触发当前背景的淡出动画
          background.classList.remove('fade-in');
          background.classList.add('fade-out');
        
          // 稍微延迟后触发新背景的淡入动画
          setTimeout(() => {
            newBackground.classList.remove('new-background');
            newBackground.classList.add('fade-in');
          }, 200); // 小延迟让动画更有层次感

          // 动画完成后清理旧背景
          setTimeout(() => {
            background.remove();
            background = newBackground;
            currentIndex = nextIndex;
          }, 1200); // 与CSS过渡时间保持一致
        }
  
  
        // 每3.6秒切换一次背景
        setInterval(switchBackground, 3600);
    }

    // 获取网站版本信息
    function getWebsiteVersion() {
        const versionElement = document.getElementById('website-version');
        if (!versionElement) return;

        // 检查是否在Netlify环境
        if (typeof window !== 'undefined' && window.location.hostname.includes('netlify')) {
            // 使用Netlify函数获取Git提交哈希
            fetch('/.netlify/functions/version')
                .then(response => response.json())
                .then(data => {
                    if (data.version && data.version !== 'unknown') {
                        versionElement.textContent = data.version;
                        versionElement.title = `完整哈希: ${data.fullHash}\n分支: ${data.branch}\n部署时间: ${new Date(data.deployTime).toLocaleString()}`;
                    } else {
                        versionElement.textContent = 'unknown';
                    }
                })
                .catch(() => {
                    versionElement.textContent = 'unknown';
                });
        } else {
            // 本地开发环境
            versionElement.textContent = 'dev';
        }
    }

    // 计算网站运行天数
    function calculateUptime() {
        // 设置网站开始运行的日期（你可以修改这个日期）
        const startDate = new Date('2025-07-23T11:57:00Z'); // 修改为你的网站实际开始日期
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - startDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        const uptimeElement = document.getElementById('website-uptime');
        if (uptimeElement) {
            uptimeElement.textContent = `${daysDiff} 天`;
        }
    }

    // 页面加载完成后初始化
    window.addEventListener('load', () => {
        // 保留你原有的其他初始化函数
        initBackgroundSlider(); // 初始化背景切换
        
        // 初始化版本和运行时间功能
        getWebsiteVersion();
        calculateUptime();
        
        // 每分钟更新一次运行时间（可选）
        setInterval(calculateUptime, 60000);
    });

      
    
});