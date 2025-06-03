"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Spin, Alert, BackTop } from "antd";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useParams } from "next/navigation";
import { RightOutlined, UpOutlined } from "@ant-design/icons";
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
  if (!Array.isArray(categories)) {
    console.warn(
      "filterCategoriesWithArticles: categories is not an array",
      categories,
    );
    return [];
  }

  return categories
    .filter((cat) => cat && typeof cat === "object" && cat._id) // 首先过滤无效对象
    .map((cat) => {
      const filteredChildren =
        cat.children && Array.isArray(cat.children)
          ? filterCategoriesWithArticles(cat.children)
          : [];
      const hasArticles =
        cat.articles && Array.isArray(cat.articles) && cat.articles.length > 0;

      if (hasArticles || filteredChildren.length > 0) {
        return {
          ...cat,
          children: filteredChildren,
          articles: cat.articles || [], // 确保 articles 是数组
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

  // 安全检查：确保 category 对象有效
  if (!category || typeof category !== "object" || !category._id) {
    console.warn("CategoryItem: Invalid category object", category);
    return null;
  }

  const safeArticles = Array.isArray(category.articles)
    ? category.articles
    : [];
  const safeChildren = Array.isArray(category.children)
    ? category.children
    : [];

  return (
    <div className={styles.categoryItem}>
      <div className={styles.categoryHeader} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.categoryName}>
          {locale === "en"
            ? category.enTitle || category.title
            : category.title}
        </span>
        <span
          className={`${(styles as any).arrow} ${isOpen ? (styles as any).open : ""}`}
        >
          <RightOutlined />
        </span>
      </div>
      {/* Always render the content, but control visibility with CSS classes */}
      <div
        className={`${styles.categoryContent} ${isOpen ? (styles as any).open : ""}`}
      >
        {safeArticles.map((article) => {
          // 安全检查：确保 article 对象有效
          if (!article || !article._id) {
            console.warn("CategoryItem: Invalid article object", article);
            return null;
          }

          return (
            <div
              key={article._id}
              className={`${(styles as any).article} ${
                selectedArticleId === article._id ? (styles as any).active : ""
              }`}
              onClick={() => onSelectArticle(article)}
            >
              {locale === "en"
                ? article.enTitle || article.title
                : article.title}
            </div>
          );
        })}
        {safeChildren.map((subcat) => {
          // 安全检查：确保 subcat 对象有效
          if (!subcat || !subcat._id) {
            console.warn("CategoryItem: Invalid subcategory object", subcat);
            return null;
          }

          return (
            <CategoryItem
              key={subcat._id}
              category={subcat}
              selectedArticleId={selectedArticleId}
              onSelectArticle={onSelectArticle}
              locale={locale}
            />
          );
        })}
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
  const [showBackTop, setShowBackTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const scrollTop = contentRef.current.scrollTop;
      console.log("Scroll position:", scrollTop); // 调试日志

      // 简单判断: 滚动超过100px就显示按钮
      setShowBackTop(scrollTop > 100);
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      // 初始检查
      handleScroll();
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

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

        // 检查分类数据是否有效
        if (!Array.isArray(categoryData.data)) {
          throw new Error("Invalid category data format");
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

        // 检查文章数据是否有效
        if (!articleData.data || !Array.isArray(articleData.data.list)) {
          throw new Error("Invalid article data format");
        }

        // 将文章数据整合到分类中
        const categoriesWithArticles = categoryData.data
          .map((category: WikiCategory) => {
            // 确保 category 对象有效
            if (!category || typeof category !== "object" || !category._id) {
              console.warn("Invalid category object:", category);
              return null;
            }

            const categoryArticles = articleData.data.list.filter(
              (article: WikiArticle) =>
                article && article.category === category._id,
            );
            console.log(
              `Category ${category.title} has ${categoryArticles.length} articles`,
            );
            return {
              ...category,
              articles: categoryArticles || [],
              children: Array.isArray(category.children)
                ? category.children
                : [],
            };
          })
          .filter(Boolean) as WikiCategory[]; // 过滤掉无效的分类

        // 过滤只保留有文章的分类
        const filteredCategories = filterCategoriesWithArticles(
          categoriesWithArticles,
        );

        // 确保至少有一些数据
        if (!filteredCategories || filteredCategories.length === 0) {
          console.warn("No valid categories found");
          setCategories([]);
          setSelectedArticle(null);
          return;
        }

        setCategories(filteredCategories);

        console.log(filteredCategories);
        // 默认选择第一篇文章 - 改进的逻辑
        let firstArticle: WikiArticle | null = null;

        // 首先尝试从第一个分类的文章中选择
        if (filteredCategories[0]?.articles?.[0]) {
          firstArticle = filteredCategories[0].articles[0];
        }
        // 如果第一个分类没有直接的文章，尝试从子分类中选择
        else if (filteredCategories[0]?.children?.[0]?.articles?.[0]) {
          firstArticle = filteredCategories[0].children[0].articles[0];
        }
        // 如果还是没有，遍历所有分类查找第一篇文章
        else {
          for (const category of filteredCategories) {
            if (category?.articles?.[0]) {
              firstArticle = category.articles[0];
              break;
            }
            if (category?.children && Array.isArray(category.children)) {
              for (const subCategory of category.children) {
                if (subCategory?.articles?.[0]) {
                  firstArticle = subCategory.articles[0];
                  break;
                }
              }
              if (firstArticle) break;
            }
          }
        }

        if (firstArticle) {
          setSelectedArticle(firstArticle);
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
        <div className={styles.content} ref={contentRef}>
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

        {/* Back to top button */}
        {showBackTop && (
          <BackTop target={() => contentRef.current || window}>
            <div className={styles.backTopBtn}>
              <UpOutlined />
            </div>
          </BackTop>
        )}
      </div>
    </div>
  );
};

export default Wiki;
