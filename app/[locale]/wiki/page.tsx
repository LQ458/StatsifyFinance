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
  activeArticleId: string | null;
  onSelectCategory: (category: WikiCategory) => void;
  onArticleClick: (articleId: string) => void;
  selectedCategoryId: string | null;
  locale: string;
}> = ({
  category,
  activeArticleId,
  onSelectCategory,
  onArticleClick,
  selectedCategoryId,
  locale,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedCategoryId === category._id;

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

  const handleCategoryClick = () => {
    setIsOpen(!isOpen);
    if (safeArticles.length > 0) {
      onSelectCategory(category);
    }
  };

  return (
    <div className={styles.categoryItem}>
      <div
        className={`${styles.categoryHeader} ${isSelected ? "wiki_active__9z_TX" : ""}`}
        onClick={handleCategoryClick}
      >
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
                activeArticleId === article._id ? (styles as any).active : ""
              }`}
              onClick={() => onArticleClick(article._id)}
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
              activeArticleId={activeArticleId}
              onSelectCategory={onSelectCategory}
              onArticleClick={onArticleClick}
              selectedCategoryId={selectedCategoryId}
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

// 收集所有文章的函数
const collectAllArticles = (categories: WikiCategory[]): WikiArticle[] => {
  const articles: WikiArticle[] = [];

  const traverse = (cats: WikiCategory[]) => {
    cats.forEach((cat) => {
      if (cat.articles) {
        articles.push(...cat.articles);
      }
      if (cat.children) {
        traverse(cat.children);
      }
    });
  };

  traverse(categories);
  return articles;
};

const Wiki: React.FC = () => {
  const t = useTranslations("wiki");
  const params = useParams();
  const locale = params.locale as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WikiCategory | null>(
    null,
  );
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [showBackTop, setShowBackTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const isChangingCategory = useRef(false); // 添加标志防止切换时的滚动干扰

  // 监听滚动事件，实现滚动高亮
  useEffect(() => {
    const handleScroll = () => {
      if (
        !contentRef.current ||
        !selectedCategory ||
        isChangingCategory.current
      )
        return;

      const scrollTop = contentRef.current.scrollTop + 100; // 添加偏移量
      setShowBackTop(scrollTop > 200);

      // 改进的滚动高亮逻辑
      const containerRect = contentRef.current.getBoundingClientRect();
      const articles = selectedCategory.articles;
      let currentActiveId = null;

      // 检查是否滚动到底部
      const isAtBottom =
        contentRef.current.scrollTop + contentRef.current.clientHeight >=
        contentRef.current.scrollHeight - 50;

      if (isAtBottom && articles.length > 0) {
        // 如果滚动到底部，高亮最后一个文章
        currentActiveId = articles[articles.length - 1]._id;
      } else {
        // 找到当前视口中最合适的文章进行高亮
        let bestArticle = null;
        let bestDistance = Infinity;

        for (const article of articles) {
          const element = articleRefs.current[article._id];
          if (element) {
            const rect = element.getBoundingClientRect();
            // 计算文章标题距离容器顶部的距离
            const distance = Math.abs(rect.top - containerRect.top - 100);

            // 如果文章在视口内且距离更近，则选择它
            if (
              rect.top <= containerRect.top + 300 &&
              distance < bestDistance
            ) {
              bestDistance = distance;
              bestArticle = article._id;
            }
          }
        }

        if (bestArticle) {
          currentActiveId = bestArticle;
        }
      }

      if (currentActiveId && currentActiveId !== activeArticleId) {
        setActiveArticleId(currentActiveId);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      // 初始检查
      if (!isChangingCategory.current) {
        handleScroll();
      }
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [selectedCategory, activeArticleId]);

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
          setSelectedCategory(null);
          return;
        }

        setCategories(filteredCategories);

        console.log(filteredCategories);
        // 默认选择第一个有文章的分类
        let firstCategory: WikiCategory | null = null;

        // 首先尝试从第一个分类选择
        if (filteredCategories[0]?.articles?.length > 0) {
          firstCategory = filteredCategories[0];
        }
        // 如果第一个分类没有直接的文章，尝试从子分类中选择
        else if (
          filteredCategories[0] &&
          filteredCategories[0].children &&
          filteredCategories[0].children[0] &&
          filteredCategories[0].children[0].articles?.length > 0
        ) {
          firstCategory = filteredCategories[0].children[0];
        }
        // 如果还是没有，遍历所有分类查找第一个有文章的分类
        else {
          for (const category of filteredCategories) {
            if (category?.articles?.length > 0) {
              firstCategory = category;
              break;
            }
            if (category?.children && Array.isArray(category.children)) {
              for (const subCategory of category.children) {
                if (subCategory?.articles?.length > 0) {
                  firstCategory = subCategory;
                  break;
                }
              }
              if (firstCategory) break;
            }
          }
        }

        if (firstCategory) {
          setSelectedCategory(firstCategory);
          if (firstCategory.articles.length > 0) {
            setActiveArticleId(firstCategory.articles[0]._id);
          }
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

  const handleCategorySelect = (category: WikiCategory) => {
    isChangingCategory.current = true; // 标记正在切换category
    setSelectedCategory(category);
    if (category.articles.length > 0) {
      setActiveArticleId(category.articles[0]._id);
      // 滚动到顶部
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0 }); // 移除动画
      }
    }
    // 延迟恢复滚动监听
    setTimeout(() => {
      isChangingCategory.current = false;
    }, 100); // 减少延迟
  };

  // 添加文章跳转功能
  const handleArticleClick = (articleId: string) => {
    // 首先找到包含这篇文章的category
    const findCategoryWithArticle = (
      cats: WikiCategory[],
      targetArticleId: string,
    ): WikiCategory | null => {
      for (const cat of cats) {
        // 检查当前category是否包含目标文章
        if (
          cat.articles &&
          cat.articles.some((article) => article._id === targetArticleId)
        ) {
          return cat;
        }
        // 递归检查子category
        if (cat.children) {
          const foundInChild = findCategoryWithArticle(
            cat.children,
            targetArticleId,
          );
          if (foundInChild) return foundInChild;
        }
      }
      return null;
    };

    const targetCategory = findCategoryWithArticle(categories, articleId);

    if (targetCategory) {
      // 如果目标文章不在当前选中的category中，先切换category
      if (!selectedCategory || selectedCategory._id !== targetCategory._id) {
        isChangingCategory.current = true; // 标记正在切换
        setSelectedCategory(targetCategory);
        setActiveArticleId(articleId);

        // 使用setTimeout确保DOM更新后再滚动
        setTimeout(() => {
          const element = articleRefs.current[articleId];
          if (element && contentRef.current) {
            const offsetTop = element.offsetTop - 100;
            contentRef.current.scrollTo({
              top: offsetTop, // 移除动画
            });
          }
          // 恢复滚动监听
          setTimeout(() => {
            isChangingCategory.current = false;
          }, 50); // 减少延迟
        }, 50); // 减少延迟
      } else {
        // 如果文章在当前category中，直接滚动
        const element = articleRefs.current[articleId];
        if (element && contentRef.current) {
          const offsetTop = element.offsetTop - 100;
          contentRef.current.scrollTo({
            top: offsetTop, // 移除动画
          });
          setActiveArticleId(articleId);
        }
      }
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
                activeArticleId={activeArticleId}
                onSelectCategory={handleCategorySelect}
                onArticleClick={handleArticleClick}
                selectedCategoryId={selectedCategory?._id || null}
                locale={locale}
              />
            ))}
          </div>
        </div>
        <div className={styles.content} ref={contentRef}>
          {selectedCategory &&
            selectedCategory.articles.map((article, index) => (
              <div
                key={article._id}
                ref={(el) => {
                  if (el) articleRefs.current[article._id] = el;
                }}
                className="wiki_articleSection__FJPDL"
              >
                <h1>
                  {locale === "en"
                    ? article.enTitle || article.title
                    : article.title}
                </h1>
                {article.image && (
                  <img
                    src={article.image}
                    alt={
                      locale === "en"
                        ? article.enTitle || article.title
                        : article.title
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
                      ? article.enContent || article.content
                      : article.content,
                  )}
                </ReactMarkdown>
              </div>
            ))}
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
