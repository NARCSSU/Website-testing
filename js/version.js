/**
 * 版本信息模块
 * 负责网站版本显示和运行时间计算
 */

class VersionManager {
    constructor() {
        this.init();
    }

    init() {
        // 页面加载完成后初始化
        window.addEventListener('load', () => {
            this.getWebsiteVersion();
            this.calculateUptime();
        });
    }

    // 获取网站版本信息
    getWebsiteVersion() {
        const versionElement = document.getElementById('website-version');
        if (!versionElement) return;

        // 检查是否在Netlify环境（排除本地开发环境）
        console.log('当前域名:', window.location.hostname);
        console.log('是否本地环境:', window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));
        
        if (typeof window !== 'undefined' && 
            !window.location.hostname.includes('localhost') && 
            !window.location.hostname.includes('127.0.0.1') &&
            !window.location.hostname.includes('file://')) {
            console.log('尝试从Netlify函数获取版本...');
            // 使用Netlify函数获取Git提交哈希
            fetch('/.netlify/functions/version')
                .then(response => response.json())
                .then(data => {
                    console.log('Netlify函数返回数据:', data);
                    if (data.version && data.version !== 'unknown') {
                        versionElement.textContent = data.version;
                        versionElement.title = `完整哈希: ${data.fullHash}\n分支: ${data.branch}\n部署时间: ${new Date(data.deployTime).toLocaleString()}`;
                        console.log('版本设置成功:', data.version);
                    } else {
                        versionElement.textContent = 'unknown';
                        console.log('版本为unknown');
                    }
                })
                .catch(error => {
                    console.error('获取版本失败:', error);
                    versionElement.textContent = 'unknown';
                });
        } else {
            // 本地开发环境
            versionElement.textContent = 'dev';
        }
    }

    // 计算网站运行天数
    calculateUptime() {
        // 设置网站开始运行的日期（中国时区 UTC+8）
        const startDate = new Date('2025-07-23T11:57:00+08:00'); // 中国时区
        const currentDate = new Date(); // 当前本地时间
        
        // 计算时间差（毫秒）
        const timeDiff = currentDate.getTime() - startDate.getTime();
        
        // 转换为天数
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        const uptimeElement = document.getElementById('website-uptime');
        if (uptimeElement) {
            uptimeElement.textContent = `${daysDiff} 天`;
        }
        
        // 调试信息
        console.log('开始时间:', startDate.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'}));
        console.log('当前时间:', currentDate.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'}));
        console.log('运行天数:', daysDiff);
    }

    // 更新运行时间（如果需要定期更新）
    startUptimeUpdate() {
        // 每分钟更新一次运行时间
        setInterval(() => {
            this.calculateUptime();
        }, 60000);
    }
}

// 导出类（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VersionManager;
}
