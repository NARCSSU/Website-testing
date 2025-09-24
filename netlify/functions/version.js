exports.handler = async (event, context) => {
    // 设置CORS头部
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 处理预检请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Netlify自动提供的环境变量
        const commitHash = process.env.COMMIT_REF; // Netlify提供的Git提交哈希
        const branch = process.env.BRANCH; // 当前分支
        const deployTime = process.env.DEPLOY_TIME || new Date().toISOString();
        
        // 获取提交哈希的前7位
        const shortHash = commitHash ? commitHash.substring(0, 7) : null;

        console.log('Netlify环境变量:', {
            COMMIT_REF: process.env.COMMIT_REF,
            BRANCH: process.env.BRANCH,
            DEPLOY_TIME: process.env.DEPLOY_TIME
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                version: shortHash || 'unknown',
                fullHash: commitHash || 'unknown',
                branch: branch || 'main',
                deployTime: deployTime,
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Error getting version:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to get version information',
                version: 'unknown'
            })
        };
    }
};
