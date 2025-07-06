# TouchThatGrass

> AI 驱动的智能旅行种草 & 路线推荐 H5 应用

本项目基于 Next.js 15、TypeScript、Mapbox GL JS、Tailwind CSS，结合 AI 聊天与地理服务，帮助用户智能生成一日游路线、可视化地图打卡、路线动画、智能导航与分享。

---

## ✨ 主要功能

- AI 聊天生成个性化一日游路线
- 草点（打卡点）智能地理编码（支持 Mapbox/高德自动切换）
- 地图可视化（Mapbox GL JS，支持动画蚂蚁线、草点高亮）
- 列表/地图视图切换
- 智能导航（自动适配国内外地图服务）
- 旅程完成后生成精美分享卡片
- 支持多端部署（Vercel 推荐）

---

## 🛠 技术栈

- [Next.js 15 (App Router)](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI/AI API](https://platform.openai.com/)
- [高德地图 API](https://lbs.amap.com/api/webservice/summary/)
- [Vercel 部署](https://vercel.com/)

---

## 📁 目录结构

```
src/
  app/
    components/      # 主要 UI 组件（地图、聊天、导航、分享卡等）
    services/        # 地图/地理/分享等服务逻辑
    api/             # 后端 API 路由（地理编码、AI 聊天等）
  constants/         # 常量与提示语
  hooks/             # React hooks（如 useTravelPlan）
  types/             # 全局类型定义
public/              # 静态资源
```

---

## ⚙️ 环境变量

请在根目录下创建 `.env.local`，并配置以下变量：

```env
NEXT_PUBLIC_MAPBOX_TOKEN=你的MapboxToken
NEXT_PUBLIC_AMAP_KEY=你的高德Key（可选，支持中国地址更精准）
OPENAI_API_KEY=你的OpenAI Key
```

**注意：** 部署到 Vercel 时，需在 Vercel 后台手动配置所有环境变量！

---

## 🚀 本地开发与部署

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 生产构建
npm run build
npm start
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 📦 主要依赖

- next
- react
- mapbox-gl
- tailwindcss
- openai
- @types/geojson
- eslint, typescript 等

---

## 🤝 贡献指南

1. Fork 本仓库
2. 新建分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -am 'feat: xxx'`)
4. Push 分支 (`git push origin feature/xxx`)
5. 提交 Pull Request

---

## 📄 License

MIT

---

> 如有问题或建议，欢迎提 Issue 或 PR！
