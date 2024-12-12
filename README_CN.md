## 简介

StatsifyFinance 是一个面向初学者和专业人士的综合性金融工具网站。该平台提供了丰富的金融分析工具、交易策略指南以及专业的金融教育资源。

## 主要功能

### 分析工具

- 定性分析：提供经济概念的全面解释和案例研究
- 定量分析：深入探讨量化经济概念和应用实例

### 策略中心

- 交易策略：详细的交易方法论和实践案例
- 投资者档案：不同类型投资者的特点和投资方法
- 风险管理：系统的风险控制方法和行业分析

### 资源中心

- 金融文章：及时更新的行业动态和趋势分析
- 搜索功能：便捷的全站内容检索系统
- 金融术语库：专业术语的详细解释和定义

## 技术架构

### 核心技术栈

```
- Next.js：React框架
- Tailwind CSS：样式框架
- Antd UI：UI组件库
- Echarts：图表可视化
- MongoDB：数据库
- Next Auth：认证系统
- TypeScript：类型系统
- @wangeditor/editor：网页编辑器
- Swiper：触控滑块
```

### 项目结构

```
├── app/                # Next.js应用主目录
│   ├── pages/         # 页面路由
│   ├── api/          # API路由
│   └── components/   # 页面组件
├── components/        # 共享组件
│   ├── ui/           # UI组件
│   └── business/     # 业务组件
├── models/           # MongoDB数据模型
├── libs/            # 数据库连接
└── src/             # 网页数据和样式文件
```

## 开始使用

```bash
# 克隆项目
git clone https://github.com/LQ458/StatsifyFinance.git

# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 贡献指南

欢迎提交问题和合并请求。对于重大更改，请先开启issue讨论您想要改变的内容。

## 许可证

本项目采用 MIT 许可证
