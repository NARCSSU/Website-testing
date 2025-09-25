# JavaScript 模块化重构说明

## 概述
已成功将网站的JavaScript功能拆分成多个模块化文件，提高了代码的可维护性和可读性。

## 文件结构

### 新增的模块文件
```
js/
├── utils.js          # 工具函数模块
├── navigation.js     # 导航功能模块
├── news.js          # 新闻功能模块
├── background.js    # 背景轮播模块
├── version.js       # 版本信息模块
└── main.js          # 主入口文件
```

### 原有文件
```
script.js           # 原始主脚本（已替换）
news-script.js      # 原始新闻脚本（已替换）
news-detail-script.js # 原始新闻详情脚本（已替换）
support-script.js   # 原始支持页面脚本（已替换）
```

## 模块功能说明

### 1. utils.js - 工具函数模块
- `debounce()` - 防抖函数
- `throttle()` - 节流函数
- `isValidUrl()` - URL验证函数

### 2. navigation.js - 导航功能模块
- `NavigationManager` 类
- 汉堡菜单功能
- 下拉菜单功能
- 滚动效果
- 平滑滚动

### 3. news.js - 新闻功能模块
- `NewsManager` 类
- 新闻列表加载
- 新闻详情渲染
- 分页功能
- 搜索和筛选
- Markdown内容处理

### 4. background.js - 背景轮播模块
- `BackgroundSlider` 类
- 背景图片切换
- 淡入淡出动画
- 随机背景选择

### 5. version.js - 版本信息模块
- `VersionManager` 类
- 网站版本显示
- 运行时间计算
- Netlify函数集成

### 6. main.js - 主入口文件
- 协调各模块初始化
- 页面特定功能加载
- 全局变量管理

## HTML文件更新

### index.html
```html
<!-- 模块化JavaScript文件 -->
<script src="js/utils.js"></script>
<script src="js/navigation.js"></script>
<script src="js/background.js"></script>
<script src="js/version.js"></script>
<script src="js/news.js"></script>
<script src="js/main.js"></script>
```

### news/news.html
```html
<!-- 模块化JavaScript文件 -->
<script src="../js/utils.js"></script>
<script src="../js/navigation.js"></script>
<script src="../js/news.js"></script>
<script src="../js/main.js"></script>
```

### news/news-detail.html
```html
<!-- 模块化JavaScript文件 -->
<script src="../js/utils.js"></script>
<script src="../js/navigation.js"></script>
<script src="../js/news.js"></script>
<script src="../js/main.js"></script>
```

### support.html
```html
<!-- 模块化JavaScript文件 -->
<script src="js/utils.js"></script>
<script src="js/navigation.js"></script>
<script src="js/main.js"></script>
```

## 优势

1. **模块化设计** - 每个功能独立成模块，便于维护
2. **代码复用** - 通用功能可在多个页面间共享
3. **易于调试** - 问题定位更精确
4. **性能优化** - 按需加载，减少不必要的代码执行
5. **可扩展性** - 新增功能时只需添加对应模块

## 兼容性

- 保持了原有的所有功能
- 不影响现有的用户体验
- 支持所有现代浏览器
- 向后兼容原有代码结构

## 测试

可以通过以下方式测试功能：
1. 启动本地服务器：`python -m http.server 8000`
2. 访问 `http://localhost:8000` 测试主页
3. 访问 `http://localhost:8000/news/news.html` 测试新闻页面
4. 访问 `http://localhost:8000/support.html` 测试支持页面

## 注意事项

- 所有模块都支持模块化导出（如果将来需要）
- 保持了原有的全局变量访问方式
- 错误处理机制完整
- 缓存机制保持不变
