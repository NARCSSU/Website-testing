/**
 * 增强服务器API模块
 * 自动测试并选择最快的API获取服务器状态信息，支持备用API解决CORS问题
 */

class ServerAPI {
    constructor() {
        this.apis = {
            'mcsrvstat': {
                url: 'https://api.mcsrvstat.us/3/craft.luminolsuki.moe',
                name: 'MCSrvStat',
                timeout: 10000,
                corsProxy: 'https://api.allorigins.win/raw?url=' // CORS代理备用方案
            },
            'mcapius': {
                url: 'https://mcapi.us/server/status?ip=craft.luminolsuki.moe',
                name: 'MCapi.us',
                timeout: 10000
            }
        };
        this.bestAPI = null;
        this.statusCache = null;
        this.cacheTimeout = 30000; // 30秒缓存
        this.lastFetchTime = 0;
        this.fetchAttempts = 0;
        this.maxAttempts = 3; // 最大重试次数
        this.init();
    }

    init() {
        this.determineBestAPI().then(() => {
            this.fetchServerStatus();
            // 每30秒更新一次状态
            setInterval(() => {
                this.fetchServerStatus();
            }, 30000);
        });
        
        // 初始化服务器状态显示
        this.initStatusDisplay();
    }

    // 初始化状态显示
    initStatusDisplay() {
        // 监听服务器状态更新事件
        document.addEventListener('serverStatusUpdated', (event) => {
            this.updateStatusDisplay(event.detail);
        });
    }

    // 更新状态显示
    updateStatusDisplay(status) {
        // 更新在线玩家数量
        const onlinePlayersEl = document.getElementById('online-players');
        if (onlinePlayersEl) {
            onlinePlayersEl.textContent = status.players ? `${status.players.online || 0}/${status.players.max || 0}` : 'N/A';
        }

        // 更新服务器版本
        const serverVersionEl = document.getElementById('server-version');
        if (serverVersionEl) {
            serverVersionEl.textContent = status.version || '未知';
        }

        // 更新服务器状态
        const serverStatusEl = document.getElementById('server-status');
        const serverStatusDot = document.getElementById('server-status-dot');
        const serverStatusText = document.getElementById('server-status-text');
        
        
        if (serverStatusEl) {
            serverStatusEl.textContent = status.online ? '服务器在线' : '服务器离线';
        }
        
        if (serverStatusDot) {
            serverStatusDot.className = `status-dot ${status.online ? 'online' : 'offline'}`;
        }
        
        if (serverStatusText) {
            serverStatusText.textContent = status.online ? '在线' : '离线';
        }
    }

    // 测试哪个API更快
    async determineBestAPI() {
        debugLog('正在测试API速度...');
        const results = [];

        for (const [key, api] of Object.entries(this.apis)) {
            try {
                const startTime = Date.now();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), api.timeout);

                // 尝试直接请求
                let response;
                try {
                    response = await fetch(api.url, {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'LuminolCraft-Website/1.0'
                        }
                    });
                } catch (corsError) {
                    // 如果直接请求失败，尝试使用CORS代理
                    if (api.corsProxy) {
                        debugLog(`${api.name} 直接请求失败，尝试使用CORS代理`);
                        try {
                            response = await fetch(`${api.corsProxy}${encodeURIComponent(api.url)}`, {
                                signal: controller.signal,
                                headers: {
                                    'Accept': 'application/json',
                                    'User-Agent': 'LuminolCraft-Website/1.0'
                                }
                            });
                        } catch (proxyError) {
                            throw new Error(`CORS代理也失败: ${proxyError.message}`);
                        }
                    } else {
                        throw corsError;
                    }
                }

                clearTimeout(timeoutId);

