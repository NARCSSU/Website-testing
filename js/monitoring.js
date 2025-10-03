/**
 * 监控页面专用 JS 模块
 * 负责实时查询 Minecraft 服务器节点状态（在线/离线 + 延迟）
 * 使用 https://api.mcstatus.io API（免费，支持 Java 和 Bedrock 版）
 */

class ServerStatusManager {
    constructor() {
        this.refreshInterval = 30000; // 30 秒刷新一次
        this.apiBase = 'https://api.mcstatus.io/v2/status';
        this.init();
    }

    init() {
        // 等待 DOM 加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.startMonitoring();
            });
        } else {
            // DOM 已加载，直接启动
            this.startMonitoring();
        }
    }

    // 开始监控：初始查询 + 定时刷新
    startMonitoring() {
        console.log('ServerStatusManager: 开始监控节点状态');
        this.updateServerStatus();
        // 设置定时刷新
        setInterval(() => {
            this.updateServerStatus();
        }, this.refreshInterval);
    }

    // 更新所有服务器节点状态
    async updateServerStatus() {
        const cards = document.querySelectorAll('.status-card');
        if (cards.length === 0) {
            console.warn('未找到状态卡片元素');
            return;
        }

        console.log(`ServerStatusManager: 更新 ${cards.length} 个节点状态`);
        for (const card of cards) {
            const address = card.dataset.address;
            const type = card.dataset.type;
            if (!address || !type) {
                console.warn('卡片缺少 data-address 或 data-type 属性');
                continue;
            }

            const apiUrl = `${this.apiBase}/${type}/${address}`;
            await this.queryNodeStatus(card, apiUrl, address);
        }
    }

    // 查询单个节点状态
    async queryNodeStatus(card, apiUrl, address) {
        try {
            console.log(`查询节点: ${address}`);
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'LuminolMC-Monitor/1.0' // 自定义 User-Agent，避免被限速
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`节点 ${address} 数据:`, { online: data.online, latency: data.latency });

            // 更新 UI
            const indicator = card.querySelector('.status-indicator');
            const latencyEl = card.querySelector('.latency');
            if (!indicator || !latencyEl) {
                console.warn(`节点 ${address} 缺少 UI 元素`);
                return;
            }

            // 状态指示器
            indicator.textContent = data.online ? '在线' : '离线';
            indicator.className = `status-indicator ${data.online ? 'online' : 'offline'}`;

            // 延迟显示（延迟可能为 null 或 undefined 时显示 N/A）
            const latency = data.latency ? Math.round(data.latency) : 'N/A';
            latencyEl.textContent = `延迟: ${latency} ms`;

        } catch (error) {
            console.error(`节点 ${address} 查询失败:`, error);
            const indicator = card.querySelector('.status-indicator');
            const latencyEl = card.querySelector('.latency');
            if (indicator) {
                indicator.textContent = '错误';
                indicator.className = 'status-indicator error';
            }
            if (latencyEl) {
                latencyEl.textContent = '延迟: 不可用';
            }
        }
    }
}

// 初始化监控管理器
new ServerStatusManager();