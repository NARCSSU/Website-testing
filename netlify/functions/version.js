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
        // Netlify自动提供的环境变量 - 尝试多个可能的变量名
        const commitHash = process.env.COMMIT_REF || 
                          process.env.GIT_COMMIT_REF || 
                          process.env.NETLIFY_VERSION ||
                          process.env.DEPLOY_ID;
        const branch = process.env.BRANCH || 'main';
        const deployTime = process.env.DEPLOY_TIME || new Date().toISOString();
        
        // 获取提交哈希的前7位
        const shortHash = commitHash ? commitHash.substring(0, 7) : null;

        console.log('Netlify环境变量:', {
            COMMIT_REF: process.env.COMMIT_REF,
            GIT_COMMIT_REF: process.env.GIT_COMMIT_REF,
            NETLIFY_VERSION: process.env.NETLIFY_VERSION,
            DEPLOY_ID: process.env.DEPLOY_ID,
            BRANCH: process.env.BRANCH,
            DEPLOY_TIME: process.env.DEPLOY_TIME,
            '所有环境变量': Object.keys(process.env).filter(key => key.includes('COMMIT') || key.includes('GIT') || key.includes('DEPLOY'))
        });

        // 如果无法从环境变量获取，尝试从GitHub API获取
        if (!commitHash || commitHash === 'unknown') {
            try {
                const githubResponse = await fetch('https://api.github.com/repos/LuminolCraft/craft.luminolsuki.moe/commits/main', {
                    headers: {
                        'User-Agent': 'Netlify-Function'
                    }
                });
                
                if (githubResponse.ok) {
                    const githubData = await githubResponse.json();
                    const githubHash = githubData.sha;
                    const githubShortHash = githubHash.substring(0, 7);
                    
                    console.log('从GitHub API获取到提交哈希:', githubShortHash);
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            version: githubShortHash,
                            fullHash: githubHash,
                            branch: branch || 'main',
                            deployTime: deployTime,
                            timestamp: new Date().toISOString(),
                            source: 'github-api'
                        })
                    };
                }
            } catch (githubError) {
                console.error('GitHub API请求失败:', githubError);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                version: shortHash || 'unknown',
                fullHash: commitHash || 'unknown',
                branch: branch || 'main',
                deployTime: deployTime,
                timestamp: new Date().toISOString(),
                source: 'netlify-env'
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
