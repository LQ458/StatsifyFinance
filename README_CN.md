# 🏛️ StatsifyFinance

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.15.0-green)](https://www.mongodb.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-orange)](https://deepseek.com/)
[![License](https://img.shields.io/badge/License-Apache--2.0-red)](LICENSE)

> 🚀 **StatsifyFinance** 是一个全栈金融分析平台，集成了人工智能、可视化分析和教育资源。为初学者和专业投资者提供全面的金融工具和学习资源。

## ✨ 核心特色

### 🤖 智能 AI 助手

- **多模态分析**: 支持文本、图片截图的智能分析
- **实时对话**: 基于 DeepSeek API 的流式响应
- **专业领域**: 专注金融分析和投资咨询
- **多语言支持**: 中英文双语智能切换
- **聊天历史**: 用户对话记录保存与管理

### 📊 分析工具中心

- **定量分析**: 盈利能力、流动性、偿债能力、运营效率、成长能力、估值水平
- **定性分析**: 管理质量、品牌价值、市场竞争力等非财务因素评估
- **截图分析**: 智能识别金融图表和数据，提供专业解读
- **文本分析**: OCR 文字识别 + AI 语义分析

### 📈 策略研究中心

- **交易策略**: 详细的量化交易方法论和实战案例
- **投资者档案**: 著名投资者的投资理念和策略分析
- **风险管理**: 系统性风险控制方法和行业风险评估
- **行业分类**: 14 大行业深度分析

### 📚 知识资源库

- **金融百科**: 量化投资知识体系，支持数学公式渲染
- **术语词典**: 金融专业术语详细解释和案例说明
- **市场资讯**: 实时更新的行业动态和趋势分析
- **全站搜索**: 智能检索系统，快速定位相关内容

## 🛠️ 技术架构

### 前端技术栈

```bash
# 核心框架
Next.js 14.2.16          # React全栈框架
TypeScript 5.0           # 类型系统
Tailwind CSS 3.4.1      # 原子化CSS框架

# UI组件库
Ant Design 5.22.1       # 企业级UI组件
@ant-design/icons        # 图标库
react-icons 5.2.1        # 补充图标

# 数据可视化
ECharts 5.5.1           # 图表库
Swiper 11.1.9           # 轮播组件

# 内容渲染
@wangeditor/editor       # 富文本编辑器
react-markdown 9.0.1     # Markdown渲染
rehype-katex 7.0.1       # 数学公式渲染
react-syntax-highlighter # 代码高亮

# 功能增强
html2canvas 1.4.1        # 截图功能
next-intl 3.26.2         # 国际化
next-auth 4.24.7         # 身份认证
zustand 5.0.3            # 状态管理
```

### 后端技术栈

```bash
# 数据库
MongoDB 6.15.0           # 文档数据库
Mongoose 8.5.2           # ODM对象建模

# AI服务
DeepSeek API             # 大语言模型
Baidu AIP SDK 4.16.16    # 百度AI平台(OCR)
LangChain 0.3.11         # AI应用框架

# 其他服务
@sentry/nextjs           # 错误监控
@vercel/analytics        # 数据分析
```

### 项目结构

```
├── app/                     # Next.js App Router
│   ├── [locale]/           # 国际化路由
│   │   ├── analysis/       # 分析工具页面
│   │   ├── strategy/       # 策略中心页面
│   │   ├── wiki/          # 金融百科页面
│   │   ├── articles/      # 资讯文章页面
│   │   └── admin/         # 管理后台页面
│   ├── api/               # API路由
│   │   ├── chat/          # AI对话接口
│   │   ├── analyze-image/ # 图片分析接口
│   │   ├── analyze-text/  # 文本分析接口
│   │   └── admin/         # 管理接口
│   └── globals.css        # 全局样式
├── components/            # 公共组件
│   ├── aiChat.tsx        # AI聊天组件
│   ├── ScreenCapture.tsx # 截图功能组件
│   ├── topbar.tsx        # 顶部导航
│   └── footer.tsx        # 底部组件
├── models/               # 数据模型
│   ├── user.ts          # 用户模型
│   ├── chat.ts          # 聊天记录模型
│   ├── articles.ts      # 文章模型
│   └── wiki-articles.ts # 百科文章模型
├── libs/                # 工具库
│   └── mongodb.ts       # 数据库连接
├── i18n/                # 国际化配置
│   ├── locales.ts       # 语言配置
│   └── navigation.ts    # 路由配置
├── messages/            # 多语言文件
│   ├── zh.json         # 中文
│   └── en.json         # 英文
└── middleware.ts        # 中间件配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐)
- MongoDB >= 6.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/LQ458/StatsifyFinance.git
cd StatsifyFinance

# 安装依赖 (推荐使用pnpm)
pnpm install

# 或使用npm
npm install

# 或使用yarn
yarn install
```

### 环境配置

```bash
# 复制环境变量文件
cp .env.example .env.local

# 配置环境变量
MONGODB_URI=mongodb://localhost:27017/statsify
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:8810

# AI服务配置
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_ALT_BASE_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_ALT_API_KEY=your-deepseek-alt-api-key
DEEPSEEK_ALT_MODEL=deepseek-ai/DeepSeek-V3

# 百度AI配置 (OCR功能)
BAIDU_APP_ID=your-baidu-app-id
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key
```

### 启动项目

```bash
# 开发模式
pnpm dev          # 启动在 http://localhost:8810
npm run dev
yarn dev

# 生产构建
pnpm build        # 构建生产版本
npm run build
yarn build

# 生产启动
pnpm start        # 启动生产服务器
npm start
yarn start
```

### 开发工具

```bash
# 代码格式化
pnpm format       # 使用Prettier格式化代码
npm run format

# 代码检查
pnpm lint         # ESLint代码检查
npm run lint

# 初始化向量数据
pnpm init-vectors # 初始化AI向量数据
npm run init-vectors
```

## 📋 功能详解

### 🤖 AI 智能助手

- **智能对话**: 支持金融领域专业问答
- **截图分析**: 实时截图并 AI 解读图表数据
- **文本分析**: OCR 识别 + 智能语义分析
- **多语言**: 自动检测并适配中英文响应
- **流式响应**: 实时打字机效果显示
- **历史记录**: 登录用户对话历史保存

### 📊 数据分析工具

- **定量指标**: 6 大类财务指标深度分析
- **定性评估**: 企业软实力综合评价
- **可视化图表**: ECharts 动态图表展示
- **数据导出**: 支持分析结果导出

### 📈 投资策略研究

- **策略库**: 经典投资策略详解
- **案例分析**: 实战案例深度解读
- **风险评估**: 多维度风险控制模型
- **投资者画像**: 知名投资者策略研究

### 📚 知识管理系统

- **分类体系**: 结构化知识分类管理
- **搜索引擎**: 全文检索 + 语义搜索
- **公式渲染**: LaTeX 数学公式支持
- **版本控制**: 内容版本管理和更新追踪

## 🌐 国际化支持

项目支持中英文双语:

- 路由层级: `/zh/...` 和 `/en/...`
- 界面语言: 自动检测用户偏好
- 内容本地化: 文章和术语双语版本
- AI 响应: 智能语言适配

## 🔐 用户系统

### 认证方式

- NextAuth.js 集成
- 支持邮箱密码登录
- 访客模式限制对话次数
- 管理员权限系统

### 权限管理

- **访客用户**: 限制 AI 对话次数(3 次)
- **注册用户**: 无限对话 + 历史记录
- **管理员**: 内容管理 + 数据统计

## 🎯 特色功能

### 📸 智能截图分析

```typescript
// 截图功能实现
import ScreenCapture from "@/components/ScreenCapture";

<ScreenCapture
  onCapture={handleImageAnalysis}
  isSelecting={isScreenshotting}
  onQuestionSelected={() => setIsOpen(true)}
/>;
```

### 🧮 数学公式渲染

```markdown
支持 LaTeX 语法:
$$\text{ROE} = \frac{\text{净利润}}{\text{股东权益}} \times 100\%$$
```

### 🔍 全文搜索

```typescript
// 搜索功能
const searchResults = await fetch("/api/search", {
  method: "POST",
  body: JSON.stringify({ query: searchTerm }),
});
```

## 📦 部署指南

### Vercel 部署

```bash
# 连接Vercel
npx vercel

# 配置环境变量
vercel env add MONGODB_URI
vercel env add DEEPSEEK_API_KEY
# ... 其他环境变量
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 开发流程

```bash
# 1. Fork 项目
# 2. 创建功能分支
git checkout -b feature/amazing-feature

# 3. 提交更改
git commit -m 'Add amazing feature'

# 4. 推送分支
git push origin feature/amazing-feature

# 5. 创建 Pull Request
```

### 贡献类型

- 🐛 Bug 修复
- ✨ 新功能开发
- 📝 文档改进
- 🎨 UI/UX 优化
- 🔧 性能优化
- 🌐 多语言翻译

## 📄 开源协议

本项目采用 [Apache-2.0](LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目的支持:

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Ant Design](https://ant.design/) - 企业级 UI 组件库
- [MongoDB](https://www.mongodb.com/) - 文档数据库
- [DeepSeek](https://deepseek.com/) - AI 大语言模型
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架

## 📞 联系方式

- 项目地址: [https://github.com/LQ458/StatsifyFinance](https://github.com/LQ458/StatsifyFinance)
- 问题反馈: [Issues](https://github.com/LQ458/StatsifyFinance/issues)
- 讨论交流: [Discussions](https://github.com/LQ458/StatsifyFinance/discussions)

[📖 English Documentation](README.md) | [🌐 网址](https://statsifyfinance.com/)

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给我们一个 Star! 🌟**

[![Star History Chart](https://api.star-history.com/svg?repos=LQ458/StatsifyFinance&type=Date)](https://star-history.com/#LQ458/StatsifyFinance&Date)

</div>
