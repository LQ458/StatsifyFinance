# 🏛️ StatsifyFinance

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.15.0-green)](https://www.mongodb.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-orange)](https://deepseek.com/)
[![License](https://img.shields.io/badge/License-Apache--2.0-red)](LICENSE)

> 🚀 **StatsifyFinance** is a comprehensive full-stack financial analysis platform that integrates artificial intelligence, visualization analysis, and educational resources. It provides comprehensive financial tools and learning resources for beginners and professional investors.

## ✨ Core Features

### 🤖 Intelligent AI Assistant

- **Multimodal Analysis**: Supports intelligent analysis of text and image screenshots
- **Real-time Conversation**: Streaming responses based on DeepSeek API
- **Professional Domain**: Focused on financial analysis and investment consulting
- **Multilingual Support**: Intelligent switching between Chinese and English
- **Chat History**: User conversation record saving and management

### 📊 Analysis Tools Center

- **Quantitative Analysis**: Profitability, liquidity, solvency, operational efficiency, growth capability, valuation level
- **Qualitative Analysis**: Assessment of non-financial factors such as management quality, brand value, and market competitiveness
- **Screenshot Analysis**: Intelligent recognition of financial charts and data with professional interpretation
- **Text Analysis**: OCR text recognition + AI semantic analysis

### 📈 Strategy Research Center

- **Trading Strategies**: Detailed quantitative trading methodologies and practical cases
- **Investor Profiles**: Investment philosophies and strategy analysis of famous investors
- **Risk Management**: Systematic risk control methods and industry risk assessment
- **Industry Classification**: In-depth analysis of 14 major industries

### 📚 Knowledge Resource Library

- **Financial Encyclopedia**: Quantitative investment knowledge system with mathematical formula rendering support
- **Terminology Dictionary**: Detailed explanations and case studies of financial professional terms
- **Market News**: Real-time updates of industry dynamics and trend analysis
- **Site-wide Search**: Intelligent retrieval system for quick content location

## 🛠️ Technical Architecture

### Frontend Technology Stack

```bash
# Core Framework
Next.js 14.2.16          # React full-stack framework
TypeScript 5.0           # Type system
Tailwind CSS 3.4.1      # Atomic CSS framework

# UI Component Library
Ant Design 5.22.1       # Enterprise-grade UI components
@ant-design/icons        # Icon library
react-icons 5.2.1        # Supplementary icons

# Data Visualization
ECharts 5.5.1           # Chart library
Swiper 11.1.9           # Carousel component

# Content Rendering
@wangeditor/editor       # Rich text editor
react-markdown 9.0.1     # Markdown rendering
rehype-katex 7.0.1       # Mathematical formula rendering
react-syntax-highlighter # Code highlighting

# Feature Enhancement
html2canvas 1.4.1        # Screenshot functionality
next-intl 3.26.2         # Internationalization
next-auth 4.24.7         # Authentication
zustand 5.0.3            # State management
```

### Backend Technology Stack

```bash
# Database
MongoDB 6.15.0           # Document database
Mongoose 8.5.2           # ODM object modeling

# AI Services
DeepSeek API             # Large language model
Baidu AIP SDK 4.16.16    # Baidu AI platform (OCR)
LangChain 0.3.11         # AI application framework

# Other Services
@sentry/nextjs           # Error monitoring
@vercel/analytics        # Data analytics
```

### Project Structure

```
├── app/                     # Next.js App Router
│   ├── [locale]/           # Internationalization routes
│   │   ├── analysis/       # Analysis tool pages
│   │   ├── strategy/       # Strategy center pages
│   │   ├── wiki/          # Financial encyclopedia pages
│   │   ├── articles/      # News article pages
│   │   └── admin/         # Admin backend pages
│   ├── api/               # API routes
│   │   ├── chat/          # AI conversation interface
│   │   ├── analyze-image/ # Image analysis interface
│   │   ├── analyze-text/  # Text analysis interface
│   │   └── admin/         # Management interface
│   └── globals.css        # Global styles
├── components/            # Common components
│   ├── aiChat.tsx        # AI chat component
│   ├── ScreenCapture.tsx # Screenshot functionality component
│   ├── topbar.tsx        # Top navigation
│   └── footer.tsx        # Footer component
├── models/               # Data models
│   ├── user.ts          # User model
│   ├── chat.ts          # Chat record model
│   ├── articles.ts      # Article model
│   └── wiki-articles.ts # Encyclopedia article model
├── libs/                # Utility libraries
│   └── mongodb.ts       # Database connection
├── i18n/                # Internationalization configuration
│   ├── locales.ts       # Language configuration
│   └── navigation.ts    # Route configuration
├── messages/            # Multilingual files
│   ├── zh.json         # Chinese
│   └── en.json         # English
└── middleware.ts        # Middleware configuration
```

## 🚀 Quick Start

### Environment Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (recommended)
- MongoDB >= 6.0

### Install Dependencies

```bash
# Clone the project
git clone https://github.com/LQ458/StatsifyFinance.git
cd StatsifyFinance

# Install dependencies (recommended using pnpm)
pnpm install

# Or use npm
npm install

# Or use yarn
yarn install
```

### Environment Configuration

```bash
# Copy environment variables file
cp .env.example .env.local

# Configure environment variables
MONGODB_URI=mongodb://localhost:27017/statsify
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:8810

# AI service configuration
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_ALT_BASE_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_ALT_API_KEY=your-deepseek-alt-api-key
DEEPSEEK_ALT_MODEL=deepseek-ai/DeepSeek-V3

# Baidu AI configuration (OCR functionality)
BAIDU_APP_ID=your-baidu-app-id
BAIDU_API_KEY=your-baidu-api-key
BAIDU_SECRET_KEY=your-baidu-secret-key
```

### Start the Project

```bash
# Development mode
pnpm dev          # Start at http://localhost:8810
npm run dev
yarn dev

# Production build
pnpm build        # Build production version
npm run build
yarn build

# Production start
pnpm start        # Start production server
npm start
yarn start
```

### Development Tools

```bash
# Code formatting
pnpm format       # Format code using Prettier
npm run format

# Code linting
pnpm lint         # ESLint code checking
npm run lint

# Initialize vector data
pnpm init-vectors # Initialize AI vector data
npm run init-vectors
```

## 📋 Feature Details

### 🤖 AI Intelligent Assistant

- **Intelligent Conversation**: Supports professional Q&A in the financial domain
- **Screenshot Analysis**: Real-time screenshot and AI interpretation of chart data
- **Text Analysis**: OCR recognition + intelligent semantic analysis
- **Multilingual**: Automatic detection and adaptation of Chinese/English responses
- **Streaming Response**: Real-time typewriter effect display
- **History Records**: Conversation history saving for logged-in users

### 📊 Data Analysis Tools

- **Quantitative Indicators**: In-depth analysis of 6 major categories of financial indicators
- **Qualitative Assessment**: Comprehensive evaluation of enterprise soft power
- **Visualization Charts**: Dynamic chart display with ECharts
- **Data Export**: Support for analysis result export

### 📈 Investment Strategy Research

- **Strategy Library**: Detailed explanations of classic investment strategies
- **Case Analysis**: In-depth interpretation of practical cases
- **Risk Assessment**: Multi-dimensional risk control models
- **Investor Profiles**: Strategy research of renowned investors

### 📚 Knowledge Management System

- **Classification System**: Structured knowledge classification management
- **Search Engine**: Full-text search + semantic search
- **Formula Rendering**: LaTeX mathematical formula support
- **Version Control**: Content version management and update tracking

## 🌐 Internationalization Support

The project supports bilingual Chinese and English:

- Route hierarchy: `/zh/...` and `/en/...`
- Interface language: Automatic detection of user preferences
- Content localization: Bilingual versions of articles and terms
- AI responses: Intelligent language adaptation

## 🔐 User System

### Authentication Methods

- NextAuth.js integration
- Email and password login support
- Guest mode with limited conversation count
- Administrator permission system

### Permission Management

- **Guest Users**: Limited AI conversation count (3 times)
- **Registered Users**: Unlimited conversations + history records
- **Administrators**: Content management + data statistics

## 🎯 Featured Functions

### 📸 Intelligent Screenshot Analysis

```typescript
// Screenshot functionality implementation
import ScreenCapture from "@/components/ScreenCapture";

<ScreenCapture
  onCapture={handleImageAnalysis}
  isSelecting={isScreenshotting}
  onQuestionSelected={() => setIsOpen(true)}
/>;
```

### 🧮 Mathematical Formula Rendering

```markdown
Supports LaTeX syntax:
$$\text{ROE} = \frac{\text{Net Income}}{\text{Shareholders' Equity}} \times 100\%$$
```

### 🔍 Full-text Search

```typescript
// Search functionality
const searchResults = await fetch("/api/search", {
  method: "POST",
  body: JSON.stringify({ query: searchTerm }),
});
```

## 📦 Deployment Guide

### Vercel Deployment

```bash
# Connect to Vercel
npx vercel

# Configure environment variables
vercel env add MONGODB_URI
vercel env add DEEPSEEK_API_KEY
# ... other environment variables
```

### Docker Deployment

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

## 🤝 Contributing Guide

We welcome all forms of contributions!

### Development Workflow

```bash
# 1. Fork the project
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Commit changes
git commit -m 'Add amazing feature'

# 4. Push branch
git push origin feature/amazing-feature

# 5. Create Pull Request
```

### Contribution Types

- 🐛 Bug fixes
- ✨ New feature development
- 📝 Documentation improvements
- 🎨 UI/UX optimization
- 🔧 Performance optimization
- 🌐 Multilingual translation

## 📄 Open Source License

This project is licensed under the [Apache-2.0](LICENSE) open source license.

## 🙏 Acknowledgments

Thanks to the following open source projects for their support:

- [Next.js](https://nextjs.org/) - React full-stack framework
- [Ant Design](https://ant.design/) - Enterprise-grade UI component library
- [MongoDB](https://www.mongodb.com/) - Document database
- [DeepSeek](https://deepseek.com/) - AI large language model
- [Tailwind CSS](https://tailwindcss.com/) - Atomic CSS framework

## 📞 Contact Information

- Project Repository: [https://github.com/LQ458/StatsifyFinance](https://github.com/LQ458/StatsifyFinance)
- Issue Feedback: [Issues](https://github.com/LQ458/StatsifyFinance/issues)
- Discussion Forum: [Discussions](https://github.com/LQ458/StatsifyFinance/discussions)

[📖 中文文档](README_CN.md) | [🌐 Website](https://statsifyfinance.com/)

---

<div align="center">

**🌟 If this project helps you, please give us a Star! 🌟**

[![Star History Chart](https://api.star-history.com/svg?repos=LQ458/StatsifyFinance&type=Date)](https://star-history.com/#LQ458/StatsifyFinance&Date)

</div>
