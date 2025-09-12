# LuminolCraft 服务器网站

本仓库包含 LuminolCraft Minecraft 公益服务器官方网站的源代码，旨在为玩家提供服务器详细信息、特色功能、游戏模式介绍及社区动态，吸引并服务于玩家社区。

## 网站地址

网站已正式上线，可通过以下链接访问：  
[https://craft.luminolsuki.moe/](https://craft.luminolsuki.moe/)

## 功能特性

- **核心信息**：展示两种主要游戏模式——纯净生存（原版体验，仅限基础命令）与综合生存（融合 RPG、技能系统和粘液科技）。
- **服务器特色**：突出跨平台兼容（Java 版与基岩版互通，无正版门槛）、24×7 稳定运行（高 TPS，4 小时自动备份）及活跃管理（快速响应玩家需求）。
- **服务器状态**：实时显示在线状态、玩家数量及支持的游戏版本（1.21.7/8）。
- **新闻动态**：提供服务器最新公告、活动和社区故事，支持标签筛选、搜索功能及分页展示，新闻详情页包含 Markdown 渲染内容和图片画廊。
- **支持方式**：提供多种支持途径，包括论坛顶帖（MineBBS、klpbbs、mcmod）、爱发电捐款及 GitHub 项目 Star 和代码贡献。
- **游戏截图**：展示服务器内实际游戏画面，首页横幅支持随机切换背景图片（每 3.6 秒切换）。
- **响应式设计**：适配桌面、平板及移动设备，提供流畅的浏览体验，包括移动端汉堡菜单和动态下拉菜单。
- **交互优化**：使用防抖（新闻搜索）和节流（支持页面按钮点击）技术，提升用户体验。

## 技术栈

- **HTML5**：采用语义化标签构建结构化、可访问的内容。
- **CSS3**：实现响应式布局、动画效果（如淡入淡出、悬停效果）及自定义滚动条样式，适配桌面和移动端（`styles.css`, `mobile.css`, `support-styles.css`, `news-styles.css`, `news-detail-styles.css`, `news-mobile.css`, `news-detail-mobile.css`）。
- **JavaScript**：
  - 动态交互功能：移动端汉堡菜单切换、服务器规则下拉菜单、平滑滚动效果、基于滚动的动态显示动画（`script.js`, `support-script.js`, `news-script.js`, `news-detail-script.js`）。
  - 新闻功能：异步加载 `news.json`，Markdown 内容预加载，防抖搜索，图片画廊与灯箱效果。
  - 节流机制：限制支持页面按钮的频繁点击（1 秒冷却）。
- **JSON**：通过 `news.json` 存储新闻数据，支持动态加载和缓存（30 分钟有效期）。
- **字体**：使用 MiSans 字体，提供一致的视觉体验。

## 页面结构

1. **导航栏**（`index.html`, `support.html`, `news.html`, `news-detail.html`）：
   - 包含服务器标志、导航链接（主页、服务器规则、支持我们、新闻）、服务器规则下拉菜单（简洁版、详细版）及“支持我们”入口。
   - 移动端支持汉堡菜单，桌面端支持悬停下拉菜单。
2. **首页横幅**（`index.html`）：
   - 展示服务器名称、简介及“加入交流群”按钮，背景为随机切换的游戏截图（3.6 秒切换）。
3. **服务器状态**（`index.html`）：
   - 实时显示在线状态、玩家数量及版本兼容性。
4. **纯净生存介绍**（`index.html`）：
   - 详述原版生存特色：基础命令（/tpa、/home、/rtp）、无红石限制、不更改原版特性、下界与末地死亡不掉落。
5. **综合生存介绍**（`index.html`）：
   - 介绍 RPG 生存、技能系统、粘液科技、领地系统及死亡不掉落等玩法。
6. **服务器亮点**（`index.html`）：
   - 强调响应速度快、多端畅玩、安全可靠等优势。
7. **新闻页面**（`news.html`）：
   - 显示新闻列表，支持标签筛选、搜索及分页（桌面端每页 6 条，移动端每页 3 条）。
   - 置顶新闻高亮显示，包含标题、日期、标签及预览内容。
8. **新闻详情页**（`news-detail.html`）：
   - 展示新闻标题、日期、标签、Markdown 渲染内容及图片画廊，支持灯箱效果浏览图片。
   - 包含“返回新闻列表”按钮。
9. **支持我们页面**（`support.html`）：
   - 提供论坛顶帖（MineBBS、klpbbs、mcmod）、爱发电捐款、GitHub Star 及代码贡献等多种支持方式。
   - 包含节流机制的按钮，防止频繁点击。
10. **页脚**（`index.html`, `support.html`, `news.html`, `news-detail.html`）：
    - 包含社区链接（QQ 交流群、我的世界找服网、爱发电、GitHub）、宣传贴链接及版权信息。

## 版权信息

- 网站使用 [MiSans](https://hyperos.mi.com/font/) 字体。
- “Minecraft”及“我的世界”为 Mojang AB 的注册商标，LuminolCraft 为独立服务器，与 Mojang AB 或 Microsoft 无任何隶属关系。
- 网站内容 © 2025 Luminol Team 保留所有权利。

## 许可证

本项目采用 GNU Affero General Public License v3.0（AGPL-3.0）授权，详情请见：  
[https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html)

## 联系方式

- **GitHub**：[https://github.com/LuminolCraft/](https://github.com/LuminolCraft/)
- **爱发电**：[https://afdian.com/a/Luminol](https://afdian.com/a/Luminol)
- **交流群**：通过网站首页“加入交流群”按钮获取。