                if (response.ok) {
                    await response.json();
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    results.push({
                        key,
                        responseTime,
                        success: true
                    });
                    debugLog(`${api.name} 响应时间: ${responseTime}ms`);
                } else {
                    results.push({
                        key,
                        responseTime: Infinity,
                        success: false
                    });
                    debugLog(`${api.name} 请求失败: ${response.status}`);
                }
            } catch (error) {
                results.push({
                    key,
                    responseTime: Infinity,
                    success: false
                });
                debugLog(`${api.name} 请求错误: ${error.message}`);
            }
        }

        // 按响应时间排序，选择最快的
        results.sort((a, b) => a.responseTime - b.responseTime);
        const best = results.find(result => result.success);
        
        if (best) {
            this.bestAPI = best.key;
            debugLog(`选择最快的API: ${this.apis[this.bestAPI].name} (${best.responseTime}ms)`);
        } else {
            // 如果都失败了，优先使用MCapi.us（因为没有CORS问题）
            this.bestAPI = 'mcapius';
            debugLog(`所有API测试失败，默认使用: ${this.apis[this.bestAPI].name}`);
        }
    }

    // 根据API类型格式化响应数据
    formatResponseData(data, apiType) {
        switch(apiType) {
            case 'mcsrvstat':
                return {
                    online: data.online || false,
                    players: {
                        online: data.players?.online || 0,
                        max: data.players?.max || 0
                    },
                    version: data.version || '未知',
                    motd: data.motd?.clean?.join(' ') || data.description || '无描述',
                    protocol: data.protocol || '未知'
                };
            case 'mcapius':
                return {
                    online: data.online || false,
                    players: {
                        online: data.players?.now || 0,
                        max: data.players?.max || 0
                    },
                    version: data.server?.name || '未知',
                    motd: data.motd || '无描述',
                    protocol: data.server?.protocol || '未知'
                };
            default:
                return {
                    online: false,
                    players: { online: 0, max: 0 },
                    version: '未知',
                    motd: '无描述',
                    protocol: '未知'
                };
        }
    }

    async fetchServerStatus() {
        const now = Date.now();
        if (this.statusCache && (now - this.lastFetchTime) < this.cacheTimeout) {
            return this.statusCache;
        }

        // 如果还没有确定最佳API，先确定
        if (!this.bestAPI) {
            await this.determineBestAPI();
        }

        const api = this.apis[this.bestAPI];
        let data = null;
        let attempt = 0;

        while (attempt < this.maxAttempts) {
            try {
                let response;
                
                try {
                    response = await fetch(api.url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'LuminolCraft-Website/1.0'
                        }
                    });
                } catch (corsError) {
                    // 如果CORS错误，尝试使用CORS代理
                    if (api.corsProxy) {
                        debugLog(`使用CORS代理请求: ${api.name}`);
                        response = await fetch(`${api.corsProxy}${encodeURIComponent(api.url)}`, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'User-Agent': 'LuminolCraft-Website/1.0'
                            }
                        });
                    } else {
                        throw corsError;
                    }
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const rawData = await response.json();
                data = this.formatResponseData(rawData, this.bestAPI);
                this.statusCache = data;
                this.lastFetchTime = now;

                // 触发自定义事件，通知其他模块服务器状态已更新
                const event = new CustomEvent('serverStatusUpdated', {
                    detail: data
                });
                document.dispatchEvent(event);

                return data;
            } catch (error) {
                debugLog(`获取服务器状态失败 (尝试 ${attempt + 1}/${this.maxAttempts}): ${error.message}`);
                
                // 如果当前API失败次数过多，重新测试API
                if (attempt === this.maxAttempts - 1) {
                    debugLog(`API ${api.name} 持续失败，将重新测试API速度`);
                    // 清除缓存并重新测试
                    this.bestAPI = null;
                    await this.determineBestAPI();
                }
                
                attempt++;
                
                // 重试前等待一下
                if (attempt < this.maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 递增延迟
                }
            }
        }

        // 所有重试都失败，返回缓存的数据（如果有的话）
        if (this.statusCache) {
            debugLog('所有API请求都失败，使用缓存数据');
            return this.statusCache;
        }

        // 如果没有缓存数据，返回默认值
        debugLog('所有API请求都失败，且没有缓存数据，返回默认值');
        return {
            online: false,
            players: { online: 0, max: 0 },
            version: '未知',
            motd: '无描述',
            protocol: '未知'
        };
    }

    // 获取在线玩家数量
    async getOnlinePlayers() {
        const status = await this.fetchServerStatus();
        if (status && status.players) {
            return status.players.online || 0;
        }
        return 0;
    }

    // 获取服务器版本
    async getServerVersion() {
        const status = await this.fetchServerStatus();
        if (status && status.version) {
            return status.version;
        }
        return '未知';
    }

    // 获取服务器状态（在线/离线）
    async isServerOnline() {
        const status = await this.fetchServerStatus();
        if (status) {
            return status.online === true;
        }
        return false;
    }

    // 获取最大玩家数量
    async getMaxPlayers() {
        const status = await this.fetchServerStatus();
        if (status && status.players) {
            return status.players.max || 0;
        }
        return 0;
    }

    // 获取服务器MOTD
    async getMOTD() {
        const status = await this.fetchServerStatus();
        if (status) {
            return status.motd || '无描述';
        }
        return '无描述';
    }
}

// 初始化服务器API
let serverAPI;

function initServerAPI() {
    if (!serverAPI) {
        serverAPI = new ServerAPI();
        window.serverAPI = serverAPI; // 全局访问
    }
    return serverAPI;
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServerAPI);
} else {
    initServerAPI();
}

// 导出类（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServerAPI;
}

// 全局函数
window.ServerAPI = ServerAPI;
window.initServerAPI = initServerAPI;



