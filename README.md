# TouchThatGrass（种草官）

## 项目简介

**TouchThatGrass** 是一个为年轻旅行者设计的"AI旅行种草官"Web应用。用户可以通过聊天与AI助手互动，自动生成个性化一日游路线，并在地图上打卡、种草/拔草、管理行程。项目融合了AI智能推荐、交互式地图、路线管理和社交分享等功能，致力于提升旅行灵感和体验。

---

## 主要功能

- **AI聊天助手**：通过自然语言对话，自动生成符合用户兴趣的旅行路线。
- **Markdown行程渲染**：AI回复支持Markdown格式，行程结构清晰美观。
- **草点打卡地图**：基于Mapbox，展示所有推荐草点，支持点击打卡、种草/拔草。
- **种草/拔草交互**：点击地图草点，底部弹出大图标按钮，支持一键种草/拔草，状态同步到全局。
- **路线列表管理**：可拖拽排序、设置时间、拍照、评论每个草点。
- **智能导航**：popup内一键跳转高德/Google地图导航，自动适配中外用户。
- **旅程完成庆祝&分享**：全部打卡后有动画庆祝，并可生成分享卡片。
- **自定义UI**：支持自定义字体、纸张纹理背景、专属头像等。

---

## 技术栈

- **前端**：React 18 + Next.js 15（App Router）
- **地图**：Mapbox GL JS
- **AI**：OpenAI GPT-4o API
- **UI**：Tailwind CSS + CSS Modules
- **图片资源**：Next.js `Image` 组件和自定义静态资源
- **拖拽**：@dnd-kit/core
- **类型**：TypeScript 全面类型安全

---

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置环境变量**
   在根目录新建 `.env.local`，添加：
   ```env
   OPENAI_API_KEY=你的OpenAI密钥
   NEXT_PUBLIC_MAPBOX_TOKEN=你的Mapbox Token
   ```

3. **开发模式启动**
   ```bash
   npm run dev
   ```
   访问 http://localhost:3000

4. **生产构建**
   ```bash
   npm run build
   npm start
   ```

---

## 目录结构

- `src/app/components/`  —— 主要UI组件（ChatBox, GrassMap, RouteListPanel等）
- `src/app/api/`         —— 后端API（AI聊天、地理编码）
- `src/hooks/`           —— 全局状态与业务逻辑
- `public/img/`          —— 静态图片资源（草点、logo、背景等）
- `src/types/`           —— TypeScript类型定义

---

## 核心亮点

- **AI+地图深度融合**：AI自动生成行程，草点一键同步到地图，支持打卡、种草、拔草。
- **极致交互体验**：底部大图标按钮、动画庆祝、纸张纹理、专属字体，细节拉满。
- **智能导航适配**：国内外用户自动跳转高德/Google地图。
- **代码结构清晰**：组件化、类型安全、易于二次开发。

---

## 自定义与扩展

- **更换地图服务**：可在 `MapService` 中扩展高德、百度等地图API。
- **自定义UI**：替换 `public/img/` 下的图片、字体、背景即可。
- **AI模型切换**：在 `api/chat/route.ts` 里可自定义OpenAI模型参数。
- **多语言支持**：可扩展i18n，支持更多语言和本地化。

---

## 致谢

- [OpenAI](https://openai.com/)
- [Mapbox](https://www.mapbox.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

如有问题或建议，欢迎提 issue 或联系作者！
