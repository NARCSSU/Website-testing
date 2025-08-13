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
            'https://youke1.picui.cn/s1/2025/08/13/689c8de665aad.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8de4d67f1.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8de6ac726.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8e1a34df1.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8dedeadef.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8de797357.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8df1b7544.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8e195cbbc.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8df1f0aa8.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8df317016.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8dfce0a09.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8dff5d886.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8df4cc5a0.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8dff35895.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8dfa0c6c3.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8e13930a0.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8e09569e9.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8e0ee6004.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8e0be654d.png',
            'https://youke1.picui.cn/s1/2025/08/13/689c8e16acc5a.png',
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

    // 页面加载完成后初始化
    window.addEventListener('load', () => {
        // 保留你原有的其他初始化函数
        initBackgroundSlider(); // 初始化背景切换
    });

      
    
});