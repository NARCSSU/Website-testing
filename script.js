// script.js

document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 移动菜单切换
    function toggleMenu() {
        const nav = document.querySelector('nav');
        nav.classList.toggle('responsive');
    }

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
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // 关闭移动菜单（如果打开）
                const nav = document.querySelector('nav');
                if (nav.classList.contains('responsive')) {
                    nav.classList.remove('responsive');
                }
                
                // 滚动到目标位置
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 随机背景图片
    const header = document.getElementById('header');
    const backgroundImages = [
    '/images/3cda066bccaefea3eb268d4ca10f018a.png',
    '/images/Image_585028843869744.png',
    '/images/Image_585018650004905.png',
    '/images/Image_585012522922876.png',
    '/images/Image_585006053756264.png',
    '/images/Image_585000138805953.png',
    '/images/Image_584991582604759.png',
    '/images/Image_669234245588716.png',
    '/images/Image_669226165759604.png',
    '/images/Image_669218057352159.png',
    '/images/Image_669214276923463.png',
    '/images/Image_669203224465863.png',
    '/images/Image_669202127295447.png',
    '/images/Image_669192564244096.png',
    '/images/Image_669027140045097.png',
    '/images/Image_585061010780930.png',
    '/images/Image_585054865315151.png',
    '/images/Image_585036168830575.png',
    '/images/Image_585018650004905.png',
    '/images/Image_585006053756264.png',
    '/images/9ae17d2b-8fb3-4f05-8a75-48c40de55bd0.png',
    '/images/Image_669276986426772.png',
    ];
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const randomImage = backgroundImages[randomIndex];
    header.style.backgroundImage = `url(${randomImage})`;

    // 定时更换背景图片
    setInterval(() => {
        const newRandomIndex = Math.floor(Math.random() * backgroundImages.length);
        const newRandomImage = backgroundImages[newRandomIndex];
        header.style.backgroundImage = `url(${newRandomImage})`;
    }, 5000); // 每5秒更换一次图片
});