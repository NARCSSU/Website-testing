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
        // 从GitHub raw获取news.json
        const githubResponse = await fetch('https://raw.githubusercontent.com/LuminolCraft/news.json/main/news.json', {
            headers: {
                'User-Agent': 'Netlify-Function'
            }
        });
        
        if (!githubResponse.ok) {
            throw new Error(`GitHub API returned ${githubResponse.status}`);
        }
        
        const newsData = await githubResponse.json();
        
        // 验证数据结构
        if (!Array.isArray(newsData)) {
            throw new Error('Invalid news data format');
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(newsData)
        };
    } catch (error) {
        console.error('Error fetching news data:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch news data',
                message: error.message
            })
        };
    }
};

