"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Spin, Alert } from "antd";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useParams } from "next/navigation";
import { RightOutlined } from "@ant-design/icons";
import styles from "@/src/css/wiki.module.css";
import Topbar from "@/components/topbar";

interface WikiArticle {
  _id: string;
  title: string;
  enTitle: string;
  category: string;
  desc: string;
  enDesc: string;
  content: string;
  enContent: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface WikiCategory {
  _id: string;
  title: string;
  enTitle: string;
  articles: WikiArticle[];
  children?: WikiCategory[];
  parentId?: string;
}

interface ArticleListResponse {
  list: WikiArticle[];
  pages: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorMessage?: string;
}

// 递归过滤：只保留有文章或有子category有文章的分类
function filterCategoriesWithArticles(
  categories: WikiCategory[],
): WikiCategory[] {
  return categories
    .map((cat) => {
      const filteredChildren = cat.children
        ? filterCategoriesWithArticles(cat.children)
        : [];
      const hasArticles = cat.articles && cat.articles.length > 0;
      if (hasArticles || filteredChildren.length > 0) {
        return {
          ...cat,
          children: filteredChildren,
        };
      }
      return null;
    })
    .filter(Boolean) as WikiCategory[];
}

const CategoryItem: React.FC<{
  category: WikiCategory;
  selectedArticleId: string | null;
  onSelectArticle: (article: WikiArticle) => void;
  locale: string;
}> = ({ category, selectedArticleId, onSelectArticle, locale }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.categoryItem}>
      <div className={styles.categoryHeader} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.categoryName}>
          {locale === "en" ? category.enTitle : category.title}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
          <RightOutlined />
        </span>
      </div>
      {/* Always render the content, but control visibility with CSS classes */}
      <div className={`${styles.categoryContent} ${isOpen ? styles.open : ""}`}>
        {category.articles?.map((article) => (
          <div
            key={article._id}
            className={`${styles.article} ${
              selectedArticleId === article._id ? styles.active : ""
            }`}
            onClick={() => onSelectArticle(article)}
          >
            {locale === "en" ? article.enTitle : article.title}
          </div>
        ))}
        {category.children?.map((subcat) => (
          <CategoryItem
            key={subcat._id}
            category={subcat}
            selectedArticleId={selectedArticleId}
            onSelectArticle={onSelectArticle}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
};

// 添加公式处理函数
const processLatexFormulas = (text: string): string => {
  // 处理块级公式
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, "$$$1$$");

  // 处理行内公式
  text = text.replace(/\\\((.*?)\\\)/g, "$$$1$$");

  return text;
};

const Wiki: React.FC = () => {
  const t = useTranslations("wiki");
  const params = useParams();
  const locale = params.locale as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(
    null,
  );
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        // 获取分类数据
        const categoryRes = await fetch("/api/wiki-category");
        if (!categoryRes.ok) {
          throw new Error(
            `Failed to fetch categories: ${categoryRes.statusText}`,
          );
        }
        const categoryData: ApiResponse<WikiCategory[]> =
          await categoryRes.json();

        if (!categoryData.success) {
          throw new Error(
            categoryData.errorMessage || "Failed to fetch categories",
          );
        }

        // 获取文章数据
        const articleRes = await fetch("/api/wiki");
        if (!articleRes.ok) {
          throw new Error(`Failed to fetch articles: ${articleRes.statusText}`);
        }
        const articleData: ApiResponse<ArticleListResponse> =
          await articleRes.json();

        if (!articleData.success) {
          throw new Error(
            articleData.errorMessage || "Failed to fetch articles",
          );
        }

        // 将文章数据整合到分类中
        const categoriesWithArticles = categoryData.data.map(
          (category: WikiCategory) => {
            const categoryArticles = articleData.data.list.filter(
              (article: WikiArticle) => article.category === category._id,
            );
            console.log(
              `Category ${category.title} has ${categoryArticles.length} articles`,
            );
            return {
              ...category,
              articles: categoryArticles,
            };
          },
        );

        // 过滤只保留有文章的分类
        const filteredCategories = filterCategoriesWithArticles(
          categoriesWithArticles,
        );

        setCategories(filteredCategories);

        console.log(filteredCategories);
        // 默认选择第一篇文章
        if (filteredCategories[0]?.articles?.[0]) {
          setSelectedArticle(filteredCategories[0].articles[0]);
        }
        if (filteredCategories[0].children?.[0].articles[0]) {
          setSelectedArticle(filteredCategories[0]?.children[0]?.articles[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const contentElement = document.querySelector(`.${styles.content}`);
      if (contentElement) {
        setShowBackToTop(contentElement.scrollTop > 300);
      }
    };

    const contentElement = document.querySelector(`.${styles.content}`);
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    const contentElement = document.querySelector(`.${styles.content}`);
    if (contentElement) {
      contentElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <>
        <Topbar position="relative" />
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Alert message={t("error")} description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="fixed w-full h-full">
      <Topbar position="relative" />
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.categories}>
            {categories.map((category) => (
              <CategoryItem
                key={category._id}
                category={category}
                selectedArticleId={selectedArticle?._id || null}
                onSelectArticle={setSelectedArticle}
                locale={locale}
              />
            ))}
          </div>
        </div>
        <div className={styles.content}>
          {selectedArticle && (
            <>
              <h1>
                {locale === "en"
                  ? selectedArticle.enTitle
                  : selectedArticle.title}
              </h1>
              {selectedArticle.image && (
                <img
                  src={selectedArticle.image}
                  alt={
                    locale === "en"
                      ? selectedArticle.enTitle
                      : selectedArticle.title
                  }
                  className={styles.articleImage}
                />
              )}
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[
                  [
                    rehypeKatex,
                    {
                      strict: false,
                      trust: true,
                      throwOnError: false,
                      displayMode: true,
                    },
                  ],
                ]}
              >
                {processLatexFormulas(
                  locale === "en"
                    ? selectedArticle.enContent
                    : selectedArticle.content,
                )}
              </ReactMarkdown>
            </>
          )}
        </div>
        {/* Reserved space for future table of contents */}
        <div className={styles.tocSpace}></div>
        {showBackToTop && (
          <div
            className={`${styles.backToTop} ${showBackToTop ? styles.visible : ""}`}
            onClick={scrollToTop}
            title="Back to top"
          >
            ↑
          </div>
        )}
      </div>
    </div>
  );
};

export default Wiki;
