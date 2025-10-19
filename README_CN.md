# 🌟 LuminolCraft 官方网站

> **LuminolCraft Minecraft 服务器官方网站**

[![English](https://img.shields.io/badge/Language-English-blue.svg)](README.md)
[![中文](https://img.shields.io/badge/语言-中文-red.svg)](README_CN.md)

[![License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)
[![GitHub Stars](https://img.shields.io/github/stars/LuminolCraft/craft.luminolsuki.moe.svg)](https://github.com/LuminolCraft/craft.luminolsuki.moe/stargazers)

## 🎮 关于 LuminolCraft

**LuminolCraft** 是一个专业的 Minecraft 服务器社区，提供两种不同的游戏体验：

- **🌱 纯净生存服务器** - 原版 Minecraft 体验，仅添加基础生存命令
- **⚡ 综合生存服务器** - RPG + 技能系统 + 粘液科技整合

### 🏆 服务器特色

| 功能 | 纯净生存 | 综合生存 |
|------|----------|----------|
| **游戏玩法** | 原版 Minecraft | RPG + 技能 + 粘液科技 |
| **命令系统** | `/tpa`, `/home`, `/rtp` | 完整命令套件 |
| **保护系统** | 无 | 完整领地系统 |
| **死亡机制** | 主世界掉物品 | 全维度不掉落 |
| **红石限制** | 无限制 | 完整自动化支持 |

## 🚀 网站功能

### ✨ 核心功能

- **🎨 动态背景** - 22张轮播游戏截图（3.6秒间隔）
- **📰 新闻系统** - 基于JSON的内容管理，支持Markdown
- **🔍 高级搜索** - 标签筛选、关键词搜索、分页浏览
- **📱 响应式设计** - 完美适配手机、平板和桌面端
- **🌙 主题支持** - 浅色/深色模式，支持系统偏好检测

### 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript ES6+
- **样式**: Flexbox/Grid, CSS变量, 媒体查询
- **库文件**: Font Awesome 7.0.0, Marked.js, MiSans字体
- **部署**: Netlify, Netlify Functions, Gitee图片托管
- **CORS解决方案**: Cloudflare Pages代理绕过Gitee CORS限制

### 📁 项目结构

```
craft.luminolsuki.moe/
├── 🎯 页面文件
│   ├── index.html              # 主页面
│   ├── support.html            # 支持页面
│   ├── monitoring.html         # 服务器监控
│   └── news/
│       ├── news.html           # 新闻列表
│       ├── news-detail.html    # 新闻详情
│       └── news.json           # 新闻数据
│
├── ⚡ JavaScript 模块
│   ├── js/
│   │   ├── main.js            # 主入口
│   │   ├── utils.js           # 工具函数
│   │   ├── navigation.js      # 导航系统
│   │   ├── background.js      # 背景轮播
│   │   ├── news.js            # 新闻管理
│   │   └── version.js         # 版本跟踪
│   └── netlify/functions/     # 服务器函数
│       └── version.js         # 版本API
│
├── 🎨 样式文件
│   ├── styles.css             # 主样式表
│   ├── mobile.css             # 移动端响应式
│   ├── news-styles.css        # 新闻页面样式
│   ├── support-styles.css     # 支持页面样式
│   └── monitoring-styles.css  # 监控页面样式
│
└── 🖼️ 资源文件
    ├── images/                # 游戏截图和图标
    ├── sitemap.xml           # SEO站点地图
    ├── _redirects           # Netlify重定向
    └── BingSiteAuth.xml     # 搜索引擎认证
```

## 🚀 快速开始

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/LuminolCraft/craft.luminolsuki.moe.git
   cd craft.luminolsuki.moe
   ```

2. **启动开发服务器**
   ```bash
   # 使用 Python（推荐）
   python -m http.server 8000
   
   # 使用 Node.js
   npx serve .
   
   # 或直接打开 index.html
   ```

3. **访问网站**
   ```
   http://localhost:8000
   ```

### Netlify 部署

1. **连接到 GitHub 仓库**
2. **配置自动部署**
3. **设置环境变量**（如需要）
4. **访问部署的网站**

## 👥 管理团队

| 职位 | 成员 | 职责 |
|------|------|------|
| **服务器主** | MrHua269 | 物理服主 & Luminol 开发人员 |
| **纯净生存管理员** | NaT_Jerry | 纯净生存服务器管理 |
| **纯净生存管理员** | IngilYing | 纯净生存服务器管理 |
| **综合生存管理员** | Klop233 | 综合生存服务器管理 |
| **综合生存管理员** | SunaShiroko | 综合生存服务器管理 |
| **综合生存管理员** | xiaomu18 | 综合生存服务器管理 |
| **社区管理** | Lonelyplanet_ | 社区管理 |
| **社区管理** | LycaonW | 社区管理 |
| **网站开发** | Narcssu | 网站开发与维护 |

## 🔧 开发指南

### 添加新功能

1. **JavaScript 模块**: 在 `js/` 目录下创建新模块
2. **样式文件**: 根据需要添加对应的 CSS 文件
3. **页面结构**: 保持一致的 HTML 结构和导航
4. **移动端支持**: 添加对应的移动端样式

### 新闻系统管理

1. **添加新闻**: 编辑 `news/news.json` 文件
2. **Markdown 内容**: 在 News-content/ 目录下添加对应文件
3. **图片资源**: 上传到 Gitee 图床并更新链接
4. **缓存**: 系统会自动处理缓存刷新

### CORS 解决方案

网站实现了智能的CORS绕过解决方案：

- **问题**: Gitee的CORS策略阻止直接访问GitHub raw内容
- **解决方案**: 自动将GitHub URL转换为Cloudflare Pages URL
- **示例**: `raw.githubusercontent.com` → `luminolcraft-news.pages.dev`
- **优势**: 更快的加载速度、更好的可靠性、全球CDN加速

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
- 截图（如适用）

## 📞 联系我们

### 💬 社区交流

- **QQ 交流群**: 通过网站首页获取
- **Discord**: 正在规划中

### 🌐 外部平台

- **GitHub 组织**: [LuminolCraft](https://github.com/LuminolCraft)
- **服务器论坛**: MineBBS, klpbbs, mcmod

## 📜 开源协议

本项目基于 GNU Affero General Public License v3.0 (AGPL-3.0) 开源协议。

### 🏷️ 商标声明

- "Minecraft" 和 "我的世界" 是 Mojang AB 的注册商标
- LuminolCraft 是独立的游戏服务器，与 Mojang AB 或 Microsoft 无任何隶属关系
- 网站内容 © 2025 Luminol Team 保留所有权利

### 📚 资源声明

- 网站使用 MiSans 开源字体
- 图标来自 Font Awesome 开源项目
- 图片资源托管在 Gitee 平台

## ⭐ Star History

如果你的星标能够让这个项目变得更受关注，那就太棒了！

---

**🌟 如果你觉得这个项目不错，请给我们一个 Star！**

Made with ❤️ by LuminolCraft Team

---

## 🔗 相关链接

- **🌐 网站**: [craft.luminolsuki.moe](https://craft.luminolsuki.moe)
- **📱 服务器状态**: [监控页面](https://craft.luminolsuki.moe/monitoring.html)
- **📰 新闻中心**: [新闻中心](https://craft.luminolsuki.moe/news/news.html)
- **💬 支持页面**: [支持页面](https://craft.luminolsuki.moe/support.html)

## 📊 项目统计

- **总提交数**: 200+
- **语言分布**: CSS 39.9%, HTML 34.3%, JavaScript 25.8%
- **贡献者**: 2 名活跃开发者
- **星标数**: 1（持续增长中！）
- **Fork 数**: 0（成为第一个 Fork 的人！）

---

## 🌐 Language / 语言

- **English**: [README.md](README.md)
- **中文**: [README_CN.md](README_CN.md) (Current / 当前)

---

*最后更新: 2025年10月19日*
