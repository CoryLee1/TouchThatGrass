<!-- Copyrights belongs to Cory Yihua Li -->

# Touch That Grass
<img width="1920" alt="Slide 16_9 - 14 (1)" src="https://github.com/user-attachments/assets/86d42393-3192-49d0-a3d5-adbbd9b3b342" />


> 🌱 AI 驱动的旅行地图 · 行程规划 · 打卡种草 · 智能助手

Live Demo: https://www.touchthatgrassycory.org/ 

---

## Project Overview

**Touch That Grass** 是一款集 AI 行程规划、地图打卡、评论聚合、天气提醒、用户行为分析于一体的现代化旅行 Web App。项目聚焦于提升旅行前、中、后的全流程体验，兼顾实用性与趣味性，适合自由行用户、内容创作者及产品技术展示。

---

## 用户体验流程

1. **进入首页**  
   自动定位当前城市，展示纸质纹理背景与手写体提示，提升仪式感。
2. **AI 智能行程规划**  
   通过对话输入旅行需求，AI 自动生成个性化行程，并以 Markdown 渲染美观展示。
3. **交互式地图打卡**  
   地图支持 marker 点击打卡（种草/拔草），并弹窗展示 Google/Yelp 评论、商家图片、AI mock 评价等。
4. **天气与时间提醒**  
   头像按钮可点击，弹出气泡显示当前城市天气、时间等信息。
5. **旅程分享与笔记推荐**  
   支持一键分享行程，AI 自动推荐小红书优质笔记。
6. **用户行为分析**  
   自动收集用户点击、行为、地理位置等数据，便于产品优化与数据驱动决策。

---
<img width="1920" alt="Slide 16_9 - 15" src="https://github.com/user-attachments/assets/7178b3d2-2613-47fc-b794-4b39fe96d95d" />
<img width="1920" alt="Slide 16_9 - 16" src="https://github.com/user-attachments/assets/969c9d60-90fb-422f-a447-002331a0cf77" />
<img width="1920" alt="Slide 16_9 - 17" src="https://github.com/user-attachments/assets/eebe657c-8f51-4a14-b170-96b49913832f" />

## 实现功能点

- **AI 聊天助手**：基于大模型，支持自然语言行程规划与旅行问答。
- **地图打卡与种草**：Mapbox 地图，支持 marker 交互、打卡、拔草、全局状态同步。
- **评论聚合**：优先拉取 Google Maps 评论，无则自动切换 Yelp，弹窗美观、移动端友好。
- **天气提醒**：集成 WeatherAPI，支持自动定位和多城市天气气泡提醒。
- **旅程 Markdown 渲染**：AI 生成行程以 Markdown 格式美观展示，支持复制与分享。
- **小红书笔记推荐**：AI 自动关联景点与小红书优质内容，提升种草体验。
- **用户行为埋点**：自动收集点击、页面、元素、IP、地理位置等，支持后续热力图与数据分析。
- **移动端适配与美化**：所有核心交互均适配移动端，细节美化，提升用户体验。
- **无警告构建**：严格消除所有类型、依赖、未用变量等警告，保证代码质量。

---

## 技术架构

- **前端框架**：Next.js 15 + React 18 + TypeScript
- **地图服务**：Mapbox GL JS
- **AI 能力**：OpenAI API / 自研大模型接口
- **评论聚合**：SerpApi（Google/Yelp Reviews）
- **天气服务**：WeatherAPI
- **数据存储**：Firebase Firestore（用户行为埋点、热力图数据）
- **样式与 UI**：Tailwind CSS + 自定义 CSS + 手写体字体
- **自动埋点**：前端全局监听，自动采集用户行为与地理信息
- **部署**：Vercel 一键部署

---

## 快速体验

- **在线体验**：[https://touch-that-grass.vercel.app/](https://touch-that-grass.vercel.app/)

---

## 版权声明

```
Copyrights belongs to Cory Yihua Li
```
本项目仅用于学习与技术交流，部分数据接口和内容仅供演示，禁止用于商业用途。

---

如需更多技术细节、产品方案或数据分析脚本，欢迎 Issue 或 PR！

## 📄 License

This project is licensed under a **Creative Concept Protection License** by **Yihua Li (Cory)**.

### 🎯 About This Project

This project started from my original idea and creative vision. While some implementation used AI assistance, the core concept, design decisions, and creative direction are entirely my own work.

### 🔒 Usage Rights

- ✅ **Personal Use**: Feel free to study, learn, and experiment
- ✅ **Educational Use**: Perfect for learning and research
- ✅ **Modifications**: You can modify for personal projects
- ✅ **Sharing**: Share with proper attribution
- ❌ **Commercial Use**: Prohibited without permission
- ❌ **Selling**: Cannot sell or profit from this work

### 💡 Development Approach

- **Original Concept**: Creative vision and user experience design by Yihua Li (Cory)
- **AI Assistance**: Some code generation under human creative direction  
- **Manual Refinement**: Human optimization and improvements
- **Documentation**: All explanations and docs are human-written

### 📧 Contact

For commercial licensing inquiries: cory958014884@gmail.com

---

**© 2025 Yihua Li (Cory). Original concepts and creative direction protected.**
