document.addEventListener('DOMContentLoaded', () => {
    // 节流函数，避免频繁点击
    function throttle(func, wait) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= wait) {
                lastCall = now;
                return func.apply(this, args);
            }
            // 非侵入式提示
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                background: #333; color: white; padding: 10px 20px; border-radius: 5px;
                z-index: 1000; opacity: 0; transition: opacity 0.3s;
            `;
            toast.textContent = '操作过于频繁，请稍后重试';
            document.body.appendChild(toast);
            setTimeout(() => toast.style.opacity = '1', 10);
            setTimeout(() => toast.remove(), 2000);
        };
    }

    // 为按钮添加节流
    document.querySelectorAll('.method-item a').forEach(button => {
        const originalClick = button.onclick || (() => {});
        button.onclick = throttle(e => {
            console.debug('Button clicked:', button.href); // 调试日志
            originalClick.call(button, e); // 执行原始点击事件
        }, 1000); // 1秒节流
    });
});