# Netlify 部署指南

本指南将帮助你将 LuminolCraft 项目从 Gitee 仓库部署到 Netlify，实现自动化部署和 news.json 同步更新。

## 📋 准备工作

### 1. 确保项目文件完整
确保你的 Gitee 仓库包含以下关键文件：
- `index.html` - 主页
- `news/news.html` - 新闻页面
- `news/news.json` - 新闻数据文件
- `netlify.toml` - Netlify 配置文件（已创建）
- `_redirects` - 重定向规则（已优化）

### 2. 检查 news.json 位置
确保 `news.json` 文件位于 `news/` 目录下，这样 Netlify 就能正确提供这个 API 端点。

## 🚀 Netlify 部署步骤

### 步骤 1: 连接 Gitee 仓库到 Netlify

1. **登录 Netlify**
   - 访问 [https://netlify.com](https://netlify.com)
   - 使用 GitHub 账号或邮箱登录

2. **添加新站点**
   - 点击 "Add new site" → "Import an existing project"
   - 选择 "Deploy with Git"

3. **连接 Git 提供商**
   - 虽然 Netlify 默认支持 GitHub，但对于 Gitee，你需要：
     - 选择 "GitHub"（作为临时方案）
     - 或使用 Git LFS 方式手动部署

### 步骤 2: 配置构建设置

由于这是静态网站，配置如下：

- **Branch to deploy**: `main`（或你的主分支名）
- **Build command**: 留空（静态网站无需构建）
- **Publish directory**: 留空或填写 `.`（项目根目录）
- **Functions directory**: `netlify/functions`

### 步骤 3: 环境变量配置（可选）

在 Netlify 控制台的 Environment variables 中，你可以设置：
- 无需特殊环境变量，项目已配置为自动检测环境

## 🔄 Gitee 自动同步方案

由于 Netlify 不直接支持 Gitee webhooks，这里提供几种解决方案：

### 方案 A: GitHub 镜像同步（推荐）

1. **在 GitHub 创建镜像仓库**
   - 在 GitHub 创建一个新仓库
   - 将其设置为 Gitee 仓库的镜像

2. **设置自动同步**
   ```bash
   # 本地添加两个远程仓库
   git remote add gitee https://gitee.com/your-username/your-repo.git
   git remote add github https://github.com/your-username/your-repo.git
   
   # 推送到两个仓库
   git push gitee main
   git push github main
   ```

3. **Netlify 连接 GitHub 镜像**
   - 让 Netlify 监控 GitHub 镜像仓库
   - 每次推送到 Gitee 后，同时推送到 GitHub

### 方案 B: 手动部署

1. **拖拽部署**
   - 直接将项目文件夹拖拽到 Netlify 控制台
   - 适合偶尔更新的情况

2. **Git 手动同步**
   - 定期手动推送代码到连接的 Git 仓库

### 方案 C: CI/CD 自动化（高级）

使用 GitHub Actions 或其他 CI/CD 工具：

```yaml
# .github/workflows/sync-to-netlify.yml
name: Sync to Netlify
on:
  push:
    branches: [ main ]
  
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './public'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📝 news.json 更新流程

### 自动化流程
1. **修改 news.json**
   - 在本地或 Gitee Web 界面修改 `news/news.json`
   - 提交并推送到 Gitee 主分支

2. **同步到 GitHub**（如使用方案 A）
   ```bash
   git push gitee main
   git push github main
   ```

3. **Netlify 自动重新部署**
   - Netlify 检测到 GitHub 仓库变化
   - 自动重新构建和部署
   - 新的 news.json 立即生效

### 验证更新
- 访问 `https://your-site.netlify.app/news/news.json`
- 确认 JSON 数据已更新
- 新闻页面将自动加载新数据

## 🔧 配置文件说明

### netlify.toml
```toml
[build]
  command = ""           # 无构建命令（静态站点）
  publish = "."          # 发布根目录
  functions = "netlify/functions"

# 重定向规则确保 news.json 正确访问
[[redirects]]
  from = "/api/news"
  to = "/news/news.json"
  status = 200
```

### _redirects
```
/news/news       /news/news.html  301!
/api/news        /news/news.json  200
/*               /:splat.html     200
/*               /index.html      404
```

## 🚨 故障排除

### 常见问题

1. **news.json 404 错误**
   - 确认文件路径：`news/news.json`
   - 检查 `_redirects` 文件配置
   - 验证 Netlify 构建日志

2. **资源文件 404**
   - 检查所有资源路径使用相对路径
   - 确认 `images/`、`js/`、`css/` 目录正确

3. **页面跳转问题**
   - 检查 `_redirects` 配置
   - 验证 HTML 文件路径

### 调试步骤

1. **查看 Netlify 构建日志**
   - 在 Netlify 控制台查看 Deploy log
   - 确认所有文件已正确上传

2. **测试 API 端点**
   ```bash
   # 测试 news.json 是否可访问
   curl https://your-site.netlify.app/news/news.json
   ```

3. **检查浏览器控制台**
   - 查看 JavaScript 错误
   - 确认 API 请求成功

## 📊 性能优化

### 缓存策略
项目已配置适当的缓存头：
- 静态资源（图片、JS、CSS）：24小时缓存
- news.json：5分钟缓存（便于快速更新）

### CDN 优化
Netlify 自动提供全球 CDN，无需额外配置。

## 🎯 最佳实践

1. **定期备份**
   - 定期备份 news.json 和重要配置文件
   - 使用 Git 标签标记重要版本

2. **测试流程**
   - 在 staging 环境测试更改
   - 使用 Netlify 的部署预览功能

3. **监控部署**
   - 设置 Netlify 通知
   - 监控网站可用性

## 🔗 相关链接

- [Netlify 官方文档](https://docs.netlify.com/)
- [Netlify _redirects 文档](https://docs.netlify.com/routing/redirects/)
- [Netlify 环境变量](https://docs.netlify.com/environment-variables/overview/)

---

部署完成后，你的网站将能够：
✅ 自动从 Git 仓库部署
✅ 快速更新 news.json 内容
✅ 享受全球 CDN 加速
✅ 获得 HTTPS 证书
✅ 支持自定义域名

如有问题，请检查 Netlify 控制台的部署日志或联系技术支持。
