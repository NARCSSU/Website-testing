/**
 * Spark插件API集成示例
 * Spark插件提供HTTP API来获取服务器性能数据
 */

class SparkAPI {
    constructor() {
        this.sparkUrl = 'http://your-server-ip:8080'; // Spark Web界面地址
        this.apiKey = 'your-spark-api-key'; // 可选：API密钥
    }

    // 获取TPS数据
    async getTPS() {
        try {
            const response = await fetch(`${this.sparkUrl}/spark/tps`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}` // 如果使用API密钥
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return {
                tps: data.tps,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('获取TPS数据失败:', error);
            throw error;
        }
    }

    // 获取性能数据
    async getPerformance() {
        try {
            const response = await fetch(`${this.sparkUrl}/spark/performance`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            const data = await response.json();
            return {
                cpu: data.cpu,
                memory: data.memory,
                memoryUsed: data.memoryUsed,
                memoryTotal: data.memoryTotal,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('获取性能数据失败:', error);
            throw error;
        }
    }

    // 获取服务器状态
    async getStatus() {
        try {
            const response = await fetch(`${this.sparkUrl}/spark/status`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            const data = await response.json();
            return {
                online: data.online,
                players: data.players,
                version: data.version,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('获取服务器状态失败:', error);
            throw error;
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SparkAPI;
}

