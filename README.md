# LuminolCraft 官方服务器网站

> 一个现代化的 Minecraft 公益服务器官方网站，为玩家提供完整的服务器信息、新闻动态和社区体验。

## 🌟 项目简介

LuminolCraft 是一个基于 Luminol 服务端的 Minecraft 公益服务器网站，致力于为玩家搭建纯净而丰富的生存环境。网站采用现代化的前端技术栈，提供流畅的用户体验和直观的信息展示。

**📍 网站地址**: [https://craft.luminolsuki.moe/](https://craft.luminolsuki.moe/)  
**🏷️ 服务器类型**: 纯净生存 + 综合生存双模式  
**🎮 支持版本**: Minecraft Java Edition 1.21.7/8 & 基岩版  
**🔄 部署平台**: Netlify (自动部署)

## ✨ 核心功能

### 🏠 服务器展示
- **双模式介绍**: 纯净生存与综合生存的详细对比说明
- **实时状态**: 在线玩家数、服务器版本、运行状态实时更新
- **管理团队**: 8人专业管理团队信息展示
- **游戏特色**: 多端互通、无正版门槛、24×7稳定运行

### 📰 新闻系统
- **动态内容**: 基于 JSON 的新闻管理系统
- **丰富交互**: 支持标签筛选、关键词搜索、分页浏览
- **内容渲染**: Markdown 渲染支持，包含图片画廊和灯箱效果
- **置顶功能**: 重要公告置顶高亮显示
- **缓存优化**: 多级缓存策略提升加载速度

### 🎨 视觉体验
- **轮播背景**: 22张精选游戏截图定时轮播（3.6秒切换）
- **响应式设计**: 完美适配桌面端、平板和移动设备
- **现代UI**: 玻璃拟态效果、渐变背景、平滑动画
- **字体优化**: MiSans 字体确保中文显示效果

### 🔧 技术特性
- **模块化架构**: JavaScript 代码模块化管理
- **性能优化**: 防抖节流、懒加载、智能缓存
- **用户体验**: 平滑滚动、滚动动画、交互反馈
- **版本管理**: Git 提交哈希自动显示，支持一键跳转 GitHub

## 🛠️ 技术栈

### 前端核心
- **HTML5**: 语义化标签构建，良好的可访问性
- **CSS3**: Flexbox/Grid 布局，CSS 变量，媒体查询
- **JavaScript**: ES6+ 语法，模块化设计，异步处理

### 外部依赖
- **Font Awesome 7.0.0**: 矢量图标库
- **Marked.js**: Markdown 渲染引擎
- **MiSans**: 小米开源字体
- **多个 CDN**: 外部资源的备选方案

### 部署栈
- **Netlify**: 静态网站托管
- **Netlify Functions**: 服务器端函数 (版本信息 API)
- **Gitee**: 图片资源托管
- **Cloudflare**: 内容分发网络 (可选)

## 📁 项目结构

```
craft.luminolsuki.moe/
├── 🎯 页面文件
│   ├── index.html              # 主页面
│   ├── support.html            # 支持页面
│   ├── monitoring.html         # 监控页面
│   └── news/
│       ├── news.html           # 新闻首页
│       ├── news-detail.html    # 新闻详情
│       └── news.json           # 新闻数据
│
├── ⚡ JavaScript 模块
│   ├── js/
│   │   ├── main.js            # 主入口
│   │   ├── utils.js           # 工具函数
│   │   ├── navigation.js      # 导航功能
│   │   ├── background.js      # 背景轮播
│   │   ├── news.js            # 新闻系统
│   │   └── version.js         # 版本管理
│   └── netlify/functions/     # 服务器函数
│       └── version.js         # 版本信息 API
│
├── 🎨 样式文件
│   ├── styles.css             # 主样式表
│   ├── mobile.css             # 移动端适配
│   ├── news-styles.css        # 新闻页面样式
│   ├── support-styles.css     # 支持页面样式
│   └── monitoring-styles.css  # 监控页面样式
│
└── 🖼️ 资源文件
    ├── images/                # 游戏截图和图标
    ├── sitemap.xml           # SEO 站点地图
    ├── _redirects           # Netlify 重定向规则
    └── BingSiteAuth.xml     # 搜索引擎认证
```

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/LuminolCraft/craft.luminolsuki.moe.git
   cd craft.luminolsuki.moe
   ```

2. **启动开发服务器**
   ```bash
   # 使用 Python (推荐)
   python -m http.server 8000
   
   # 或者使用 Node.js
   npx serve .
   
   # 或者直接打开 index.html
   ```

3. **访问本地站点**
   ```
   访问: http://localhost:8000
   ```

### 部署到 Netlify

1. **连接到 GitHub 仓库**
2. **设置自动部署**
3. **配置环境变量** (如需)
4. **访问构建的站点**

## 🎮 服务器信息

### 🌱 纯净生存服务器
- **特点**: 保持原版体验，仅添加基础生存命令
- **命令**: `/tpa`, `/home`, `/rtp` (带冷却机制)
- **限制**: 无红石限制，无领地系统，无游戏特性修改
- **死亡机制**: 主世界掉物品，下界与末地不掉落

### ⚡ 综合生存服务器
- **特点**: 融合 RPG + 技能系统 + 粘液科技
- **玩法**: 武器升级、自动化生产、技能修炼
- **保护**: 完整领地系统
- **机制**: 全维度死亡不掉落

### 👥 管理团队
- **MrHua269**: 物理服主 & Luminol 开发人员
- **NaT_Jerry**: 纯净生存管理员
- **Klop233**: 综合生存管理员
- **IngilYing**: 纯净生存管理员
- **SunaShiroko**: 综合生存管理员
- **xiaomu18**: 综合生存管理员
- **Lonelyplanet_**: 社区管理
- **LycaonW**: 社区管理
- **Narcssu**: 网站开发主理人

## 🔧 开发指南

### 添加新功能

1. **JavaScript 模块**: 在 `js/` 目录下创建新模块
2. **样式文件**: 根据需要创建对应的 CSS 文件
3. **页面结构**: 保持一致的 HTML 结构和导航
4. **Mobile 适配**: 添加对应的移动端样式

### 新闻系统操作

1. **添加新闻**: 编辑 `news/news.json` 文件
2. **Markdown 内容**: 在 News-content/ 目录下添加对应文件;
3. **图片资源**: 上传到 Gitee 图床并更新链接
4. **缓存**: 系统会自动处理缓存刷新

### 背景图片管理

1. **添加图片**: 将新图片上传到 Gitee
2. **更新列表**: 修改 `js/background.js` 中的 `backgroundImages` 数组
3. **测试效果**: 确保图片加载正常

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 🔀 代码贡献
1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 📖 文档改进
- 改进 README 文档
- 添加代码注释
- 修复错别字和格式问题

### 🐛 问题反馈
使用 GitHub Issues 报告问题，请包括：
- 问题描述
- 重现步骤
- 环境信息
- 截图 (如适用)

## 📞 联系我们

### 💬 社区交流
- **QQ 交流群**: 通过网站首页获取
- **Discord**: 正在规划中

### 🌐 外部平台
- **GitHub 组织**: [LuminolCraft](https://github.com/LuminolCraft/)
- **爱发电**: [支持我们的发展](https://afdian.com/a/Luminol)

### 🎯 服务器论坛
- **MineBBS**: 定期发布更新
- **klpbbs**: 社区互动
- **mcmod**: 技术支持

## 📜 开源协议

本项目基于 [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html) 开源协议。

### 🏷️ 商标声明
- "Minecraft" 和 "我的世界" 是 Mojang AB 的注册商标
- LuminolCraft 是独立的游戏服务器，与 Mojang AB 或 Microsoft 无任何隶属关系
- 网站内容 © 2025 Luminol Team 保留所有权利

### 📚 资源声明
- 网站使用 [MiSans](https://hyperos.mi.com/font/) 开源字体
- 图标来自 [Font Awesome](https://fontawesome.com/) 开源项目
- 图片资源托管在 [ Gitee](https://gitee.com/) 平台

## ⭐ Star History

如果你的星标能够让这个项目变得更受关注，那就太棒了！

---

<div align="center">

**🌟 如果你觉得这个项目不错，请给我们一个 Star！**

Made with ❤️ by LuminolCraft Team

</div>
