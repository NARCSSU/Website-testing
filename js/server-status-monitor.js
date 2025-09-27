/**
 * 服务器状态监控模块 - 真实数据版本
 * 负责实时监控服务器状态并在页面上显示
 */

class ServerStatusMonitor {
    constructor() {
        this.serverIp = 'craft.luminolsuki.moe'; // 服务器IP
        this.serverPort = 25565; // 服务器端口
        this.checkInterval = 30000; // 30秒检查一次
        this.statusInterval = null;
        this.isOnline = false;
        this.playerCount = 0;
        
        this.init();
    }

    init() {
        console.log('服务器状态监控初始化...');
        this.updateStatus();
        this.startMonitoring();
    }

    // 获取服务器状态
    async getServerStatus() {
        try {
            // 使用多个API源来提高可靠性
            const apis = [
                `https://api.mcsrvstat.us/2/${this.serverIp}:${this.serverPort}`,
                `https://api.minetools.eu/ping/${this.serverIp}/${this.serverPort}`,
                `https://api.minehut.com/server/${this.serverIp}`
            ];

            for (const api of apis) {
                try {
                    const response = await fetch(api, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json',
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const parsedData = this.parseServerData(data, api);
                        if (parsedData.online) {
                            return parsedData;
                        }
                    }
                } catch (error) {
                    console.warn(`API ${api} 失败:`, error);
                    continue;
                }
            }
            
            // 所有API都失败，返回离线状态
            return {
                online: false,
                players: 0,
                maxPlayers: 20,
                version: 'Unknown',
                motd: '',
                error: '所有API都失败了'
            };
        } catch (error) {
            console.error('获取服务器状态失败:', error);
            return {
                online: false,
                players: 0,
                maxPlayers: 20,
                version: 'Unknown',
                motd: '',
                error: error.message
            };
        }
    }

    // 解析不同API的数据格式
    parseServerData(data, apiUrl) {
        if (apiUrl.includes('mcsrvstat')) {
            return {
                online: data.online || false,
                players: data.players ? data.players.online : 0,
                maxPlayers: data.players ? data.players.max : 20,
                version: data.version || 'Unknown',
                motd: data.motd || ''
            };
        } else if (apiUrl.includes('minetools')) {
            return {
                online: data.players !== undefined,
                players: data.players ? data.players.online : 0,
                maxPlayers: data.players ? data.players.max : 20,
                version: data.version ? data.version.name : 'Unknown',
                motd: data.description || ''
            };
        } else if (apiUrl.includes('minehut')) {
            return {
                online: data.server !== null,
                players: data.server ? data.server.playerCount : 0,
                maxPlayers: data.server ? data.server.maxPlayers : 20,
                version: data.server ? data.server.version : 'Unknown',
                motd: data.server ? data.server.motd : ''
            };
        }
        
        return {
            online: false,
            players: 0,
            maxPlayers: 20,
            version: 'Unknown',
            motd: ''
        };
    }

    // 更新页面状态显示
    updateStatusDisplay(status) {
        // 更新状态指示器
        const statusElements = document.querySelectorAll('.status-text, .status-indicator .status-text');
        statusElements.forEach(element => {
            if (element.textContent.includes('服务器')) {
                element.textContent = status.online ? '服务器在线' : '服务器离线';
            }
        });

        // 更新状态点
        const statusDots = document.querySelectorAll('.status-dot');
        statusDots.forEach(dot => {
            dot.style.background = status.online ? '#22c55e' : '#ef4444';
            dot.style.animation = status.online ? 'pulse 2s infinite' : 'none';
        });

        // 更新在线玩家数
        const playerElements = document.querySelectorAll('#current-players');
        playerElements.forEach(element => {
            element.textContent = status.online ? status.players.toString() : '--';
        });

        // 更新服务器状态文本
        const serverStatusElements = document.querySelectorAll('#server-status');
        serverStatusElements.forEach(element => {
            element.textContent = status.online ? '在线' : '离线';
            element.className = status.online ? 'status-online' : 'status-offline';
        });

        // 更新在线状态类
        const onlineElements = document.querySelectorAll('.online');
        onlineElements.forEach(element => {
            element.textContent = status.online ? '在线' : '离线';
            element.className = status.online ? 'online' : 'offline';
        });
    }

    // 更新状态
    async updateStatus() {
        console.log('检查服务器状态...');
        const status = await this.getServerStatus();
        
        this.isOnline = status.online;
        this.playerCount = status.players;
        
        console.log('服务器状态:', status);
        this.updateStatusDisplay(status);
        
        return status;
    }

    // 开始监控
    startMonitoring() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }
        
        this.statusInterval = setInterval(() => {
            this.updateStatus();
        }, this.checkInterval);
        
        console.log(`服务器状态监控已启动，每${this.checkInterval/1000}秒检查一次`);
    }

    // 停止监控
    stopMonitoring() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
            console.log('服务器状态监控已停止');
        }
    }

    // 手动刷新状态
    async refreshStatus() {
        console.log('手动刷新服务器状态...');
        return await this.updateStatus();
    }

    // 销毁监控器
    destroy() {
        this.stopMonitoring();
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServerStatusMonitor;
}