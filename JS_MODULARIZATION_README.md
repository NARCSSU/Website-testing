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
