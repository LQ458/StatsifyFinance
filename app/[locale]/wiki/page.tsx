"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Spin, Alert } from "antd";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useParams } from "next/navigation";
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
        <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
          ▶
        </span>
        <span className={styles.categoryName}>
          {locale === "en" ? category.enTitle : category.title}
        </span>
      </div>
      {isOpen && (
        <div className={styles.categoryContent}>
          {category.articles?.map((article) => (
            <div
              key={article._id}
              className={`${styles.article} ${selectedArticleId === article._id ? styles.active : ""}`}
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
      )}
    </div>
  );
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
          (category: WikiCategory) => ({
            ...category,
            articles: articleData.data.list.filter(
              (article: WikiArticle) => article.category === category._id,
            ),
          }),
        );

        // 过滤只保留有文章的分类
        const filteredCategories = filterCategoriesWithArticles(
          categoriesWithArticles,
        );
        setCategories(filteredCategories);

        // 默认选择第一篇文章
        if (filteredCategories[0]?.articles?.[0]) {
          setSelectedArticle(filteredCategories[0].articles[0]);
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
      <div className={styles.container}>
        <Spin size="large" />
      </div>
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
    <>
      <Topbar position="relative" />
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h1 className={styles.title}>{t("title")}</h1>
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
                rehypePlugins={[[rehypeKatex, { output: "html" }]]}
              >
                {locale === "en"
                  ? selectedArticle.enContent
                  : selectedArticle.content}
              </ReactMarkdown>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Wiki;
