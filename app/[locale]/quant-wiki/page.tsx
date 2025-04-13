"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Spin } from "antd";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import styles from "@/src/css/quant-wiki.module.css";

interface Article {
  id: string;
  title: string;
  content: string;
}

interface Category {
  id: string;
  name: string;
  articles: Article[];
  subcategories?: Category[];
}

const CategoryItem: React.FC<{
  category: Category;
  selectedArticleId: string | null;
  onSelectArticle: (article: Article) => void;
}> = ({ category, selectedArticleId, onSelectArticle }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.categoryItem}>
      <div className={styles.categoryHeader} onClick={() => setIsOpen(!isOpen)}>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
          ▶
        </span>
        <span className={styles.categoryName}>{category.name}</span>
      </div>
      {isOpen && (
        <div className={styles.categoryContent}>
          {category.articles.map((article) => (
            <div
              key={article.id}
              className={`${styles.article} ${selectedArticleId === article.id ? styles.active : ""}`}
              onClick={() => onSelectArticle(article)}
            >
              {article.title}
            </div>
          ))}
          {category.subcategories?.map((subcat) => (
            <CategoryItem
              key={subcat.id}
              category={subcat}
              selectedArticleId={selectedArticleId}
              onSelectArticle={onSelectArticle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const mockCategories: Category[] = [
  {
    id: "basics",
    name: "基础知识",
    articles: [
      {
        id: "intro",
        title: "量化交易简介",
        content: `
# 量化交易简介

量化交易是一种使用数学模型和计算机算法进行交易的方法。它通过系统化的方式分析市场数据，寻找交易机会。

## 主要特点

1. 系统化
2. 自动化
3. 数据驱动

## 基本概念

量化交易涉及多个重要概念：

- Alpha：超额收益
- Beta：市场风险
- Sharpe比率：风险调整后收益

## 数学基础

夏普比率的计算公式：

$$ Sharpe = \\frac{R_p - R_f}{\\sigma_p} $$

其中：
- $R_p$ 是投资组合收益率
- $R_f$ 是无风险利率
- $\\sigma_p$ 是投资组合的标准差

## 应用示例

一个简单的动量策略可以表示为：

$$ Position = Sign(Price_t - Price_{t-1}) $$

这表示根据价格变动方向来决定持仓方向。
`,
      },
      {
        id: "terms",
        title: "基本术语",
        content: "# 基本术语\n\n这里是基本术语的内容...",
      },
    ],
  },
  {
    id: "strategies",
    name: "交易策略",
    articles: [
      {
        id: "momentum",
        title: "动量策略",
        content: "# 动量策略\n\n这里是动量策略的内容...",
      },
      {
        id: "mean-reversion",
        title: "均值回归",
        content: "# 均值回归\n\n这里是均值回归的内容...",
      },
    ],
  },
  {
    id: "math",
    name: "数学基础",
    articles: [
      {
        id: "statistics",
        title: "统计学基础",
        content: "# 统计学基础\n\n这里是统计学基础的内容...",
      },
      {
        id: "probability",
        title: "概率论",
        content: "# 概率论\n\n这里是概率论的内容...",
      },
    ],
  },
  {
    id: "tools",
    name: "技术工具",
    articles: [
      {
        id: "python",
        title: "Python基础",
        content: "# Python基础\n\n这里是Python基础的内容...",
      },
      {
        id: "pandas",
        title: "Pandas使用",
        content: "# Pandas使用\n\n这里是Pandas使用的内容...",
      },
    ],
  },
];

const QuantWiki: React.FC = () => {
  const t = useTranslations("quant-wiki");
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    // 模拟加载
    setTimeout(() => {
      setLoading(false);
      // 默认选择第一篇文章
      if (mockCategories[0]?.articles[0]) {
        setSelectedArticle(mockCategories[0].articles[0]);
      }
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1 className={styles.title}>{t("title")}</h1>
        <div className={styles.categories}>
          {mockCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              selectedArticleId={selectedArticle?.id || null}
              onSelectArticle={setSelectedArticle}
            />
          ))}
        </div>
      </div>
      <div className={styles.mainContent}>
        {selectedArticle ? (
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {selectedArticle.content}
          </ReactMarkdown>
        ) : (
          <div className={styles.placeholder}>请选择一篇文章</div>
        )}
      </div>
    </div>
  );
};

export default QuantWiki;
