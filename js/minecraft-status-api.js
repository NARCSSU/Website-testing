/**
 * Minecraft服务器状态API集成 - 真实数据版本
 * 使用MCSrvStatus等第三方服务获取服务器状态
 */

class MinecraftStatusAPI {
    constructor() {
        this.serverIp = 'craft.luminolsuki.moe';
        this.serverPort = 25565; // 默认Minecraft端口
        this.statusServices = [
            'https://api.minetools.eu/ping/',
            'https://api.mcsrvstat.us/2/',
            'https://api.minehut.com/server/'
        ];
    }

    // 获取服务器状态
    async getServerStatus() {
        for (const service of this.statusServices) {
            try {
                let url;
                let data;
                
                // 根据不同服务构建不同的URL
                if (service.includes('minetools')) {
                    // Minetools API格式: /ping/ip/port
                    const port = this.serverPort || 25565;
                    url = `${service}${this.serverIp}/${port}`;
                } else if (service.includes('minehut')) {
                    // Minehut API格式: /server/ip
                    url = `${service}${this.serverIp}`;
                } else {
                    // MCSrvStatus API格式: /ip:port 或 /ip
                    url = this.serverPort ? 
                        `${service}${this.serverIp}:${this.serverPort}` : 
                        `${service}${this.serverIp}`;
                }
                
                console.log(`尝试从 ${service} 获取数据: ${url}`);
                const response = await fetch(url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (response.ok) {
                    data = await response.json();
                    
                    // 根据不同服务处理响应数据
                    let serverData = null;
                    
                    if (service.includes('minetools')) {
                        // Minetools返回格式
                        if (data.players) {
                            serverData = {
                                online: true,
                                players: {
                                    online: data.players.online || 0,
                                    max: data.players.max || 20
                                },
                                version: data.version?.name || 'Unknown',
                                motd: data.description,
                                latency: data.latency,
                                timestamp: Date.now()
                            };
                        }
                    } else if (service.includes('minehut')) {
                        // Minehut返回格式
                        if (data.server) {
                            serverData = {
                                online: data.server.online,
                                players: {
                                    online: data.server.playerCount || 0,
                                    max: data.server.maxPlayers || 20
                                },
                                version: data.server.version || 'Unknown',
                                timestamp: Date.now()
                            };
                        }
                    } else {
                        // MCSrvStatus返回格式
                        if (data.online) {
                            serverData = {
                                online: data.online,
                                players: {
                                    online: data.players?.online || 0,
                                    max: data.players?.max || 20
                                },
                                version: data.version || 'Unknown',
                                motd: data.motd,
                                timestamp: Date.now()
                            };
                        }
                    }
                    
                    if (serverData) {
                        console.log(`成功从 ${service} 获取数据:`, serverData);
                        return serverData;
                    }
                }
                
            } catch (error) {
                console.warn(`服务 ${service} 请求失败:`, error);
                continue;
            }
        }
        
        // 所有服务都失败，返回离线状态
        console.warn('所有状态服务都无法访问');
        return {
            online: false,
            players: {
                online: 0,
                max: 20
            },
            version: 'Unknown',
            motd: '',
            latency: 0,
            timestamp: Date.now(),
            error: '所有状态服务都无法访问'
        };
    }

    // 获取玩家列表
    async getPlayerList() {
        try {
            const url = this.serverPort ? 
                `https://api.mcsrvstat.us/2/${this.serverIp}:${this.serverPort}` : 
                `https://api.mcsrvstat.us/2/${this.serverIp}`;
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.players?.list || [];
            }
            
            return [];
        } catch (error) {
            console.error('获取玩家列表失败:', error);
            return [];
        }
    }

    // 检查服务器是否在线
    async isServerOnline() {
        try {
            const status = await this.getServerStatus();
            return status.online;
        } catch (error) {
            console.error('检查服务器在线状态失败:', error);
            return false;
        }
    }

    // 获取服务器延迟
    async getServerLatency() {
        try {
            const status = await this.getServerStatus();
            return status.latency || 0;
        } catch (error) {
            console.error('获取服务器延迟失败:', error);
            return 0;
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MinecraftStatusAPI;
}