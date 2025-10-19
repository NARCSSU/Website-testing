# 🌟 LuminolCraft Official Website

> **The official website for LuminolCraft Minecraft Server**

[![English](https://img.shields.io/badge/Language-English-blue.svg)](README.md)
[![中文](https://img.shields.io/badge/语言-中文-red.svg)](README_CN.md)

[![License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![GitHub Stars](https://img.shields.io/github/stars/LuminolCraft/craft.luminolsuki.moe.svg)](https://github.com/LuminolCraft/craft.luminolsuki.moe/stargazers)

## 🎮 About LuminolCraft

**LuminolCraft** is a professional Minecraft server community offering two distinct gameplay experiences:

- **🌱 Pure Survival Server** - Original Minecraft experience with basic survival commands
- **⚡ Comprehensive Survival Server** - RPG + Skills + Slimefun integration

### 🏆 Server Features

| Feature | Pure Survival | Comprehensive Survival |
|---------|---------------|----------------------|
| **Gameplay** | Original Minecraft | RPG + Skills + Slimefun |
| **Commands** | `/tpa`, `/home`, `/rtp` | Full command suite |
| **Protection** | None | Complete territory system |
| **Death System** | Drop items in overworld | No item loss in all dimensions |
| **Redstone** | No restrictions | Full automation support |

## 🚀 Website Features

### ✨ Core Functionality

- **🎨 Dynamic Backgrounds** - 22 rotating game screenshots (3.6s intervals)
- **📰 News System** - JSON-based content management with Markdown support
- **🔍 Advanced Search** - Tag filtering, keyword search, pagination
- **📱 Responsive Design** - Perfect mobile, tablet, and desktop support
- **🌙 Theme Support** - Light/Dark mode with system preference detection

### 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Flexbox/Grid, CSS Variables, Media Queries
- **Libraries**: Font Awesome 7.0.0, Marked.js, MiSans Font
- **Deployment**: Netlify, Netlify Functions, Gitee Image Hosting
- **CORS Solution**: Cloudflare Pages proxy to bypass Gitee CORS restrictions

### 📁 Project Structure

```
craft.luminolsuki.moe/
├── 🎯 Pages
│   ├── index.html              # Homepage
│   ├── support.html            # Support page
│   ├── monitoring.html         # Server monitoring
│   └── news/
│       ├── news.html           # News listing
│       ├── news-detail.html    # News detail
│       └── news.json           # News data
│
├── ⚡ JavaScript Modules
│   ├── js/
│   │   ├── main.js            # Main entry point
│   │   ├── utils.js           # Utility functions
│   │   ├── navigation.js      # Navigation system
│   │   ├── background.js      # Background carousel
│   │   ├── news.js            # News management
│   │   └── version.js         # Version tracking
│   └── netlify/functions/     # Server functions
│       └── version.js         # Version API
│
├── 🎨 Styling
│   ├── styles.css             # Main stylesheet
│   ├── mobile.css             # Mobile responsive
│   ├── news-styles.css        # News page styles
│   ├── support-styles.css     # Support page styles
│   └── monitoring-styles.css  # Monitoring page styles
│
└── 🖼️ Assets
    ├── images/                # Game screenshots & icons
    ├── sitemap.xml           # SEO sitemap
    ├── _redirects           # Netlify redirects
    └── BingSiteAuth.xml     # Search engine auth
```

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/LuminolCraft/craft.luminolsuki.moe.git
   cd craft.luminolsuki.moe
   ```

### Netlify Deployment

1. **Connect to GitHub repository**
2. **Configure automatic deployment**
3. **Set environment variables** (if needed)
4. **Access your deployed site**

## 🔧 Development Guide

### Adding New Features

1. **JavaScript Modules**: Create new modules in `js/` directory
2. **Styling**: Add corresponding CSS files as needed
3. **Page Structure**: Maintain consistent HTML structure and navigation
4. **Mobile Support**: Add corresponding mobile styles

### News System Management

1. **Add News**: Edit `news/news.json` file
2. **Markdown Content**: Add corresponding files in News-content/ directory
3. **Image Resources**: Upload to Gitee image hosting and update links
4. **Caching**: System automatically handles cache refresh

### CORS Solution

The website implements a smart CORS bypass solution:

- **Problem**: Gitee's CORS policy blocks direct access to GitHub raw content
- **Solution**: Automatic URL conversion from GitHub to Cloudflare Pages
- **Example**: `raw.githubusercontent.com` → `luminolcraft-news.pages.dev`
- **Benefits**: Faster loading, better reliability, global CDN acceleration

### 🔀 Code Contributions

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Create Pull Request

### 🐛 Issue Reporting

Use GitHub Issues to report problems, please include:

- Problem description
- Reproduction steps
- Environment information
- Screenshots (if applicable)

## 📞 Contact Us

### 💬 Community

- **QQ Group**: Available through website homepage
- **Discord**: Coming soon

### 🌐 External Platforms

- **GitHub Organization**: [LuminolMC](https://github.com/LuminolMC), [LuminolCraft](https://github.com/LuminolCraft)
- **Server Forums**: [MineBBS](https://www.minebbs.com/threads/luminolcraft.35730/), [klpbbs](https://klpbbs.com/thread-162318-1-1.html), [mcmod](https://play.mcmod.cn/sv20188263.html)

## 📜 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

### 🏷️ Trademark Notice

- "Minecraft" and "我的世界" are registered trademarks of Mojang AB
- LuminolCraft is an independent game server with no affiliation to Mojang AB or Microsoft
- Website content © 2025 Luminol Team. All rights reserved.

### 📚 Resource Credits

- Website uses MiSans open source font
- Icons from Font Awesome open source project
- Image resources hosted on Gitee platform

## ⭐ Star History

If your star could make this project more popular, that would be amazing!

---

**🌟 If you think this project is great, please give us a Star!**

Made with ❤️ by LuminolCraft Team

---

## 🔗 Links

- **🌐 Website**: [craft.luminolsuki.moe](https://craft.luminolsuki.moe)
- **📱 Server Status**: [Monitoring Page](https://craft.luminolsuki.moe/monitoring.html)
- **📰 News**: [News Center](https://craft.luminolsuki.moe/news/news.html)
- **💬 Support**: [Support Page](https://craft.luminolsuki.moe/support.html)

---

## 🌐 Language / 语言

- **English**: [README.md](README.md)
- **中文**: [README_CN.md](README_CN.md) (Current / 当前)

---

*Last updated: October 19, 2025*